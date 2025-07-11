require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/", router);

// Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

// Hardcoded test credentials (DO NOT use in production or commit to GitHub!)
const EMAIL_USER = "gk2792523@gmail.com";
const EMAIL_PASS = "ohnsabajcfjzmycg";

console.log("🔧 Using hardcoded Gmail credentials for testing:");
console.log("→ Email User:", EMAIL_USER);
console.log("→ Email Pass:", EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

// Nodemailer transporter
const contactEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter
contactEmail.verify((error) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

router.post("/contact", (req, res) => {
  const { firstName = "", lastName = "", email = "", message = "", phone = "" } = req.body;
  const name = `${firstName} ${lastName}`.trim();

  console.log("📥 Received contact form submission:");
  console.log("→ Name:", name);
  console.log("→ Email:", email);
  console.log("→ Phone:", phone);
  console.log("→ Message:", message);

  // Email to admin
  const adminMail = {
    from: `"${name}" <${email}>`,
    to: EMAIL_USER,
    subject: "📨 Contact Form Submission - Portfolio",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Email to user
  const userMail = {
    from: `"Portfolio" <${EMAIL_USER}>`,
    to: email,
    replyTo: EMAIL_USER,
    subject: "✅ We Received Your Message",
    html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for contacting me. I’ve received your message and will get back to you soon.</p>
      <p><strong>Your Message:</strong></p>
      <p>${message}</p>
      <br />
      <p>Best regards,<br/>Gaurav Kumar</p>
    `,
  };

  console.log("📤 Sending admin email to:", EMAIL_USER);
  contactEmail.sendMail(adminMail, (adminErr, info) => {
    if (adminErr) {
      console.error("❌ Failed to send email to admin:", adminErr);
      return res.status(500).json({
        success: false,
        error: adminErr.message || "Failed to send message to admin",
      });
    }

    console.log("✅ Email sent to admin:", info.response);

    console.log("📤 Sending confirmation email to user:", email);
    contactEmail.sendMail(userMail, (userErr, info2) => {
      if (userErr) {
        console.error("❌ Failed to send confirmation to user:", userErr);
        return res.status(500).json({
          success: false,
          error: userErr.message || "Failed to send confirmation to user",
        });
      }

      console.log("✅ Confirmation email sent to user:", info2.response);
      return res.json({
        success: true,
        message: "Emails sent successfully to admin and user.",
      });
    });
  });
});
