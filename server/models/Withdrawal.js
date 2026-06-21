import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    paymentDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String
    },
    transactionId: String,
    processedAt: Date
  },
  { timestamps: true }
);

withdrawalSchema.index({ author: 1 });
withdrawalSchema.index({ status: 1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
