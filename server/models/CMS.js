import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true }, // 'home', 'about', 'contact', 'privacy', 'terms', 'faq'
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON content blocks
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const CMS = mongoose.model('CMS', cmsSchema);
export default CMS;
