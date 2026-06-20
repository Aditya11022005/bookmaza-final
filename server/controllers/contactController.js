import ContactMessage from '../models/ContactMessage.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });

    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
export const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (message) {
      message.status = status || message.status;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a contact message and email the user
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToContactMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message content is required' });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0b1329; color: #ffffff;">
        <h2 style="color: #a855f7; text-align: center;">Pustak Maza Support Reply ✉️</h2>
        <p style="font-size: 15px; color: #cbd5e1;">Hi ${message.name},</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          Thank you for reaching out to us. We have received your query regarding "<b>${message.subject}</b>".
        </p>
        
        <div style="background-color: #1e293b; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
          <h4 style="color: #a855f7; margin-top: 0; margin-bottom: 8px;">Our Support Team's Response:</h4>
          <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
        </div>

        <div style="font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; margin-top: 25px;">
          <h4 style="margin: 0 0 5px 0; color: #94a3b8;">Original Message Detail:</h4>
          Date: ${new Date(message.createdAt).toLocaleString('en-IN')}<br>
          Subject: ${message.subject}<br>
          Message: ${message.message}
        </div>
        
        <p style="font-size: 14px; font-weight: bold; color: #a855f7; margin-top: 20px;">Best Regards,<br>The Pustak Maza Team</p>
      </div>
    `;

    // Try sending email but catch error so it does not block updating status in db
    try {
      await sendEmail({
        email: message.email,
        subject: `Re: Pustak Maza Support Enquiry - ${message.subject}`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Failed to send support email reply:', emailErr.message);
      // We will still save the reply in the DB, but inform the admin if email failed
    }

    message.status = 'replied';
    message.replyMessage = replyMessage;
    message.repliedAt = Date.now();
    
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
