import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from './models/Book.js';
import User from './models/User.js';
import Category from './models/Category.js';

dotenv.config();

const runTest = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pustakmaza');
    console.log('Database connected!');

    // 1. Setup Test Admin/Author and Category
    let author = await User.findOne({ role: 'admin' });
    if (!author) {
      author = await User.findOne({});
    }
    
    let category = await Category.findOne({});
    if (!category) {
      category = await Category.create({ name: 'Fiction', slug: 'fiction' });
    }

    console.log(`Using Author: ${author.name} (${author._id})`);
    console.log(`Using Category: ${category.name} (${category._id})`);

    // Clean up any old test books first
    await Book.deleteMany({ title: /Test Announcement Book/ });

    // 2. Create an upcoming announced book (launching tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const announcedBook = await Book.create({
      title: 'Test Announcement Book (Upcoming)',
      author: author._id,
      authorName: author.name,
      description: 'Suspenseful science fiction novel launching tomorrow.',
      category: category._id,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
      isPublished: false,
      isAnnounced: true,
      launchDate: tomorrow,
      formats: {
        ebook: { isAvailable: true, price: 199 }
      }
    });

    console.log(`Created Upcoming Book: "${announcedBook.title}" with launch date: ${announcedBook.launchDate}`);

    // 3. Test endpoint logic: Get active announcement (should return the upcoming book)
    const upcomingLaunch = await Book.findOne({
      isAnnounced: true,
      launchDate: { $gt: new Date() }
    }).sort({ launchDate: 1 });

    if (upcomingLaunch && upcomingLaunch._id.toString() === announcedBook._id.toString()) {
      console.log('✅ TEST PASSED: Upcoming announcement correctly returned!');
    } else {
      console.error('❌ TEST FAILED: Upcoming announcement query returned:', upcomingLaunch);
    }

    // 4. Test public listing filter: The upcoming announced book should NOT appear in getBooks public list
    const publicBooksBefore = await Book.find({
      $or: [
        { isPublished: true },
        { isAnnounced: true, launchDate: { $lte: new Date() } }
      ]
    });

    const isUpcomingInList = publicBooksBefore.some(b => b._id.toString() === announcedBook._id.toString());
    if (!isUpcomingInList) {
      console.log('✅ TEST PASSED: Upcoming book is NOT visible in public listings before launch date!');
    } else {
      console.error('❌ TEST FAILED: Upcoming book was found in public listings before launch date!');
    }

    // 5. Shift launch date to past (simulate time elapsed)
    announcedBook.launchDate = new Date(Date.now() - 60000); // 1 minute ago
    await announcedBook.save();
    console.log('Updated launch date to 1 minute ago (simulating launch time arrival)...');

    // 6. Test public listing filter again: The announced book should NOW automatically appear
    const publicBooksAfter = await Book.find({
      $or: [
        { isPublished: true },
        { isAnnounced: true, launchDate: { $lte: new Date() } }
      ]
    });

    const isLaunchedInList = publicBooksAfter.some(b => b._id.toString() === announcedBook._id.toString());
    if (isLaunchedInList) {
      console.log('✅ TEST PASSED: Announced book became automatically visible in public listings after launch time!');
    } else {
      console.error('❌ TEST FAILED: Announced book did NOT become visible in public listings after launch time!');
    }

    // Clean up
    await Book.findByIdAndDelete(announcedBook._id);
    console.log('Cleaned up test book.');
    
    await mongoose.disconnect();
    console.log('Database disconnected. Verification finished.');
  } catch (err) {
    console.error('Error during test execution:', err);
    process.exit(1);
  }
};

runTest();
