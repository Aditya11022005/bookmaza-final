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
    res.json(settings);
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
      contactHours,
      defaultRoyaltyPercentage,
      autoApproveAuthors
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
    if (contactHours !== undefined) settings.contactHours = contactHours;
    if (defaultRoyaltyPercentage !== undefined) settings.defaultRoyaltyPercentage = defaultRoyaltyPercentage;
    if (autoApproveAuthors !== undefined) settings.autoApproveAuthors = autoApproveAuthors;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
