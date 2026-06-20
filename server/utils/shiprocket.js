import Settings from '../models/Settings.js';

/**
 * Gets or refreshes the Shiprocket authentication token.
 */
export const getShiprocketToken = async () => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }

    const { shiprocketEmail, shiprocketPassword, shiprocketToken, shiprocketTokenExpires } = settings;

    if (!shiprocketEmail || !shiprocketPassword) {
      console.log('Shiprocket credentials are not configured in settings. Skipping real API call.');
      return null;
    }

    // If token is still valid, return it
    if (shiprocketToken && shiprocketTokenExpires && new Date(shiprocketTokenExpires) > new Date()) {
      return shiprocketToken;
    }

    console.log('Fetching new Shiprocket authentication token...');
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      const token = data.token;
      
      // Token is valid for 10 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 9); 

      settings.shiprocketToken = token;
      settings.shiprocketTokenExpires = expires;
      await settings.save();

      return token;
    }
    return null;
  } catch (error) {
    console.error('Shiprocket Authentication Error:', error.message);
    return null;
  }
};

/**
 * Creates an order/shipment in Shiprocket.
 * @param {Object} order - Populated Order mongoose document.
 */
export const createShiprocketOrder = async (order) => {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      console.log(`[MOCK SHIPROCKET] Mocking shipment registration for Order ${order._id} (Prepaid/COD).`);
      return { success: true, mock: true, shipment_id: `SR_MOCK_${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
    }

    const items = order.orderItems.map((item) => ({
      name: item.title,
      sku: item.book.toString().substring(0, 10),
      units: item.qty || 1,
      selling_price: item.price,
    }));

    const dateStr = new Date(order.createdAt || Date.now()).toISOString().slice(0, 16).replace('T', ' ');

    const payload = {
      order_id: order._id.toString(),
      order_date: dateStr,
      pickup_location: 'Primary',
      billing_customer_name: order.user?.name || 'Guest Customer',
      billing_last_name: '',
      billing_address: order.shippingAddress?.street || 'No address provided',
      billing_city: order.shippingAddress?.city || 'Pune',
      billing_pincode: order.shippingAddress?.zipCode || '411001',
      billing_state: order.shippingAddress?.state || 'Maharashtra',
      billing_country: order.shippingAddress?.country || 'India',
      billing_email: order.user?.email || 'customer@example.com',
      billing_phone: order.user?.phone || '9876543210',
      shipping_is_billing: true,
      order_items: items,
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.totalPrice,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    };

    console.log(`Sending order ${order._id} to Shiprocket...`);
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Shiprocket order creation response:', data);
      return { success: true, mock: false, ...data };
    } else {
      console.error('Shiprocket Create Order Error response:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('Shiprocket Create Order Error:', error.message);
    return { success: false, error: error.message };
  }
};
