import { Readable } from 'stream';

const run = async () => {
  const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  console.log('Fetching:', url);
  try {
    const response = await fetch(url);
    console.log('Fetch response OK:', response.ok);
    console.log('Type of response.body:', typeof response.body);
    
    // Test Readable.fromWeb conversion
    const nodeStream = Readable.fromWeb(response.body);
    console.log('Readable.fromWeb success! nodeStream exists.');
    
    // Read data from stream to ensure it doesn't throw
    let length = 0;
    for await (const chunk of nodeStream) {
      length += chunk.length;
    }
    console.log(`Stream read success! Total bytes read: ${length}`);
  } catch (err) {
    console.error('Error during stream handling:', err);
  }
};

run();
