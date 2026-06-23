import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    format: { type: String, enum: ['ebook', 'audiobook'], required: true },
    position: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    bookmarks: [
      {
        page: { type: Number, required: true },
        label: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    highlights: [
      {
        page: { type: Number, required: true },
        text: { type: String, required: true },
        color: { type: String, default: 'yellow' },
        note: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, book: 1, format: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
