import CMS from '../models/CMS.js';

// @desc    Get CMS page content
// @route   GET /api/cms/:page
// @access  Public
const getCMSPage = async (req, res) => {
  try {
    const { page } = req.params;
    const cms = await CMS.findOne({ page });
    
    if (!cms) {
      // Return default stubs if CMS is not initialized
      return res.json({
        page,
        content: getDefaultCMSContent(page)
      });
    }
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update CMS page content
// @route   POST /api/cms/:page
// @access  Private (Admin)
const updateCMSPage = async (req, res) => {
  try {
    const { page } = req.params;
    const { content } = req.body;

    let cms = await CMS.findOne({ page });
    if (cms) {
      cms.content = content;
      cms.updatedBy = req.user._id;
      await cms.save();
    } else {
      cms = new CMS({
        page,
        content,
        updatedBy: req.user._id
      });
      await cms.save();
    }
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper for default stubs
const getDefaultCMSContent = (page) => {
  switch (page) {
    case 'home':
      return {
        heroTitle: 'Discover a World of Books',
        heroSubtitle: 'Publish, read, and listen in English, Hindi, and Marathi.',
        bannerAlert: 'Get 20% off on your first physical book purchase!'
      };
    case 'about':
      return {
        title: 'About Pustak Maza',
        story: 'Pustak Maza is dedicated to democratizing publishing and reading across India.'
      };
    case 'faq':
      return [
        { q: 'How do I read eBooks?', a: 'You can read eBooks directly in our web Kindle-like custom reader.' },
        { q: 'What is the royalty structure?', a: 'Authors receive 25% of book sales immediately credited to their wallet.' }
      ];
    default:
      return {};
  }
};

export {
  getCMSPage,
  updateCMSPage
};
