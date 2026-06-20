import Coupon from '../models/Coupon.js';

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
