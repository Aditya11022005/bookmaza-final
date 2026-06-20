import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    gstPercentage: { type: Number, required: true, default: 18 },
    shippingCost: { type: Number, required: true, default: 99 },
    shiprocketEmail: { type: String, default: '' },
    shiprocketPassword: { type: String, default: '' },
    shiprocketToken: { type: String, default: '' },
    shiprocketTokenExpires: { type: Date },
    storeName: { type: String, default: 'Pustak Maza' },
    supportEmail: { type: String, default: 'support@pustakmaza.com' },
    contactPhone: { type: String, default: '+91 93224 65522' },
    contactWhatsApp: { type: String, default: '919322465522' },
    contactAddress: { type: String, default: 'Pustak Maza HQ, Pune, Maharashtra, India' },
    contactHours: { type: String, default: 'Mon - Sat: 9:00 AM - 6:00 PM' },
    defaultRoyaltyPercentage: { type: Number, default: 25 },
    autoApproveAuthors: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
