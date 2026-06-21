import Book from '../models/Book.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { translateToMarathi } from '../utils/translator.js';

// @desc    Fetch all books
// @route   GET /api/books
const getBooks = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const filter = { ...keyword };
    if (req.query.all !== 'true') {
      filter.isPublished = true;
    }
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const books = await Book.find(filter)
      .select('title subtitle authorName coverImage category formats rating numReviews price isPublished createdAt')
      .populate('category', 'name slug');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single book
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('author', 'name email');
    if (book) {
      let needsSave = false;
      if (!book.summaryEn) {
        book.summaryEn = book.description || 'No English summary available.';
        needsSave = true;
      }
      if (!book.summaryMr) {
        book.summaryMr = await translateToMarathi(book.summaryEn);
        needsSave = true;
      }
      if (needsSave) {
        await book.save();
      }
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a book
// @route   POST /api/books
const createBook = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      formats, 
      coverImage, 
      images,
      isPublished,
      isbn,
      discountPercentage,
      pages,
      publisher,
      publishYear,
      language,
      authorName,
      summaryEn,
      summaryMr
    } = req.body;
    
    const parsedSummaryEn = summaryEn || description || '';
    let parsedSummaryMr = summaryMr || '';
    if (!parsedSummaryMr && parsedSummaryEn) {
      parsedSummaryMr = await translateToMarathi(parsedSummaryEn);
    }

    const book = new Book({
      title,
      author: req.user._id,
      authorName: authorName || req.user.name,
      description,
      summaryEn: parsedSummaryEn,
      summaryMr: parsedSummaryMr,
      category,
      formats,
      coverImage,
      images: Array.isArray(images) ? images : [],
      isPublished,
      isbn,
      discountPercentage: Number(discountPercentage) || 0,
      pages: Number(pages) || undefined,
      publisher,
      publishYear: Number(publishYear) || undefined,
      language: language || 'Marathi',
    });

    const createdBook = await book.save();

    // Asynchronously send notification emails to all registered customers about the new book launch
    if (createdBook.isPublished) {
      User.find({ role: 'customer' }).select('email name')
        .then(users => {
          users.forEach(async (usr) => {
            try {
              await sendEmail({
                email: usr.email,
                subject: `📚 New Book Launch: "${title}" by ${createdBook.authorName}`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #6A0DAD; text-align: center;">Pustak Maza</h1>
                    <h2 style="color: #333; text-align: center;">New Book Released!</h2>
                    <div style="text-align: center; margin: 20px 0;">
                      <img src="${coverImage}" alt="${title}" style="max-height: 250px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                    </div>
                    <h3 style="color: #111; text-align: center; margin-top: 10px;">${title}</h3>
                    <p style="text-align: center; color: #666; font-weight: bold; margin-bottom: 20px;">By ${createdBook.authorName}</p>
                    <p>Hi ${usr.name},</p>
                    <p>We are excited to announce a new book launch on Pustak Maza! Explore our latest publication and get your copy today.</p>
                    <p style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-style: italic; color: #444;">
                      "${description ? description.substring(0, 180) + '...' : 'Explore the full description on our site.'}"
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/book/${createdBook._id}" style="background-color: #6A0DAD; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Read / Listen Now</a>
                    </div>
                    <p style="color: #666; font-size: 11px;">You received this email because you registered on Pustak Maza.</p>
                  </div>
                `
              });
            } catch (e) {
              console.error(`Failed to send new book email to ${usr.email}:`, e.message);
            }
          });
        })
        .catch(err => console.error('Failed to retrieve customers for book launch notify:', err.message));
    }

    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      formats, 
      coverImage, 
      images,
      isPublished,
      isbn,
      discountPercentage,
      pages,
      publisher,
      publishYear,
      language,
      authorName,
      summaryEn,
      summaryMr
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      if (req.user.role === 'author' && book.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this book' });
      }

      book.title = title || book.title;
      book.description = description || book.description;
      book.category = category || book.category;
      book.formats = formats || book.formats;
      book.coverImage = coverImage || book.coverImage;
      book.images = Array.isArray(images) ? images : book.images;
      book.isPublished = isPublished !== undefined ? isPublished : book.isPublished;
      book.isbn = isbn !== undefined ? isbn : book.isbn;
      book.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : book.discountPercentage;
      book.pages = pages !== undefined ? Number(pages) : book.pages;
      book.publisher = publisher !== undefined ? publisher : book.publisher;
      book.publishYear = publishYear !== undefined ? Number(publishYear) : book.publishYear;
      book.language = language || book.language;
      book.authorName = authorName || book.authorName;

      // Update summaries
      const nextSummaryEn = summaryEn || (description ? description : book.summaryEn);
      let nextSummaryMr = summaryMr || '';
      
      if (nextSummaryEn) {
        book.summaryEn = nextSummaryEn;
        if (!nextSummaryMr) {
          nextSummaryMr = await translateToMarathi(nextSummaryEn);
        }
      }
      if (nextSummaryMr) {
        book.summaryMr = nextSummaryMr;
      }

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      if (req.user.role === 'author' && book.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this book' });
      }
      
      await book.deleteOne();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/books/:id/reviews
const createBookReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      const alreadyReviewed = book.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Book already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      book.reviews.push(review);
      book.numReviews = book.reviews.length;
      book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

      await book.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getBooks, getBookById, createBook, updateBook, deleteBook, createBookReview };
