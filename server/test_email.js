import sendEmail from './utils/sendEmail.js';

const testMail = async () => {
  console.log('Testing email service with Brevo HTTP API / SMTP configuration...');
  try {
    await sendEmail({
      email: 'contact@booksagapublications.com',
      subject: 'Pustak Maza Connection Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #6A0DAD; text-align: center;">Pustak Maza</h1>
          <h2 style="color: #22c55e; text-align: center;">Connection Successful!</h2>
          <p>If you receive this message, the Brevo integration is 100% working and bypassed all cloud port blocking policies successfully!</p>
        </div>
      `
    });
    console.log('Done running the test email routine.');
  } catch (error) {
    console.error('Test script execution failed:', error);
  }
};

testMail();
