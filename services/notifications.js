import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Thiết lập cách xử lý thông báo khi ứng dụng đang chạy ở chế độ foreground (mở trước mặt người dùng)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Yêu cầu quyền thông báo đẩy từ người dùng và đăng ký kênh thông báo mặc định cho Android
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return false;
  
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0ea5e9',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Quyền thông báo đẩy bị từ chối!');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Lỗi cấu hình thông báo đẩy:', error);
    return false;
  }
}

// Hàm gửi thông báo đẩy cục bộ (Local Push Notification) lập tức
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Gửi ngay lập tức
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo đẩy:', error);
  }
}
