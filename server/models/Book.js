import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    description: { type: String, required: true },
    summaryEn: { type: String },
    summaryMr: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    
    formats: {
      ebook: {
        isAvailable: { type: Boolean, default: false },
        price: { type: Number, default: 0 },
        fileUrl: { type: String },
        pdfUrl: { type: String },
        epubUrl: { type: String },
        docxUrl: { type: String },
      },
      audiobook: {
        isAvailable: { type: Boolean, default: false },
        price: { type: Number, default: 0 },
        fileUrl: { type: String },
        duration: { type: String },
        chapters: [
          {
            title: { type: String, required: true },
            fileUrl: { type: String, required: true },
            duration: { type: String }
          }
        ]
      },
      hardcopy: {
        isAvailable: { type: Boolean, default: false },
        price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
      }
    },

    coverImage: { type: String, required: true }, // Cloudinary/Local URL
    images: [{ type: String }],
    isbn: { type: String },
    discountPercentage: { type: Number, default: 0 },
    pages: { type: Number },
    publisher: { type: String },
    publishYear: { type: Number },
    language: { type: String, default: 'Marathi' },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookSchema.index({ author: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ isPublished: 1 });

const Book = mongoose.model('Book', bookSchema);
export default Book;
