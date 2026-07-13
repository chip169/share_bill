import axios from "axios";

const API_BASE_URL = "https://share-bill-server.onrender.com";

// Helper to format date
const formatDate = (isoString) => {
  if (!isoString) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }
  try {
    const datePart = isoString.split("T")[0];
    return datePart.split("-").reverse().join("/");
  } catch (e) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

// 1. User Profile API
export const fetchUserProfile = async (userId = "u2") => {
  try {
    const userRes = await axios.get(`${API_BASE_URL}/users/${userId}`);
    const user = userRes.data;

    // Lấy tất cả các hóa đơn mà user này có tham gia gánh tiền
    const participantsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?userId=${userId}`,
    );
    const participations = participantsRes.data;

    // CHUẨN LOGIC: Tổng chi tiêu thực tế của bản thân = Tổng các khoản mình phải chịu (owedAmount)
    const totalSpend = participations.reduce(
      (sum, ep) => sum + (ep.owedAmount || 0),
      0,
    );
    const totalInvoices = participations.length;

    // 1. Tính số tiền cần trả (Bạn nợ người khác)
    const totalToPay = participations.reduce(
      (sum, ep) => sum + (ep.isSettled ? 0 : ep.remainingAmount || 0),
      0,
    );

    // 2. Tính số tiền cần thu (Người khác nợ bạn)
    const myPaidExpensesRes = await axios.get(
      `${API_BASE_URL}/expenses?paidBy=${userId}`,
    );
    const myPaidExpenses = myPaidExpensesRes.data;

    let totalToCollect = 0;
    const collectPromises = myPaidExpenses.map(async (exp) => {
      const expPartsRes = await axios.get(
        `${API_BASE_URL}/expenseParticipants?expenseId=${exp.id}`,
      );
      const expParts = expPartsRes.data;
      const sumOthers = expParts.reduce(
        (sum, p) => sum + (p.userId === userId ? 0 : p.remainingAmount || 0),
        0,
      );
      totalToCollect += sumOthers;
    });

    await Promise.all(collectPromises);

    return {
      ...user,
      username: user.username || `USR${user.id.toUpperCase()}`,
      bankName: user.bankName || "Vietcombank",
      bankAccount: user.bankAccount || "1234567890",
      totalSpend,
      totalInvoices,
      totalToPay,
      totalToCollect,
    };
  } catch (error) {
    console.error("Lỗi fetchUserProfile:", error);
    throw error;
  }
};

// 2. Search User by Username/ID (for adding to bill)
export const searchUserByUsername = async (username) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/users`);
    const users = res.data;
    const cleanUsername = username.trim().toLowerCase();

    // Tìm theo username hoặc id (không phân biệt hoa thường)
    const found = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        u.id.toLowerCase() === cleanUsername,
    );
    return found || null;
  } catch (error) {
    console.error("Lỗi searchUserByUsername:", error);
    return null;
  }
};

// 3. Login API
export const loginUser = async (phone, password) => {
  try {
    const cleanPhone = (phone || "").trim();
    const res = await axios.get(`${API_BASE_URL}/users?phone=${cleanPhone}`);
    const users = res.data;
    if (users.length === 0) {
      throw new Error("Số điện thoại không tồn tại!");
    }
    const user = users[0];
    if (user.password !== password) {
      throw new Error("Mật khẩu không chính xác!");
    }
    return user;
  } catch (error) {
    if (
      error.message !== "Số điện thoại không tồn tại!" &&
      error.message !== "Mật khẩu không chính xác!"
    ) {
      console.error("Lỗi hệ thống loginUser:", error);
    }
    throw error;
  }
};

// 4. Register API with validation helper inside screen
export const registerUser = async (userData) => {
  try {
    const cleanPhone = (userData.phone || "").trim();
    // Kiểm tra số điện thoại đã tồn tại chưa
    const checkPhoneRes = await axios.get(
      `${API_BASE_URL}/users?phone=${cleanPhone}`,
    );
    if (checkPhoneRes.data && checkPhoneRes.data.length > 0) {
      throw new Error("Số điện thoại này đã được đăng ký!");
    }

    // Generate unique ID and username
    const id = "u_" + Math.random().toString(36).slice(2, 11);
    const username = "USR" + Math.floor(1000 + Math.random() * 9000);

    const newUserData = {
      id,
      username,
      fullName: userData.fullName,
      email: userData.email || `${id}@sharebill.com`,
      phone: cleanPhone,
      password: userData.password,
      avatar: userData.avatar || "https://example.com/avatar_default.jpg",
      bankName: userData.bankName,
      bankAccount: userData.bankAccount,
      qrCode: `USER_${username}`,
      bio: "Active Share Bill member",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await axios.post(`${API_BASE_URL}/users`, newUserData);
    return res.data;
  } catch (error) {
    console.error("Lỗi registerUser:", error);
    throw error;
  }
};

// 5. Fetch History Expenses API
export const fetchHistoryExpenses = async (userId = "u2") => {
  try {
    const participantsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?userId=${userId}`,
    );
    const myParticipations = participantsRes.data;

    const historyPromises = myParticipations.map(async (part) => {
      const expenseRes = await axios.get(
        `${API_BASE_URL}/expenses/${part.expenseId}`,
      );
      const expense = expenseRes.data;

      const allPartsRes = await axios.get(
        `${API_BASE_URL}/expenseParticipants?expenseId=${expense.id}`,
      );
      const allParts = allPartsRes.data;
      const memberCount = allParts.length;

      const isPayer = expense.paidBy === userId;
      const userPaidAmount = isPayer
        ? expense.totalAmount
        : (part.owedAmount || 0) - (part.remainingAmount || 0);

      let statusUI = "PARTIAL";
      if (isPayer) {
        // Payer: COMPLETE nếu tất cả các người khác đã trả xong (remainingAmount === 0)
        const othersSettled = allParts.every(
          (p) => p.remainingAmount === 0 || p.isSettled,
        );
        statusUI = othersSettled ? "COMPLETED" : "PARTIAL";
      } else {
        statusUI = part.remainingAmount === 0 ? "COMPLETED" : "PARTIAL";
      }

      return {
        id: expense.id,
        title: expense.title,
        date: formatDate(expense.expenseDate),
        rawDate: expense.expenseDate || expense.createdAt,
        totalAmount: expense.totalAmount,
        paidAmount: userPaidAmount,
        memberCount: memberCount,
        status: statusUI,
        createdBy: expense.createdBy || expense.paidBy, // Phục vụ lọc tab Đã tạo / Tham gia
        categoryId: expense.categoryId || null,
      };
    });

    const results = await Promise.all(historyPromises);
    return results.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  } catch (error) {
    console.error("Lỗi fetchHistoryExpenses:", error);
    throw error;
  }
};

// 6. Fetch Bill Detail API (dynamically fetching items & bank)
export const fetchBillDetail = async (expenseId) => {
  try {
    // Fetch expense info
    const expenseRes = await axios.get(`${API_BASE_URL}/expenses/${expenseId}`);
    const expense = expenseRes.data;

    // Fetch participants list for this bill
    const participantsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?expenseId=${expenseId}`,
    );
    const participants = participantsRes.data;

    // Fetch users for each participant
    const membersPromises = participants.map(async (p) => {
      try {
        const userRes = await axios.get(`${API_BASE_URL}/users/${p.userId}`);
        const u = userRes.data;
        return {
          id: u.id,
          participantId: p.id, // ID of record in expenseParticipants table
          name: u.fullName,
          code: u.username || `USR${u.id.toUpperCase()}`,
          paid: p.remainingAmount === 0 || p.isSettled,
          owedAmount: p.owedAmount,
          remainingAmount: p.remainingAmount,
        };
      } catch (err) {
        console.warn(`User ${p.userId} not found in database:`, err.message);
        return {
          id: p.userId,
          participantId: p.id,
          name: `Thành viên (${p.userId})`,
          code: `USR_${p.userId.toUpperCase()}`,
          paid: p.remainingAmount === 0 || p.isSettled,
          owedAmount: p.owedAmount,
          remainingAmount: p.remainingAmount,
        };
      }
    });
    const members = await Promise.all(membersPromises);

    // Fetch payer info for bank details
    let payer = {
      id: expense.paidBy,
      fullName: "Người thanh toán",
      bankName: "Vietcombank",
      bankAccount: "1234567890",
    };
    try {
      const payerRes = await axios.get(
        `${API_BASE_URL}/users/${expense.paidBy}`,
      );
      payer = payerRes.data;
    } catch (err) {
      console.warn(
        `Payer ${expense.paidBy} not found in database:`,
        err.message,
      );
    }

    // Fallback/mock items if expense doesn't have an items array
    let billItems = expense.items || [];
    if (billItems.length === 0) {
      const amt1 = Math.round(expense.totalAmount * 0.7);
      const amt2 = Math.round(expense.totalAmount * 0.2);
      const amt3 = expense.totalAmount - amt1 - amt2;
      billItems = [
        { id: "item1", name: expense.title + " (Phần chính)", price: amt1 },
        { id: "item2", name: "Đồ uống & Tráng miệng", price: amt2 },
        { id: "item3", name: "Thuế & Phí phục vụ", price: amt3 },
      ];
    }

    // Prepare bill details
    const bill = {
      id: expense.id,
      billCode: expense.billCode || "BILL-MOCK",
      title: expense.title,
      createdAt: formatDate(expense.expenseDate || expense.createdAt),
      rawExpenseDate: expense.expenseDate || expense.createdAt || null,
      creator: payer.fullName,
      creatorId: payer.id,
      members: members.length,
      splitAmount:
        members[0]?.owedAmount || expense.totalAmount / (members.length || 1),
      total: expense.totalAmount,
      items: billItems,
      categoryId: expense.categoryId || null,
    };

    const bank = {
      bankName: payer.bankName || "Vietcombank",
      accountNumber: payer.bankAccount || "1234567890",
      owner: payer.fullName,
      transferContent: `CHIA BILL ${expense.title.replace(/\s+/g, "").toUpperCase()}`,
    };

    return { bill, members, bank };
  } catch (error) {
    console.error("Lỗi fetchBillDetail:", error);
    throw error;
  }
};

// 7. Create Expense API
export const createExpense = async (expenseData) => {
  try {
    const expenseId = "e_" + Math.random().toString(36).slice(2, 11);

    const billCode =
      "BILL-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Save Expense info
    const expenseObj = {
      id: expenseId,
      billCode: billCode,
      groupId: "g1",
      title: expenseData.title,
      totalAmount: expenseData.totalAmount,
      paidBy: expenseData.paidBy,
      splitMethod: "ITEMIZED",
      expenseDate: expenseData.expenseDate || new Date().toISOString(),
      items: expenseData.items || [],
      status: "ACTIVE",
      createdBy: expenseData.createdBy || expenseData.paidBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: expenseData.categoryId || null,
    };

    await axios.post(`${API_BASE_URL}/expenses`, expenseObj);

    // Save Participants info
    const participantPromises = expenseData.participants.map((p) => {
      const partObj = {
        id: "ep_" + Math.random().toString(36).slice(2, 11),
        expenseId: expenseId,
        userId: p.userId,
        owedAmount: p.owedAmount,
        paidAmount:
          p.userId === expenseData.paidBy ? expenseData.totalAmount : 0,
        remainingAmount: p.userId === expenseData.paidBy ? 0 : p.owedAmount,
        isSettled: p.userId === expenseData.paidBy, // Payer is settled automatically
        settledAt:
          p.userId === expenseData.paidBy ? new Date().toISOString() : null,
      };
      return axios.post(`${API_BASE_URL}/expenseParticipants`, partObj);
    });

    await Promise.all(participantPromises);
    return expenseObj;
  } catch (error) {
    console.error("Lỗi createExpense:", error);
    throw error;
  }
};

// 7.5 Update Expense API
export const updateExpense = async (expenseId, expenseData) => {
  try {
    // 1. Get current expense
    const oldExpenseRes = await axios.get(
      `${API_BASE_URL}/expenses/${expenseId}`,
    );
    const oldExpense = oldExpenseRes.data;

    // 2. Update the expense details
    const updatedExpense = {
      ...oldExpense,
      title: expenseData.title,
      totalAmount: expenseData.totalAmount,
      categoryId: expenseData.categoryId || null,
      paidBy: expenseData.paidBy,
      expenseDate: expenseData.expenseDate || oldExpense.expenseDate,
      items: expenseData.items || [],
      updatedAt: new Date().toISOString(),
    };
    await axios.put(`${API_BASE_URL}/expenses/${expenseId}`, updatedExpense);

    // 3. Delete existing participants for this expense
    const oldPartsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?expenseId=${expenseId}`,
    );
    const oldParts = oldPartsRes.data;
    const deletePromises = oldParts.map((p) =>
      axios.delete(`${API_BASE_URL}/expenseParticipants/${p.id}`),
    );
    await Promise.all(deletePromises);

    // 4. Create new participants
    const participantPromises = expenseData.participants.map((p) => {
      const partObj = {
        id: "ep_" + Math.random().toString(36).slice(2, 11),
        expenseId: expenseId,
        userId: p.userId,
        owedAmount: p.owedAmount,
        paidAmount:
          p.userId === expenseData.paidBy ? expenseData.totalAmount : 0,
        remainingAmount: p.userId === expenseData.paidBy ? 0 : p.owedAmount,
        isSettled: p.userId === expenseData.paidBy,
        settledAt:
          p.userId === expenseData.paidBy ? new Date().toISOString() : null,
      };
      return axios.post(`${API_BASE_URL}/expenseParticipants`, partObj);
    });
    await Promise.all(participantPromises);

    return updatedExpense;
  } catch (error) {
    console.error("Lỗi updateExpense:", error);
    throw error;
  }
};

// 8. Settle Participant Payment API (Confirm paid status)
export const settleParticipantPayment = async (participantId) => {
  try {
    const res = await axios.patch(
      `${API_BASE_URL}/expenseParticipants/${participantId}`,
      {
        remainingAmount: 0,
        isSettled: true,
        settledAt: new Date().toISOString(),
      },
    );
    return res.data;
  } catch (error) {
    console.error("Lỗi settleParticipantPayment:", error);
    throw error;
  }
};

// 9. Update User Profile API (used to update bank info)
export const updateUserProfile = async (userId, data) => {
  try {
    const res = await axios.patch(`${API_BASE_URL}/users/${userId}`, data);
    return res.data;
  } catch (error) {
    console.error("Lỗi updateUserProfile:", error);
    throw error;
  }
};

// 10. Fetch User Notifications API
export const fetchNotifications = async (userId) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/notifications?userId=${userId}`,
    );
    return res.data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  } catch (error) {
    console.error("Lỗi fetchNotifications:", error);
    throw error;
  }
};

// 11. Mark Notification as Read API
export const markNotificationRead = async (notificationId) => {
  try {
    const res = await axios.patch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      { isRead: true },
    );
    return res.data;
  } catch (error) {
    console.error("Lỗi markNotificationRead:", error);
    throw error;
  }
};

// 12. Join Expense by Bill Code
export const joinExpenseByCode = async (userId, billCode) => {
  try {
    const cleanCode = billCode.trim().toUpperCase();
    const expensesRes = await axios.get(
      `${API_BASE_URL}/expenses?billCode=${cleanCode}`,
    );
    const expenses = expensesRes.data;
    if (expenses.length === 0) {
      throw new Error("Không tìm thấy hóa đơn nào với mã này!");
    }
    const expense = expenses[0];

    // Check if user is already in expenseParticipants
    const participantsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?expenseId=${expense.id}&userId=${userId}`,
    );
    const existingParticipants = participantsRes.data;
    if (existingParticipants.length > 0) {
      return expense;
    }

    // Add user as a participant
    const partObj = {
      id: "ep_" + Math.random().toString(36).slice(2, 11),
      expenseId: expense.id,
      userId: userId,
      owedAmount: 0,
      paidAmount: userId === expense.paidBy ? expense.totalAmount : 0,
      remainingAmount: 0,
      isSettled: true,
      settledAt: new Date().toISOString(),
    };
    await axios.post(`${API_BASE_URL}/expenseParticipants`, partObj);

    // Create a notification for the bill owner
    const notifObj = {
      id: "n_" + Math.random().toString(36).slice(2, 11),
      userId: expense.paidBy,
      title: "Thành viên mới tham gia bill",
      content: `Một người dùng đã tham gia hóa đơn "${expense.title}" bằng mã của bạn.`,
      type: "EXPENSE",
      relatedId: expense.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await axios.post(`${API_BASE_URL}/notifications`, notifObj);

    return expense;
  } catch (error) {
    console.error("Lỗi joinExpenseByCode:", error);
    throw error;
  }
};

// 13. Fetch bank list from VietQR
export const fetchBankList = async () => {
  try {
    const res = await axios.get("https://api.vietqr.io/v2/banks");
    if (res.data && res.data.code === "00") {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error("Lỗi fetchBankList:", error);
    return [];
  }
};

// 14. Delete Expense and associated participants
export const deleteExpense = async (expenseId) => {
  try {
    // 1. Delete the expense
    await axios.delete(`${API_BASE_URL}/expenses/${expenseId}`);

    // 2. Delete participants associated with this expense
    const partsRes = await axios.get(
      `${API_BASE_URL}/expenseParticipants?expenseId=${expenseId}`,
    );
    const parts = partsRes.data;
    const deletePromises = parts.map((p) =>
      axios.delete(`${API_BASE_URL}/expenseParticipants/${p.id}`),
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Lỗi deleteExpense:", error);
    throw error;
  }
};

// 14.5 Check if phone exists in database
export const checkPhoneExists = async (phone) => {
  try {
    const cleanPhone = (phone || "").trim();
    const res = await axios.get(`${API_BASE_URL}/users?phone=${cleanPhone}`);
    return res.data && res.data.length > 0;
  } catch (error) {
    console.error("Lỗi checkPhoneExists:", error);
    throw error;
  }
};

// 14.6 Fetch user by phone or email identifier
export const fetchUserByIdentifier = async (identifier) => {
  try {
    const clean = (identifier || "").trim().toLowerCase();
    const res = await axios.get(`${API_BASE_URL}/users`);
    const users = res.data;
    const user = users.find(u =>
      (u.phone && u.phone.trim() === clean) ||
      (u.email && u.email.trim().toLowerCase() === clean)
    );
    return user || null;
  } catch (error) {
    console.error("Lỗi fetchUserByIdentifier:", error);
    throw error;
  }
};

// 15. Reset user password by phone number
export const resetUserPassword = async (phone, newPassword) => {
  try {
    const cleanPhone = (phone || "").trim();
    const res = await axios.get(`${API_BASE_URL}/users?phone=${cleanPhone}`);
    const users = res.data;
    if (users.length === 0) {
      throw new Error("Số điện thoại này chưa được đăng ký!");
    }
    const user = users[0];
    const updateRes = await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    return updateRes.data;
  } catch (error) {
    console.error("Lỗi resetUserPassword:", error);
    throw error;
  }
};

// 15.5 Check if email exists in database
export const checkEmailExists = async (email) => {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    const res = await axios.get(`${API_BASE_URL}/users?email=${cleanEmail}`);
    return res.data && res.data.length > 0;
  } catch (error) {
    console.error("Lỗi checkEmailExists:", error);
    throw error;
  }
};

// 15.6 Reset user password by email
export const resetUserPasswordByEmail = async (email, newPassword) => {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    const res = await axios.get(`${API_BASE_URL}/users?email=${cleanEmail}`);
    const users = res.data;
    if (users.length === 0) {
      throw new Error("Email này chưa được đăng ký!");
    }
    const user = users[0];
    const updateRes = await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    return updateRes.data;
  } catch (error) {
    console.error("Lỗi resetUserPasswordByEmail:", error);
    throw error;
  }
};

// 16. Scan Receipt OCR using OCR.space free API
export const scanReceiptOCR = async (base64Data) => {
  try {
    const formData = new FormData();
    formData.append("apikey", "helloworld");
    formData.append("language", "vnm"); // Đổi sang 'vnm' theo quy định của OCR.space để tránh lỗi E201
    formData.append("ocrEngine", "2"); // Sử dụng Engine 2 tối ưu cho tiếng Việt có dấu
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("base64Image", `data:image/jpeg;base64,${base64Data}`);

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (
      response.data &&
      response.data.ParsedResults &&
      response.data.ParsedResults.length > 0
    ) {
      const parsedText = response.data.ParsedResults[0].ParsedText;
      return parsedText;
    } else {
      throw new Error(
        response.data.ErrorMessage || "Không thể đọc văn bản từ hóa đơn.",
      );
    }
  } catch (error) {
    console.error("Lỗi scanReceiptOCR:", error);
    throw error;
  }
};

// 17. Extract items & prices from raw OCR text
export const parseOcrTextToItems = (ocrText) => {
  if (!ocrText) return [];
  const lines = ocrText.split(/\r?\n/);
  const items = [];

  // Từ khóa bỏ qua (hóa đơn tổng, địa chỉ, cửa hàng, thông tin hành chính...)
  const skipKeywords = [
    "tổng",
    "tong",
    "total",
    "vat",
    "thuế",
    "thue",
    "tiền mặt",
    "tien mat",
    "cash",
    "thẻ",
    "card",
    "chuyển khoản",
    "banking",
    "thối",
    "change",
    "giảm giá",
    "giam gia",
    "discount",
    "khuyến mãi",
    "khuyen mai",
    "km",
    "nợ cũ",
    "no cu",
    "thành tiền",
    "thanh tien",
    "subtotal",
    "cộng",
    "cong",
    "khách phải trả",
    "khach phai tra",
    "phải trả",
    "phai tra",
    "thanh toán",
    "thanh toan",
    "tiền hàng",
    "tien hang",
    "sl",
    "đg",
    "ck",
    "t.tiền",
    "t.tien",
    "ngày bán",
    "ngay ban",
    "siêu thị",
    "sieu thi",
    "chợ",
    "cho",
    "địa chỉ",
    "dia chi",
    "tp hà nội",
    "tp ha noi",
    "điện thoại",
    "dien thoai",
    "đt:",
    "tel:",
    "phone:",
    "hóa đơn",
    "hoa don",
    "ngày",
    "ngay",
    "giờ",
    "gio",
    "nhân viên",
    "nhan vien",
    "thu ngân",
    "thu ngan",
    "quầy",
    "quay",
    "khách hàng",
    "khach hang",
    "khách lẻ",
    "khach le",
    "ghé là mê",
    "ghe la me",
    "no. ",
    "no:",
    "stt",
    "ký hiệu",
    "ky hieu"
  ];

  let itemIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    const lowerLine = line.toLowerCase();
    const shouldSkip = skipKeywords.some((keyword) =>
      lowerLine.includes(keyword),
    );
    if (shouldSkip) continue;

    // Tìm tất cả cụm số trong dòng (chấp nhận dấu phân cách nghìn . hoặc ,)
    const numRegex = /\b\d+[\d.,]*\b/g;
    const matches = line.match(numRegex) || [];

    if (matches.length === 0) continue;

    // Chuẩn hóa các số
    const numbersInfo = matches.map((m) => {
      let cleaned = m;
      if (m.includes(".") && m.split(".")[1].length === 3) {
        cleaned = m.replace(/\./g, "");
      } else if (m.includes(",") && m.split(",")[1].length === 3) {
        cleaned = m.replace(/,/g, "");
      } else {
        cleaned = m.replace(/,/g, ".");
      }
      return {
        raw: m,
        value: parseFloat(cleaned) || 0,
      };
    });

    // Xác định phần tên món (phần chữ trước khi các con số giá trị xuất hiện)
    let namePart = line;
    let firstPriceIndex = line.length;
    for (let numInfo of numbersInfo) {
      if (numInfo.value >= 1000) {
        const idx = line.indexOf(numInfo.raw);
        if (idx !== -1 && idx < firstPriceIndex) {
          firstPriceIndex = idx;
        }
      }
    }

    if (firstPriceIndex > 0) {
      namePart = line.substring(0, firstPriceIndex).trim();
    }

    let cleanName = namePart.replace(/^[\s\d.\-#*+]+/g, ""); // Bỏ số thứ tự
    cleanName = cleanName.replace(/[:\-+=._~]+$/g, "").trim();

    const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(cleanName);
    if (!hasLetters || cleanName.length < 2) continue;

    let quantity = 1;
    let unitPrice = 0;

    // Chỉ giữ lại các số nằm sau hoặc đồng hành cùng tên món
    const cleanNumbers = numbersInfo.filter((numInfo) => {
      const idx = line.indexOf(numInfo.raw);
      return idx >= firstPriceIndex;
    });

    if (cleanNumbers.length >= 3) {
      // Có dạng Qty, Unit Price, Total
      const vals = cleanNumbers.map((n) => n.value);
      const val3 = vals[vals.length - 1]; // Thành tiền
      const val2 = vals[vals.length - 2]; // Đơn giá
      const val1 = vals[vals.length - 3]; // Số lượng

      if (Math.abs(val1 * val2 - val3) < Math.max(val3 * 0.05, 10)) {
        quantity = val1;
        unitPrice = val2;
      } else {
        unitPrice = val2 >= 1000 ? val2 : val3;
        quantity = val1 < 1000 ? val1 : 1;
      }
    } else if (cleanNumbers.length === 2) {
      const val1 = cleanNumbers[0].value;
      const val2 = cleanNumbers[1].value;

      if (val1 < 100 && val2 >= 1000) {
        quantity = val1;
        unitPrice = val2;
      } else if (val1 >= 1000 && val2 >= 1000) {
        const ratio = val2 / val1;
        const roundedRatio = Math.round(ratio);
        if (
          roundedRatio > 1 &&
          roundedRatio < 20 &&
          Math.abs(ratio - roundedRatio) < 0.1
        ) {
          quantity = roundedRatio;
          unitPrice = val1;
        } else {
          unitPrice = val1;
        }
      } else {
        unitPrice = Math.max(val1, val2);
      }
    } else if (cleanNumbers.length === 1) {
      unitPrice = cleanNumbers[0].value;
      quantity = 1;
    }

    if (unitPrice >= 500 && unitPrice <= 20000000) {
      items.push({
        id: itemIndex.toString(),
        name: cleanName,
        price: unitPrice.toString(),
        quantity: quantity.toString(),
        sharedWith: [],
      });
      itemIndex++;
    }
  }

  return items;
};

// 18. Guess bill category from scanned item names
export const guessCategoryFromItems = (items) => {
  if (!items || items.length === 0) return "c1"; // Mặc định là ăn uống

  // Từ khóa đặc trưng của từng danh mục
  const keywords = {
    c2: [
      "vé",
      "ve ",
      "hotel",
      "khách sạn",
      "khach san",
      "homestay",
      "taxi",
      "bus",
      "xe khách",
      "xe khach",
      "máy bay",
      "may bay",
      "phòng",
      "phong",
      "lưu trú",
      "di chuyển",
      "xăng",
      "xang",
      "toll",
    ],
    c3: [
      "quần",
      "quan",
      "áo",
      "ao ",
      "giày",
      "giay",
      "dép",
      "dep",
      "siêu thị",
      "sieu thi",
      "shampoo",
      "dầu gội",
      "tắm",
      "sách",
      "sach",
      "vở",
      "bút",
      "but",
      "túi",
      "tui",
      "bag",
      "mỹ phẩm",
      "my pham",
      "son",
      "kem",
      "chợ",
      "cho ",
    ],
    c4: [
      "vé xem phim",
      "công viên",
      "cong vien",
      "karaoke",
      "bar",
      "pub",
      "game",
      "nintendo",
      "playstation",
      "cinema",
      "rap chieu phim",
      "rạp chiếu phim",
      "cáp treo",
      "cap treo",
      "golf",
      "bida",
      "bi-a",
    ],
  };

  const scores = { c1: 0, c2: 0, c3: 0, c4: 0 };
  scores.c1 = 1; // Ăn uống có trọng số nền mặc định

  items.forEach((item) => {
    const name = item.name.toLowerCase();

    // Các từ khóa ăn uống
    const foodKeywords = [
      "cơm",
      "com ",
      "bún",
      "bun ",
      "phở",
      "pho ",
      "lẩu",
      "lau ",
      "nướng",
      "nuong",
      "gà",
      "ga ",
      "vịt",
      "vit",
      "lợn",
      "lon ",
      "bò",
      "bo ",
      "cá",
      "ca ",
      "rau",
      "canh",
      "nước",
      "nuoc",
      "cà phê",
      "cafe",
      "trà",
      "tra ",
      "sinh tố",
      "soda",
      "bia",
      "rượu",
      "ruou",
      "ăn",
      "an ",
      "uống",
      "uong",
      "bánh",
      "banh",
      "kẹo",
      "keo",
      "sữa",
      "sua",
      "nem",
      "chả",
      "cha ",
    ];
    foodKeywords.forEach((k) => {
      if (name.includes(k)) scores.c1 += 2;
    });

    Object.keys(keywords).forEach((catId) => {
      keywords[catId].forEach((k) => {
        if (name.includes(k)) scores[catId] += 3;
      });
    });
  });

  let bestCat = "c1";
  let maxScore = 0;
  Object.keys(scores).forEach((catId) => {
    if (scores[catId] > maxScore) {
      maxScore = scores[catId];
      bestCat = catId;
    }
  });

  return bestCat;
};

export const sendPaymentReminder = async (debtorUserId, creatorName, billTitle, owedAmount, expenseId, customContent = null) => {
  try {
    const notifObj = {
      id: "n_" + Math.random().toString(36).slice(2, 11),
      userId: debtorUserId,
      title: "Nhắc nhở thanh toán ⏰",
      content: customContent || `Thành viên ${creatorName} nhắc bạn thanh toán số tiền ${owedAmount.toLocaleString("vi-VN")} đ cho hóa đơn "${billTitle}".`,
      type: "EXPENSE",
      relatedId: expenseId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const res = await axios.post(`${API_BASE_URL}/notifications`, notifObj);
    return res.data;
  } catch (error) {
    console.error("Lỗi sendPaymentReminder:", error);
    throw error;
  }
};
