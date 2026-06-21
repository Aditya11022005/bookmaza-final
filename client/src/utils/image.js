/**
 * Dynamically appends format, quality, and width optimizations to Cloudinary
 * and Unsplash image URLs to minimize network payload sizes and optimize LCP/FCP.
 *
 * @param {string} url - The original image URL.
 * @param {number} width - The target bounding width.
 * @returns {string} - The optimized image URL.
 */
export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url || typeof url !== 'string') return url;

  // Cloudinary image transformation integration
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Insert transformations right after /upload/
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  // Unsplash responsive sizing integration
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('q', '80');
      urlObj.searchParams.set('w', width.toString());
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
};
