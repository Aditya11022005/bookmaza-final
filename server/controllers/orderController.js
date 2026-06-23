import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Royalty from '../models/Royalty.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail.js';
import { generatePresignedUrl } from '../utils/s3.js';
import crypto from 'crypto';
import { createShiprocketOrder } from '../utils/shiprocket.js';
import Settings from '../models/Settings.js';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, gstPercentage, tax, discount } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const isFreeClaim = totalPrice === 0;
      
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod: isFreeClaim ? 'Free Claim' : paymentMethod,
        itemsPrice,
        shippingPrice,
        gstPercentage: gstPercentage || 0,
        tax: tax || 0,
        discount: discount || 0,
        totalPrice,
        status: isFreeClaim ? 'Processing' : (paymentMethod === 'COD' ? 'Processing' : 'Pending'),
        isPaid: isFreeClaim ? true : false,
        paidAt: isFreeClaim ? Date.now() : undefined,
      });

      const createdOrder = await order.save();
      
      // If free claim, auto-grant library access and send confirmation email
      if (isFreeClaim) {
        try {
          const user = await User.findById(req.user._id);
          const digitalItems = orderItems.filter(item => item.format === 'ebook' || item.format === 'audiobook');
          if (digitalItems.length > 0) {
            user.purchasedBooks.push(...digitalItems.map(item => item.book));
            user.purchasedBooks = [...new Set(user.purchasedBooks.map(id => id.toString()))];
            await user.save();
          }
          await sendOrderConfirmationEmail(createdOrder._id);
        } catch (err) {
          console.error('Error handling Free Claim order creation post-actions:', err.message);
        }
      }
      // If COD, send confirmation email and register shipment with Shiprocket immediately
      else if (paymentMethod === 'COD') {
        try {
          const populatedOrder = await Order.findById(createdOrder._id).populate('user');
          await sendOrderConfirmationEmail(createdOrder._id);
          
          const hasHardcopy = orderItems.some(item => item.format === 'hardcopy');
          if (hasHardcopy) {
            await createShiprocketOrder(populatedOrder);
          }
        } catch (err) {
          console.error('Error handling COD order creation post-actions:', err.message);
        }
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// sendAdminOrderNotificationEmail notifies the admin of a new order
const sendAdminOrderNotificationEmail = async (orderId) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pustakmaza.com';
    const order = await Order.findById(orderId).populate('user');
    if (!order || !order.user) return;

    const itemsRowsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 13px;">${item.title} (${item.format})</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; text-align: center; font-size: 13px;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; text-align: right; font-size: 13px;">₹${item.price}</td>
      </tr>
    `).join('');

    const shippingInfoHtml = order.shippingAddress && order.shippingAddress.street ? `
      <div style="margin-top: 20px; padding: 15px; border: 1px solid #334155; border-radius: 12px; background-color: #1e293b; color: #cbd5e1;">
        <h4 style="color: #a855f7; margin-top: 0; font-size: 14px;">Shipping Address:</h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
    ` : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0b1329; color: #ffffff;">
        <h2 style="color: #a855f7; text-align: center; margin-bottom: 5px;">New Order Alert! 🔔</h2>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; font-family: monospace; margin-top: 0;">Order ID: ${order._id}</p>
        
        <p style="font-size: 15px; color: #cbd5e1;">Hi Admin,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
          A new order has been successfully placed on Pustak Maza. Here are the details of the purchase:
        </p>

        <h3 style="color: #a855f7; border-bottom: 1px solid #334155; padding-bottom: 5px; font-size: 15px;">Customer Details:</h3>
        <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 5px 0;">
          <b>Name:</b> ${order.user.name}<br>
          <b>Email:</b> ${order.user.email}<br>
          <b>Phone:</b> ${order.user.phone || 'N/A'}<br>
        </p>

        <h3 style="color: #a855f7; border-bottom: 1px solid #334155; padding-bottom: 5px; font-size: 15px; margin-top: 20px;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #1e293b; color: #a855f7;">
              <th style="padding: 10px; text-align: left; font-size: 13px;">Book Title</th>
              <th style="padding: 10px; text-align: center; width: 60px; font-size: 13px;">Qty</th>
              <th style="padding: 10px; text-align: right; width: 80px; font-size: 13px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 15px; text-align: right; font-size: 13px; color: #cbd5e1;">
          <p style="margin: 3px 0;">Subtotal: <b>₹${order.itemsPrice}</b></p>
          <p style="margin: 3px 0;">Shipping: <b>₹${order.shippingPrice}</b></p>
          <p style="margin: 5px 0; font-size: 16px; color: #a855f7; font-weight: bold;">Total Amount: <b>₹${order.totalPrice}</b></p>
        </div>

        <p style="font-size: 13px; color: #cbd5e1; margin-top: 15px;">
          Payment Method: <b>${order.paymentMethod}</b><br>
          Payment Status: <b style="color: ${order.isPaid ? '#10b981' : '#f59e0b'}">${order.isPaid ? 'Paid' : 'Pending (COD)'}</b>
        </p>

        ${shippingInfoHtml}

        <p style="font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; margin-top: 25px; text-align: center;">
          This is an automated notification from Pustak Maza Backend.
        </p>
      </div>
    `;

    await sendEmail({
      email: adminEmail,
      subject: `[NEW ORDER] Order Placed by ${order.user.name} - ₹${order.totalPrice}`,
      html: emailHtml
    });
  } catch (error) {
    console.error('Error sending admin order notification email:', error.message);
  }
};

// sendOrderConfirmationEmail sends a beautifully styled order confirmation email
const sendOrderConfirmationEmail = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order || !order.user) return;

    const digitalItems = order.orderItems.filter(item => item.format === 'ebook' || item.format === 'audiobook');
    const physicalItems = order.orderItems.filter(item => item.format === 'hardcopy');

    let digitalLinksHtml = '';
    if (order.isPaid && digitalItems.length > 0) {
      digitalLinksHtml = `
        <div style="margin-top: 20px; padding: 15px; background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; color: #ffffff;">
          <h3 style="color: #a855f7; margin-top: 0; font-size: 16px;">Your Digital Downloads:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
        `;
      for (const item of digitalItems) {
        const bookRecord = await Book.findById(item.book);
        if (bookRecord && bookRecord.formats[item.format]) {
          const formatKey = bookRecord.formats[item.format].fileUrl;
          if (formatKey) {
            const presignedUrl = await generatePresignedUrl(formatKey, 86400); // 24 hours
            digitalLinksHtml += `
              <li style="margin-bottom: 8px;">
                <strong>${item.title} (${item.format})</strong>: 
                <a href="${presignedUrl}" style="color: #c084fc; text-decoration: underline; font-weight: bold;">Download/Listen Here</a> (Link valid for 24h)
              </li>`;
          }
        }
      }
      digitalLinksHtml += `</ul></div>`;
    }

    const itemsRows = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 13px;">${item.title} (${item.format})</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; text-align: center; font-size: 13px;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; text-align: right; font-size: 13px;">₹${item.price}</td>
      </tr>
    `).join('');

    const shippingInfoHtml = order.shippingAddress && order.shippingAddress.street ? `
      <div style="margin-top: 20px; padding: 15px; border: 1px solid #334155; border-radius: 12px; background-color: #1e293b; color: #cbd5e1;">
        <h3 style="color: #a855f7; margin-top: 0; font-size: 14px;">Shipping Address:</h3>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
    ` : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0b1329; color: #ffffff;">
        <h2 style="color: #a855f7; text-align: center; margin-bottom: 5px;">Order Placed Successfully! 🛒</h2>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; font-family: monospace; margin-top: 0;">Order ID: ${order._id}</p>
        
        <p style="font-size: 15px; color: #cbd5e1;">Hi ${order.user.name},</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
          Thank you for shopping at Pustak Maza! We have successfully registered your order. 
          ${order.paymentMethod === 'COD' ? 'Your order will be shipped shortly, and you can pay Cash on Delivery.' : 'Your payment is confirmed, and your order is being processed.'}
        </p>

        <h3 style="color: #a855f7; border-bottom: 1px solid #334155; padding-bottom: 5px; font-size: 15px;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #1e293b; color: #a855f7;">
              <th style="padding: 10px; text-align: left; font-size: 13px;">Book Title</th>
              <th style="padding: 10px; text-align: center; width: 60px; font-size: 13px;">Qty</th>
              <th style="padding: 10px; text-align: right; width: 80px; font-size: 13px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="margin-top: 15px; text-align: right; font-size: 13px; color: #cbd5e1;">
          <p style="margin: 3px 0;">Subtotal: <b>₹${order.itemsPrice}</b></p>
          <p style="margin: 3px 0;">Shipping: <b>₹${order.shippingPrice}</b></p>
          <p style="margin: 5px 0; font-size: 16px; color: #a855f7; font-weight: bold;">Total Amount: <b>₹${order.totalPrice}</b></p>
        </div>

        <p style="font-size: 13px; color: #cbd5e1; margin-top: 15px;">
          Payment Method: <b>${order.paymentMethod}</b><br>
          Payment Status: <b style="color: ${order.isPaid ? '#10b981' : '#f59e0b'}">${order.isPaid ? 'Paid' : 'Pending (COD)'}</b>
        </p>

        ${shippingInfoHtml}
        ${digitalLinksHtml}

        <p style="font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; margin-top: 25px; text-align: center;">
          Need help? Contact support or log in to your account.
        </p>
        <p style="font-size: 14px; font-weight: bold; color: #a855f7; text-align: center; margin-top: 10px;">The Pustak Maza Team</p>
      </div>
    `;

    await sendEmail({
      email: order.user.email,
      subject: `Order Confirmation - Pustak Maza [${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}]`,
      html: emailHtml
    });

    // Notify the admin of the new purchase
    await sendAdminOrderNotificationEmail(orderId);
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
  }
};

// sendShippingStatusUpdateEmail notifies the user of order status changes (Shipped, Delivered, etc.)
const sendShippingStatusUpdateEmail = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order || !order.user) return;

    let statusText = 'Processing';
    let statusDescription = 'Your order is currently being processed by our packaging team.';
    if (order.status === 'Shipped') {
      statusText = 'Shipped / Out for Delivery';
      statusDescription = `Great news! Your physical items have been shipped and are on their way.`;
    } else if (order.status === 'Delivered') {
      statusText = 'Delivered';
      statusDescription = 'Your order has been marked as Delivered. We hope you enjoy your new books!';
    } else if (order.status === 'Cancelled') {
      statusText = 'Cancelled';
      statusDescription = 'Your order has been cancelled.';
    }

    let trackingHtml = '';
    if (order.trackingNumber) {
      trackingHtml = `
        <div style="margin-top: 15px; padding: 12px; background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; text-align: center;">
          <span style="color: #cbd5e1; font-size: 13px;">Tracking Number / AWB: </span>
          <strong style="color: #a855f7; font-family: monospace; font-size: 14px;">${order.trackingNumber}</strong>
        </div>
      `;
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0b1329; color: #ffffff;">
        <h2 style="color: #a855f7; text-align: center; margin-bottom: 5px;">Order Status Update 📦</h2>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; font-family: monospace; margin-top: 0;">Order ID: ${order._id}</p>

        <p style="font-size: 15px; color: #cbd5e1;">Hi ${order.user.name},</p>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">
          The status of your order has been updated to: <b style="color: #a855f7; text-transform: uppercase;">${statusText}</b>
        </p>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
          ${statusDescription}
        </p>

        ${trackingHtml}

        <div style="margin-top: 20px; padding: 15px; border: 1px solid #334155; border-radius: 12px; background-color: #1e293b; color: #cbd5e1; font-size: 13px;">
          <h4 style="margin: 0 0 5px 0; color: #a855f7; font-size: 14px;">Order Details:</h4>
          Total Price: <b>₹${order.totalPrice}</b><br>
          Payment Method: <b>${order.paymentMethod}</b>
        </div>

        <p style="font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; margin-top: 25px; text-align: center;">
          Need help? Contact support or log in to your account.
        </p>
        <p style="font-size: 14px; font-weight: bold; color: #a855f7; text-align: center; margin-top: 10px;">The Pustak Maza Team</p>
      </div>
    `;

    await sendEmail({
      email: order.user.email,
      subject: `Order Status Update: ${statusText} - Pustak Maza [${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}]`,
      html: emailHtml
    });
  } catch (error) {
    console.error('Error sending order status email:', error.message);
  }
};

// internal helper to grant access and email user
const processSuccessfulPayment = async (orderId) => {
  const order = await Order.findById(orderId).populate('user');
  if (!order || order.isPaid) return;

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'Processing';
  await order.save();

  // Process Author Royalty Split
  for (const item of order.orderItems) {
    try {
      const bookRecord = await Book.findById(item.book);
      if (bookRecord && bookRecord.author) {
        const authorUser = await User.findById(bookRecord.author);
        const splitPct = authorUser && authorUser.royaltyPercentage !== undefined ? authorUser.royaltyPercentage : 25;
        const salesPrice = (item.price || 0) * (item.qty || 1);
        const royaltyAmount = salesPrice * (splitPct / 100);
        
        // Save Royalty Record
        const royalty = new Royalty({
          author: bookRecord.author,
          book: bookRecord._id,
          order: order._id,
          salesPrice,
          royaltyPercentage: splitPct,
          royaltyAmount,
          status: 'accrued'
        });
        await royalty.save();
        
        // Credit Author Wallet
        await User.findByIdAndUpdate(bookRecord.author, {
          $inc: { walletBalance: royaltyAmount }
        });
      }
    } catch (err) {
      console.error(`Royalty processing failed for book ${item.book}:`, err);
    }
  }

  const user = await User.findById(order.user._id);
  const digitalItems = order.orderItems.filter(item => item.format === 'ebook' || item.format === 'audiobook');

  if (digitalItems.length > 0) {
    user.purchasedBooks.push(...digitalItems.map(item => item.book));
    user.purchasedBooks = [...new Set(user.purchasedBooks.map(id => id.toString()))];
    await user.save();
  }

  // Send Order Confirmation Email with access links built-in
  await sendOrderConfirmationEmail(orderId);

  // If order contains hardcopy items, push shipment to Shiprocket
  const hasHardcopy = order.orderItems.some(item => item.format === 'hardcopy');
  if (hasHardcopy) {
    try {
      await createShiprocketOrder(order);
    } catch (shiprocketErr) {
      console.error('Shiprocket shipment registration error on payment success:', shiprocketErr.message);
    }
  }
};

// @desc    Update order to paid via client polling
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
  try {
     await processSuccessfulPayment(req.params.id);
     const order = await Order.findById(req.params.id);
     res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/orders/webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await processSuccessfulPayment(orderId);
    }
  }
  res.json({ received: true });
};

// @desc    Update order to delivered / update shipping status
// @route   PUT /api/orders/:id/deliver
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.status;
      const newStatus = req.body.status || 'Delivered';
      
      order.status = newStatus;
      
      if (newStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        
        // If it is COD and is delivered, it means payment is collected
        if (order.paymentMethod === 'COD' && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }
      
      if (req.body.trackingNumber !== undefined) {
        order.trackingNumber = req.body.trackingNumber;
      }

      if (req.body.courierPartner !== undefined) {
        order.courierPartner = req.body.courierPartner;
      }

      // Add a record to tracking history
      if (req.body.historyDescription) {
        order.trackingHistory.push({
          status: newStatus,
          description: req.body.historyDescription,
          timestamp: Date.now()
        });
      } else if (oldStatus !== newStatus || order.trackingHistory.length === 0) {
        let desc = `Order status updated to ${newStatus}`;
        if (newStatus === 'Shipped') {
          desc = `Package shipped via ${order.courierPartner || 'Shiprocket'} (AWB: ${order.trackingNumber || 'N/A'})`;
        }
        order.trackingHistory.push({
          status: newStatus,
          description: desc,
          timestamp: Date.now()
        });
      }

      const updatedOrder = await order.save();

      // Trigger status update email
      if (oldStatus !== newStatus || req.body.trackingNumber) {
        try {
          await sendShippingStatusUpdateEmail(order._id);
        } catch (emailErr) {
          console.error('Failed to send status update email:', emailErr.message);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      $or: [ { paymentMethod: 'COD' }, { isPaid: true } ]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [ { paymentMethod: 'COD' }, { isPaid: true } ]
    }).populate('user', 'id name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // in INR (not paise)
    
    // Retrieve dynamic keys from database settings
    const settings = await Settings.findOne({});
    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123';
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `rzp_order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // If keySecret is provided, we can attempt to make a real call to Razorpay API
    if (keySecret) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          razorpayOrderId = data.id;
        } else {
          console.warn('Razorpay API order creation failed, falling back to mock Order ID');
        }
      } catch (err) {
        console.warn('Razorpay API request failed (possibly offline), falling back to mock Order ID');
      }
    }

    res.json({
      id: razorpayOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      key: keyId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/orders/razorpay-verify
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      orderId, // MongoDB order ID
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = req.body;

    const settings = await Settings.findOne({});
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    // Signature verification logic
    if (keySecret) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    } else {
      console.warn('No RAZORPAY_KEY_SECRET found, skipping signature verification in development');
    }

    // Mark order as paid
    await processSuccessfulPayment(orderId);
    
    // Update order with payment details
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentResult = {
        id: razorpayPaymentId,
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };
      order.paymentMethod = 'Razorpay';
      await order.save();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/payment-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd', 
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createPaymentIntent,
  handleStripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment
};
