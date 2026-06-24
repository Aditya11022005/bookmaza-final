import Settings from '../models/Settings.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({
        gstPercentage: 18,
        shippingCost: 99,
        defaultRoyaltyPercentage: 25,
        autoApproveAuthors: false
      });
    }
    
    const settingsObj = settings.toObject();
    if (settingsObj.shiprocketPassword) {
      settingsObj.shiprocketPassword = '********';
    }
    if (settingsObj.razorpayKeySecret) {
      settingsObj.razorpayKeySecret = '********';
    }
    
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { 
      gstPercentage, 
      shippingCost, 
      shiprocketEmail, 
      shiprocketPassword,
      storeName,
      supportEmail,
      contactPhone,
      contactWhatsApp,
      contactAddress,
      contactAddress2,
      contactHours,
      defaultRoyaltyPercentage,
      autoApproveAuthors,
      razorpayKeyId,
      razorpayKeySecret
    } = req.body;
    
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
    }

    if (gstPercentage !== undefined) settings.gstPercentage = gstPercentage;
    if (shippingCost !== undefined) settings.shippingCost = shippingCost;
    if (shiprocketEmail !== undefined) settings.shiprocketEmail = shiprocketEmail;
    if (shiprocketPassword !== undefined) {
      settings.shiprocketPassword = shiprocketPassword;
      // Invalidate existing token to force refresh on next use
      settings.shiprocketToken = '';
      settings.shiprocketTokenExpires = null;
    }
    
    if (storeName !== undefined) settings.storeName = storeName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (contactWhatsApp !== undefined) settings.contactWhatsApp = contactWhatsApp;
    if (contactAddress !== undefined) settings.contactAddress = contactAddress;
    if (contactAddress2 !== undefined) settings.contactAddress2 = contactAddress2;
    if (contactHours !== undefined) settings.contactHours = contactHours;
    if (defaultRoyaltyPercentage !== undefined) settings.defaultRoyaltyPercentage = defaultRoyaltyPercentage;
    if (autoApproveAuthors !== undefined) settings.autoApproveAuthors = autoApproveAuthors;
    if (razorpayKeyId !== undefined) settings.razorpayKeyId = razorpayKeyId;
    if (razorpayKeySecret !== undefined) settings.razorpayKeySecret = razorpayKeySecret;

    const updatedSettings = await settings.save();
    
    const settingsObj = updatedSettings.toObject();
    if (settingsObj.shiprocketPassword) {
      settingsObj.shiprocketPassword = '********';
    }
    if (settingsObj.razorpayKeySecret) {
      settingsObj.razorpayKeySecret = '********';
    }
    
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
