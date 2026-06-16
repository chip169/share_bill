import Constants from "expo-constants";

const hostUri = Constants.expoConfig?.hostUri;
const ip = hostUri ? hostUri.split(":")[0] : "localhost";

export const API_BASE_URL = `http://${ip}:9999`;
export const OTP_SERVER_URL = `http://${ip}:3001`;