const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.OTP_PORT || 3001;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());

const getTransporter = () => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

app.post("/sendOtp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Thiếu email hoặc otp" });
  }

  const transporter = getTransporter();

  if (!transporter) {
    return res.status(500).json({
      error:
        "Chưa cấu hình SMTP. Tạo file .env với SMTP_HOST, SMTP_USER, SMTP_PASS (xem .env.example)",
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"ChiaBill" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "ChiaBill - Mã OTP xác thực",
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#2ECC71">ChiaBill</h2>
          <p>Mã OTP xác thực của bạn:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3498DB">${otp}</p>
          <p style="color:#666">Mã có hiệu lực trong <strong>10 phút</strong>.</p>
          <p style="color:#999;font-size:12px">Nếu bạn không yêu cầu mã này, hãy bỏ qua email.</p>
        </div>
      `,
    });

    console.log(`[OTP] Đã gửi email tới ${email}`);
    return res.json({ success: true, message: "OTP đã gửi qua email" });
  } catch (error) {
    console.error("Lỗi gửi email:", error.message);
    return res.status(500).json({ error: `Không thể gửi email: ${error.message}` });
  }
});

const server = app.listen(PORT, HOST, () => {
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  console.log(`OTP server: http://0.0.0.0:${PORT}`);
  console.log(hasSmtp ? "SMTP: đã cấu hình ✓" : "SMTP: CHƯA cấu hình — tạo file .env");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} đang được dùng. Dừng server cũ rồi chạy lại.`);
  } else {
    console.error("Lỗi server:", err.message);
  }
  process.exit(1);
});
