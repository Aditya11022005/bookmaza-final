import Post from '../models/Community.js';

// @desc    Get all community posts
// @route   GET /api/community/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new post
// @route   POST /api/community/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, bookRef } = req.body;
    
    const post = new Post({
      title,
      content,
      category,
      bookRef,
      author: req.user._id,
      authorName: req.user.name
    });

    const created = await post.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/community/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on post
// @route   POST /api/community/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      content
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getPosts,
  createPost,
  toggleLikePost,
  commentOnPost
};
