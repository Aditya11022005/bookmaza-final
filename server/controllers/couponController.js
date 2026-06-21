import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new coupon (Admin)
// @route   POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchaseAmount, expiryDate, usageLimit } = req.body;
    
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      expiryDate,
      usageLimit
    });

    // Asynchronously send notification emails to all registered customers
    User.find({ role: 'customer' }).select('email name')
      .then(users => {
        users.forEach(async (usr) => {
          try {
            await sendEmail({
              email: usr.email,
              subject: '🎉 New Discount Coupon Alert - Pustak Maza!',
              html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
                  <h1 style="color: #6A0DAD; text-align: center;">Pustak Maza</h1>
                  <h2 style="color: #333;">Special Coupon Code: <span style="background-color: #f5f3ff; color: #6A0DAD; padding: 5px 12px; border-radius: 6px; border: 1px dashed #6A0DAD;">${code}</span></h2>
                  <p>Hi ${usr.name},</p>
                  <p>A new discount offer has just been created! Enjoy <strong>${discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`} off</strong> on your next purchase.</p>
                  <p><strong>Minimum Purchase Required:</strong> ₹${minPurchaseAmount || 0}</p>
                  <p><strong>Expiry Date:</strong> ${expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" style="background-color: #6A0DAD; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Shop Now</a>
                  </div>
                  <p style="color: #666; font-size: 11px;">You received this email because you registered on Pustak Maza.</p>
                </div>
              `
            });
          } catch (e) {
            console.error(`Failed to send coupon email to ${usr.email}:`, e.message);
          }
        });
      })
      .catch(err => console.error('Failed to retrieve customers for coupon notify:', err.message));

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate and apply a coupon (Customer)
// @route   POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code, isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (orderAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount of $${coupon.minPurchaseAmount} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    }

    res.json({
      _id: coupon._id,
      code: coupon.code,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      coupon.code = req.body.code || coupon.code;
      coupon.discountType = req.body.discountType || coupon.discountType;
      coupon.discountValue = req.body.discountValue !== undefined ? req.body.discountValue : coupon.discountValue;
      coupon.minPurchaseAmount = req.body.minPurchaseAmount !== undefined ? req.body.minPurchaseAmount : coupon.minPurchaseAmount;
      coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
      coupon.usageLimit = req.body.usageLimit !== undefined ? req.body.usageLimit : coupon.usageLimit;
      coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCoupons, createCoupon, deleteCoupon, validateCoupon, updateCoupon };
