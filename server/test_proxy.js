const testProxy = async () => {
  const targetPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const proxyUrl = `http://127.0.0.1:5000/api/books/pdf-proxy?url=${encodeURIComponent(targetPdf)}`;
  
  console.log(`Sending request to proxy: ${proxyUrl}`);
  try {
    const res = await fetch(proxyUrl);
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log('Response Headers:', Object.fromEntries(res.headers.entries()));
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      console.log(`Success! Received PDF buffer of size: ${buffer.byteLength} bytes`);
    } else {
      const text = await res.text();
      console.log('Error Response:', text);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};

testProxy();
