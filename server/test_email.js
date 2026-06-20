import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testMail = async () => {
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('Using EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Pustak Maza" <${process.env.EMAIL_USER}>`, // Google works best when from matches user
    to: process.env.EMAIL_USER,
    subject: 'OTP Test Connection',
    text: 'If you receive this, the Nodemailer SMTP connection is 100% working!',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS: Email sent successfully!');
    console.log('Response:', info.response);
  } catch (error) {
    console.error('FAILED: Error sending email:');
    console.error(error);
  }
};

testMail();
