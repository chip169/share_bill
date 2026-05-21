import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; 

export const fetchUserProfile = async (userId = 'u1') => {
  try {
    const userRes = await axios.get(`${API_BASE_URL}/users/${userId}`);
    const user = userRes.data;

    // Lấy tất cả các hóa đơn mà user này có tham gia gánh tiền
    const participantsRes = await axios.get(`${API_BASE_URL}/expenseParticipants?userId=${userId}`);
    const participations = participantsRes.data;

    // CHUẨN LOGIC: Tổng chi tiêu thực tế của bản thân = Tổng các khoản mình phải chịu (owedAmount)
    const totalSpend = participations.reduce((sum, ep) => sum + (ep.owedAmount || 0), 0);
    const totalInvoices = participations.length;

    return { 
      ...user, 
      username: user.username || "HIEX123",
      bankName: user.bankName || "Vietcombank",
      bankAccount: user.bankAccount || "1234567890",
      totalSpend, 
      totalInvoices 
    };
  } catch (error) {
    console.error('Lỗi fetchUserProfile:', error);
    throw error;
  }
};

export const fetchHistoryExpenses = async (userId = 'u1') => {
  try {
    // 1. Lấy tất cả lượt tham gia hóa đơn của User này
    const participantsRes = await axios.get(`${API_BASE_URL}/expenseParticipants?userId=${userId}`);
    const myParticipations = participantsRes.data;

    const historyPromises = myParticipations.map(async (part) => {
      // 2. Lấy thông tin chi tiết của hóa đơn tương ứng
      const expenseRes = await axios.get(`${API_BASE_URL}/expenses/${part.expenseId}`);
      const expense = expenseRes.data;

      // 3. Đếm số người tham gia hóa đơn này
      const allPartsRes = await axios.get(`${API_BASE_URL}/expenseParticipants?expenseId=${expense.id}`);
      const memberCount = allPartsRes.data.length;

      // 4. Định dạng ngày tháng an toàn
      let formattedDate = '21/05/2026';
      if (expense.expenseDate) {
        const datePart = expense.expenseDate.split('T')[0];
        formattedDate = datePart.split('-').reverse().join('/');
      }

      // CHUẨN LOGIC TÀI CHÍNH: 
      // Số tiền bạn thực tế đã trả gánh cho hóa đơn này = Số tiền bạn phải gánh (owedAmount) - Số tiền còn nợ (remainingAmount)
      const userPaidAmount = (part.owedAmount || 0) - (part.remainingAmount || 0);

      // Xác định trạng thái hóa đơn cho UI (Hoàn thành / Một phần)
      // Nếu chính user này đã trả hết phần của mình (remainingAmount === 0) thì coi như hoàn thành với họ
      const statusUI = part.remainingAmount === 0 ? 'COMPLETED' : 'PARTIAL';

      return {
        id: expense.id,
        title: expense.title,
        date: formattedDate,
        totalAmount: expense.totalAmount, // Tổng tiền hóa đơn của cả nhóm (Ví dụ: 900k)
        paidAmount: userPaidAmount,       // Tiền cá nhân user đã trả (Ví dụ: u1 đã trả đủ 300k, u2 đã trả nợ xong 300k)
        memberCount: memberCount,
        status: statusUI
      };
    });

    return await Promise.all(historyPromises);
  } catch (error) {
    console.error('Lỗi fetchHistoryExpenses:', error);
    throw error;
  }
};