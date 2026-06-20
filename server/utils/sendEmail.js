import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (options) => {
  try {
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your_email@gmail.com' ||
      process.env.EMAIL_PASS === 'your_gmail_app_password'
    ) {
      console.log('========================================================================');
      console.log(`[MOCK EMAIL SENT]`);
      console.log(`To:      ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.html}`);
      console.log('========================================================================');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Pustak Maza" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
