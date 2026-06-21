import zlib from 'zlib';

export const compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
    return next();
  }

  const originalWrite = res.write;
  const originalEnd = res.end;
  const originalWriteHead = res.writeHead;
  let chunks = [];
  let compressionMethod = acceptEncoding.includes('gzip') ? 'gzip' : 'deflate';
  let isHeadersChecked = false;

  const checkHeadersForCompression = () => {
    if (isHeadersChecked) return;
    isHeadersChecked = true;

    const contentType = res.getHeader('Content-Type') || '';
    const isCompressible = contentType && (
      contentType.includes('json') ||
      contentType.includes('text') ||
      contentType.includes('html') ||
      contentType.includes('javascript') ||
      contentType.includes('css')
    );

    if (isCompressible) {
      res.setHeader('Content-Encoding', compressionMethod);
      res.removeHeader('Content-Length'); // We will set this after compression
    } else {
      compressionMethod = null;
    }
  };

  res.writeHead = function (statusCode, ...args) {
    checkHeadersForCompression();
    return originalWriteHead.apply(this, [statusCode, ...args]);
  };

  res.write = function (chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }
    
    // If compression is disabled, write directly
    if (!compressionMethod) {
      return originalWrite.call(this, chunk, encoding, callback);
    }

    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    
    if (typeof callback === 'function') callback();
    return true;
  };

  res.end = function (chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }

    checkHeadersForCompression();

    if (!compressionMethod) {
      return originalEnd.call(this, chunk, encoding, callback);
    }

    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    const buffer = Buffer.concat(chunks);

    // If buffer is too small, don't compress (threshold: 1KB)
    if (buffer.length < 1024) {
      res.removeHeader('Content-Encoding');
      res.setHeader('Content-Length', buffer.length);
      return originalEnd.call(this, buffer, callback);
    }

    try {
      const compressed = compressionMethod === 'gzip' 
        ? zlib.gzipSync(buffer) 
        : zlib.deflateSync(buffer);

      res.setHeader('Content-Length', compressed.length);
      return originalEnd.call(this, compressed, callback);
    } catch (err) {
      res.removeHeader('Content-Encoding');
      res.setHeader('Content-Length', buffer.length);
      return originalEnd.call(this, buffer, callback);
    }
  };

  next();
};
