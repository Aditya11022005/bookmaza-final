import mongoose from 'mongoose';

const royaltySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    salesPrice: { type: Number, required: true },
    royaltyPercentage: { type: Number, default: 25 },
    royaltyAmount: { type: Number, required: true },
    status: { type: String, enum: ['accrued', 'pending_withdrawal', 'withdrawn'], default: 'accrued' }
  },
  { timestamps: true }
);

const Royalty = mongoose.model('Royalty', royaltySchema);
export default Royalty;
