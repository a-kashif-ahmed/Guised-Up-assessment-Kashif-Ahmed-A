// 10.0.2.2 is a special alias that ONLY works on the Android emulator
// (it points to your computer's localhost from inside the emulator).
// - iOS simulator: use "http://localhost:8000/api"
// - Physical device (Expo Go): use your computer's LAN IP,
//   e.g. "http://192.168.1.23:8000/api" (find it with `ipconfig`)
// - Android emulator: "http://10.0.2.2:8000/api" (current default below)
export const API_URL = 'http://10.0.2.2:8000/api';
