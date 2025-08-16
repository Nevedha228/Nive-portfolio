require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Update your CORS configuration to allow your frontend origin
app.use(cors({
  origin: [
    'http://localhost:3000', // Add your actual frontend URL
    'http://127.0.0.1:5500'  // Common default for live server
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
// Rate limiting for contact form
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'production' // Allow self-signed certs in development
  }
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error('✖ Mail transporter error:', error);
  } else {
    console.log('✓ Mail server is ready to send messages');
  }
});

// Enhanced contact form endpoint
app.post('/api/contact', limiter, async (req, res) => {
  try {
    console.log('📩 Received contact form submission:', req.body);
    console.log('📋 Request headers:', req.headers);

    const { name, email, message } = req.body;

    // Input validation
    if (!name || !email || !message) {
      console.warn('⚠ Validation failed: Missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('⚠ Validation failed: Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Email options with improved formatting
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New message from ${name} (Portfolio Contact)`,
      text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
      html: `
        <h2>New Portfolio Message</h2>
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    console.log('✉ Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });
  } catch (error) {
    console.error('✖ Error sending email:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🔧 Test endpoint hit');
  res.status(200).json({ 
    status: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email test endpoint
app.get('/test-mail', async (req, res) => {
  try {
    console.log('✉ Testing email sending...');
    await transporter.sendMail({
      to: process.env.EMAIL_USER,
      subject: 'TEST Email from Portfolio',
      text: 'This is a test email from your portfolio backend'
    });
    console.log('✓ Test email sent successfully');
    res.send("Email sent successfully!");
  } catch (error) {
    console.error('✖ Test email failed:', error.stack);
    res.status(500).send(`Email failed: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n=== Server Starting ===');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('======================\n');
});