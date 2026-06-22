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

  // Local fallback resolution
  if (url.startsWith('/') || url.includes('/uploads/')) {
    return resolveMediaUrl(url);
  }

  return url;
};

/**
 * Resolves local, absolute localhost, or relative media URLs to point to the correct backend host.
 *
 * @param {string} url - The original media URL.
 * @returns {string} - The fully-resolved media URL.
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('cloudinary.com') || url.includes('amazonaws.com') || url.includes('digitaloceanspaces.com')) {
      return url;
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl) {
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      const pathIndex = url.indexOf('/uploads/');
      if (pathIndex !== -1) {
        return `${backendBase}${url.substring(pathIndex)}`;
      }
    }
    return url;
  }
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendBase = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : 'http://localhost:5000';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};
