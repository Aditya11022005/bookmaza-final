import Banner from '../models/Banner.js';

// @desc    Get all active banners
// @route   GET /api/banners
const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/all
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, buttonText, type, isActive } = req.body;

    const banner = new Banner({
      title,
      subtitle,
      image,
      link,
      buttonText,
      type: type || 'hero',
      isActive,
    });

    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
const updateBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, buttonText, type, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      banner.title = title || banner.title;
      banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
      banner.image = image || banner.image;
      banner.link = link !== undefined ? link : banner.link;
      banner.buttonText = buttonText !== undefined ? buttonText : banner.buttonText;
      banner.type = type || banner.type;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;

      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
