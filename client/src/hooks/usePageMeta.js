import { useEffect } from 'react';

/**
 * usePageMeta — Lightweight hook to set document title + meta description per page.
 * @param {string} title     - Page-specific part, e.g. "Shop" → "Pustak Maza | Shop"
 * @param {string} description - Meta description content
 * @param {bool}  raw        - If true, use `title` verbatim (for book detail dynamic titles)
 */
const usePageMeta = (title, description = '', raw = false) => {
  useEffect(() => {
    const finalTitle = raw ? title : `Pustak Maza | ${title}`;
    document.title = finalTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'Pustak Maza is a premium publication house offering ebooks, audiobooks, and hardcopy books.';

    // Open Graph
    const setOg = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setOg('og:title', finalTitle);
    setOg('og:description', metaDesc.content);
    setOg('og:type', 'website');
    setOg('og:site_name', 'Pustak Maza');
  }, [title, description, raw]);
};

export default usePageMeta;
