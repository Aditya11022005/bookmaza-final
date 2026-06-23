import Progress from '../models/Progress.js';
import User from '../models/User.js';

// @desc    Get progress for a specific book and format
// @route   GET /api/progress/:bookId/:format
const getProgress = async (req, res) => {
  try {
    const { bookId, format } = req.params;
    
    const progress = await Progress.findOne({
      user: req.user._id,
      book: bookId,
      format,
    });

    if (progress) {
      res.json(progress);
    } else {
      res.json({ position: 0, percentage: 0 }); // Default state
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update progress
// @route   POST /api/progress
const updateProgress = async (req, res) => {
  try {
    const { bookId, format, position, percentage, bookmarks, highlights } = req.body;

    let progress = await Progress.findOne({
      user: req.user._id,
      book: bookId,
      format,
    });

    if (progress) {
      if (position !== undefined) progress.position = position;
      if (percentage !== undefined) progress.percentage = percentage;
      if (bookmarks !== undefined) progress.bookmarks = bookmarks;
      if (highlights !== undefined) progress.highlights = highlights;
      progress.lastAccessed = Date.now();
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        book: bookId,
        format,
        position: position || 0,
        percentage: percentage || 0,
        bookmarks: bookmarks || [],
        highlights: highlights || [],
      });
    }

    // Gamification: Update user reading streak and badges
    const user = await User.findById(req.user._id);
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActive = user.streak?.lastActive ? new Date(user.streak.lastActive) : null;
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streak.count += 1;
          user.streak.lastActive = Date.now();
        } else if (diffDays > 1) {
          user.streak.count = 1;
          user.streak.lastActive = Date.now();
        }
      } else {
        user.streak = {
          count: 1,
          lastActive: Date.now()
        };
      }

      // Check badge qualifications
      if (user.streak.count >= 3 && !user.badges.includes('3-Day Streak')) {
        user.badges.push('3-Day Streak');
      }
      if (user.streak.count >= 7 && !user.badges.includes('7-Day Scholar')) {
        user.badges.push('7-Day Scholar');
      }
      if (percentage >= 100 && !user.badges.includes('Book Worm')) {
        user.badges.push('Book Worm');
      }

      await user.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all progress for logged-in user
// @route   GET /api/progress/all
const getAllProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id });
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProgress, updateProgress, getAllProgress };
