import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (options) => {
  try {
    // 1. If Brevo API Key is configured, use the HTTP API to bypass SMTP port blocking (port 443)
    if (process.env.BREVO_API_KEY) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Pustak Maza',
            email: process.env.EMAIL_SENDER || 'contact@booksagapublications.com'
          },
          to: [
            {
              email: options.email
            }
          ],
          subject: options.subject,
          htmlContent: options.html
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`Email sent successfully via Brevo HTTP API. Message ID: ${resData.messageId}`);
        return;
      } else {
        console.warn('Brevo HTTP API failed, attempting SMTP fallback. Error:', resData.message || resData);
      }
    }

    // 2. Mock fallback for local development if credentials aren't set
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

    // 3. SMTP Fallback
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE !== 'false',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 8000, // 8 seconds
      socketTimeout: 8000,     // 8 seconds
    });

    const mailOptions = {
      from: `"Pustak Maza" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent via SMTP: ${info.response}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
