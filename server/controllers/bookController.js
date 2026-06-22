import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import Book from '../models/Book.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { translateToMarathi } from '../utils/translator.js';
import { cloudinary } from '../utils/cloudinary.js';

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

    let query = Book.find(filter);
    if (req.query.all !== 'true') {
      query = query.select('title subtitle authorName coverImage category formats rating numReviews price isPublished createdAt');
    }
    const books = await query.populate('category', 'name slug');
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
      summaryMr,
      coAuthor,
      chiefEditor,
      editor,
      amazonLink,
      flipkartLink,
      pothiLink
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
      coAuthor,
      chiefEditor,
      editor,
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
      amazonLink,
      flipkartLink,
      pothiLink
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
      summaryMr,
      coAuthor,
      chiefEditor,
      editor,
      amazonLink,
      flipkartLink,
      pothiLink
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      if (req.user.role === 'author' && book.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this book' });
      }

      book.title = title || book.title;
      book.description = description || book.description;
      book.category = category || book.category;
      if (formats) {
        if (formats.ebook) {
          book.formats.ebook.isAvailable = formats.ebook.isAvailable !== undefined ? formats.ebook.isAvailable : book.formats.ebook.isAvailable;
          book.formats.ebook.isFree = formats.ebook.isFree !== undefined ? formats.ebook.isFree : book.formats.ebook.isFree;
          book.formats.ebook.price = formats.ebook.price !== undefined ? formats.ebook.price : book.formats.ebook.price;
          book.formats.ebook.fileUrl = formats.ebook.fileUrl !== undefined ? formats.ebook.fileUrl : book.formats.ebook.fileUrl;
          book.formats.ebook.pdfUrl = formats.ebook.pdfUrl !== undefined ? formats.ebook.pdfUrl : book.formats.ebook.pdfUrl;
          book.formats.ebook.epubUrl = formats.ebook.epubUrl !== undefined ? formats.ebook.epubUrl : book.formats.ebook.epubUrl;
          book.formats.ebook.docxUrl = formats.ebook.docxUrl !== undefined ? formats.ebook.docxUrl : book.formats.ebook.docxUrl;
        }
        if (formats.audiobook) {
          book.formats.audiobook.isAvailable = formats.audiobook.isAvailable !== undefined ? formats.audiobook.isAvailable : book.formats.audiobook.isAvailable;
          book.formats.audiobook.isFree = formats.audiobook.isFree !== undefined ? formats.audiobook.isFree : book.formats.audiobook.isFree;
          book.formats.audiobook.price = formats.audiobook.price !== undefined ? formats.audiobook.price : book.formats.audiobook.price;
          book.formats.audiobook.fileUrl = formats.audiobook.fileUrl !== undefined ? formats.audiobook.fileUrl : book.formats.audiobook.fileUrl;
          book.formats.audiobook.duration = formats.audiobook.duration !== undefined ? formats.audiobook.duration : book.formats.audiobook.duration;
          book.formats.audiobook.chapters = formats.audiobook.chapters !== undefined ? formats.audiobook.chapters : book.formats.audiobook.chapters;
        }
        if (formats.hardcopy) {
          book.formats.hardcopy.isAvailable = formats.hardcopy.isAvailable !== undefined ? formats.hardcopy.isAvailable : book.formats.hardcopy.isAvailable;
          book.formats.hardcopy.price = formats.hardcopy.price !== undefined ? formats.hardcopy.price : book.formats.hardcopy.price;
          book.formats.hardcopy.stock = formats.hardcopy.stock !== undefined ? formats.hardcopy.stock : book.formats.hardcopy.stock;
        }
      }
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
      book.coAuthor = coAuthor !== undefined ? coAuthor : book.coAuthor;
      book.chiefEditor = chiefEditor !== undefined ? chiefEditor : book.chiefEditor;
      book.editor = editor !== undefined ? editor : book.editor;
      book.amazonLink = amazonLink !== undefined ? amazonLink : book.amazonLink;
      book.flipkartLink = flipkartLink !== undefined ? flipkartLink : book.flipkartLink;
      book.pothiLink = pothiLink !== undefined ? pothiLink : book.pothiLink;

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

      book.markModified('formats');
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

// @desc    Delete book review
// @route   DELETE /api/books/:id/reviews/:reviewId
// @access  Private/Admin
const deleteBookReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviewId = req.params.reviewId;
    const initialLength = book.reviews.length;
    book.reviews = book.reviews.filter(r => r._id.toString() !== reviewId);

    if (book.reviews.length === initialLength) {
      return res.status(404).json({ message: 'Review not found' });
    }

    book.numReviews = book.reviews.length;
    book.rating = book.reviews.length > 0 
      ? book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length 
      : 0;

    await book.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Proxy PDF files to avoid CORS issues
// @route   GET /api/books/pdf-proxy
const proxyPdf = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: 'URL query parameter is required' });
    }

    const decodedUrl = decodeURIComponent(url);
    console.log('[PDF Proxy] Incoming proxy request for:', decodedUrl);

    // 1. Check if it's a local file inside public/uploads to serve it directly
    if (decodedUrl.includes('/uploads/')) {
      const pathIndex = decodedUrl.indexOf('/uploads/');
      const relativePath = decodedUrl.substring(pathIndex); // e.g. /uploads/filename.pdf
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      console.log('[PDF Proxy] Local file path matched:', filePath);
      if (fs.existsSync(filePath)) {
        console.log('[PDF Proxy] Local file exists. Serving directly.');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="book.pdf"');
        return res.sendFile(filePath);
      } else {
        console.warn('[PDF Proxy] Local file does not exist on disk.');
      }
    }

    let targetUrl = decodedUrl;
    if (decodedUrl.includes('cloudinary.com')) {
      const cldMatch = decodedUrl.match(/res\.cloudinary\.com\/[^/]+\/([^/]+)\/([^/]+)\/(?:v\d+\/)?(.+)$/);
      if (cldMatch && cldMatch[1] && cldMatch[2] && cldMatch[3]) {
        const resourceType = cldMatch[1];
        const deliveryType = cldMatch[2];
        let publicId = cldMatch[3];
        publicId = publicId.split('?')[0].split('#')[0];
        try {
          const signedUrl = cloudinary.url(publicId, {
            resource_type: resourceType,
            type: deliveryType,
            sign_url: true,
            secure: true
          });
          targetUrl = signedUrl;
          console.log('[PDF Proxy] Universal signed Cloudinary URL generated:', targetUrl);
        } catch (signErr) {
          console.error('Failed to sign Cloudinary URL, using original:', signErr);
        }
      }
    }

    console.log('[PDF Proxy] Fetching target URL:', targetUrl);
    // 2. Fetch the remote PDF (Cloudinary, S3, etc.)
    const response = await fetch(targetUrl);
    console.log('[PDF Proxy] Fetch response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('[PDF Proxy] Remote fetch failed with status:', response.status);
      return res.status(response.status).json({ message: `Failed to fetch PDF: ${response.statusText}` });
    }

    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="book.pdf"');

    // Handle buffer conversion as fallback if stream piping fails or is unsupported
    try {
      if (response.body && typeof Readable.fromWeb === 'function') {
        Readable.fromWeb(response.body).pipe(res);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (streamError) {
      console.warn('Streaming failed, falling back to buffer:', streamError.message);
      try {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      } catch (bufError) {
        console.error('Buffer fallback failed:', bufError);
        if (!res.headersSent) {
          res.status(500).json({ message: `Failed to stream PDF: ${streamError.message}` });
        }
      }
    }
  } catch (error) {
    console.error('PDF proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

export { getBooks, getBookById, createBook, updateBook, deleteBook, createBookReview, deleteBookReview, proxyPdf };
