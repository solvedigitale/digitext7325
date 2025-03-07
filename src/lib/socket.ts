// src/lib/socket.ts
import { io } from "socket.io-client";

// Backend API URL - güncellenmiş
const API_URL = import.meta.env.VITE_API_URL || "https://digitext-backend.onrender.com";

// Socket.io bağlantısı 
export const socket = io(API_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Socket bağlantı durumu izleme
socket.on("connect", () => {
  console.log("Socket.io bağlantısı kuruldu:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket.io bağlantı hatası:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket.io bağlantısı kesildi:", reason);
});

// Message listeners
socket.on("instagram_message", (data) => {
  console.log("Instagram mesajı alındı:", data);
  // Burada global state'i güncelleyecek bir fonksiyon çağrılabilir
});

socket.on("messenger_message", (data) => {
  console.log("Messenger mesajı alındı:", data);
  // Burada global state'i güncelleyecek bir fonksiyon çağrılabilir
});

socket.on("whatsapp_message", (data) => {
  console.log("WhatsApp mesajı alındı:", data);
  // Burada global state'i güncelleyecek bir fonksiyon çağrılabilir
});

export default socket;