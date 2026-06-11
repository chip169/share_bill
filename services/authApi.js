import axios from "axios";
import { API_BASE_URL, OTP_SERVER_URL } from "./config";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateUserId = () => `u${Date.now()}`;

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return "Không kết nối được server. Kiểm tra IP trong services/config.js";
  }
  return error.message || fallback;
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const res = await axios.post(`${OTP_SERVER_URL}/sendOtp`, { email, otp });
    if (!res.data?.success) {
      throw new Error(res.data?.error || "Không thể gửi email OTP");
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không thể gửi email OTP"));
  }
};

export const login = async (email, password) => {
  const trimmedEmail = email.trim().toLowerCase();

  let res;
  try {
    res = await axios.get(
      `${API_BASE_URL}/users?email=${encodeURIComponent(trimmedEmail)}&password=${encodeURIComponent(password)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không thể kết nối database"));
  }

  if (!res.data || res.data.length === 0) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const user = res.data[0];
  const { password: _, otpCode, otpExpiresAt, ...safeUser } = user;

  return {
    id: user.id,
    user: safeUser,
  };
};

export const register = async ({ fullName, email, password }) => {
  const trimmedEmail = email.trim().toLowerCase();

  let existingRes;
  try {
    existingRes = await axios.get(
      `${API_BASE_URL}/users?email=${encodeURIComponent(trimmedEmail)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không thể kết nối database"));
  }

  if (existingRes.data && existingRes.data.length > 0) {
    throw new Error("Email này đã được đăng ký");
  }

  const newUser = {
    id: generateUserId(),
    fullName: fullName.trim(),
    email: trimmedEmail,
    password,
    phone: "",
    avatar: "https://example.com/avatar-default.jpg",
    qrCode: `USER_${Date.now()}`,
    bio: "",
    status: "ACTIVE",
    otpCode: null,
    otpExpiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = await axios.post(`${API_BASE_URL}/users`, newUser);
  const { password: _, otpCode, otpExpiresAt, ...safeUser } = res.data;

  return {
    id: res.data.id,
    user: safeUser,
  };
};

export const requestPasswordReset = async (email) => {
  const trimmedEmail = email.trim().toLowerCase();
  const res = await axios.get(
    `${API_BASE_URL}/users?email=${encodeURIComponent(trimmedEmail)}`,
  );

  if (!res.data || res.data.length === 0) {
    throw new Error("Email chưa được đăng ký");
  }

  const user = res.data[0];
  const otpCode = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
    otpCode,
    otpExpiresAt,
    updatedAt: new Date().toISOString(),
  });

  await sendOtpEmail(trimmedEmail, otpCode);

  return { email: trimmedEmail, otpSent: true };
};

export const resetPassword = async (email, otp, newPassword) => {
  const trimmedEmail = email.trim().toLowerCase();
  const res = await axios.get(
    `${API_BASE_URL}/users?email=${encodeURIComponent(trimmedEmail)}`,
  );

  if (!res.data || res.data.length === 0) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const user = res.data[0];

  if (user.otpCode !== otp) {
    throw new Error("Mã OTP không đúng");
  }

  if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
    throw new Error("Mã OTP đã hết hạn");
  }

  await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
    password: newPassword,
    otpCode: null,
    otpExpiresAt: null,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
};

export const verifyOtp = async (email, otp) => {
  const trimmedEmail = email.trim().toLowerCase();
  let res;
  try {
    res = await axios.get(
      `${API_BASE_URL}/users?email=${encodeURIComponent(trimmedEmail)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không thể kết nối database"));
  }

  if (!res.data || res.data.length === 0) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const user = res.data[0];

  if (user.otpCode !== otp) {
    throw new Error("Mã OTP không đúng");
  }

  if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
    throw new Error("Mã OTP đã hết hạn");
  }

  return { success: true };
};
