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
 * Generates an optimized src and srcSet configuration for responsive images.
 * Works with Cloudinary and Unsplash URLs, falling back to clean resolved URLs for other media.
 *
 * @param {string} url - The original image URL.
 * @param {number[]} widths - Array of widths for responsive resizing.
 * @returns {object} - Object with src and srcSet properties.
 */
export const getOptimizedImageSrcSet = (url, widths = [150, 300, 600, 900]) => {
  if (!url || typeof url !== 'string') return { src: '' };

  const resolved = resolveMediaUrl(url);

  if (!url.includes('cloudinary.com') && !url.includes('images.unsplash.com')) {
    return { src: resolved };
  }

  const srcSet = widths
    .map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(', ');

  return {
    src: getOptimizedImageUrl(url, widths[1] || 300),
    srcSet,
  };
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
  const backendBase = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : window.location.origin;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

/**
 * Wraps a PDF URL in our backend proxy URL to bypass CORS and download issues.
 *
 * @param {string} pdfUrl - The original PDF URL.
 * @returns {string} - The proxy-wrapped URL.
 */
export const getPdfProxyUrl = (pdfUrl) => {
  if (!pdfUrl || typeof pdfUrl !== 'string') return '';
  
  // First, resolve the media URL to absolute
  const resolvedUrl = resolveMediaUrl(pdfUrl);
  
  // Get API URL (default to relative /api if not set)
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  
  // Return the backend proxy endpoint wrapping the resolved URL
  return `${apiUrl}/books/pdf-proxy?url=${encodeURIComponent(resolvedUrl)}`;
};
