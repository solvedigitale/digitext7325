// src/services/apiStorage.ts
// API bağlantılarını yönetmek için yardımcı fonksiyonlar

interface APIConnection {
  id: string;
  name: string;
  pageId: string;
  pageAccessToken: string;
  instagramAccountId?: string;
  instagramUsername?: string;
  profilePictureUrl?: string;
  createdAt: number;
}

// API bağlantısını kaydet
export const saveAPIConnection = (connection: APIConnection): void => {
  // Mevcut bağlantıları al
  const connections = getAPIConnections();
  
  // Bu ID'ye sahip bir bağlantı varsa güncelle, yoksa ekle
  const existingIndex = connections.findIndex(conn => conn.id === connection.id);
  
  if (existingIndex >= 0) {
    connections[existingIndex] = connection;
  } else {
    connections.push(connection);
  }
  
  // Local storage'a kaydet
  localStorage.setItem('api_connections', JSON.stringify(connections));
};

// Tüm API bağlantılarını getir
export const getAPIConnections = (): APIConnection[] => {
  const connectionsJson = localStorage.getItem('api_connections');
  return connectionsJson ? JSON.parse(connectionsJson) : [];
};

// ID'ye göre API bağlantısını getir
export const getAPIConnectionById = (id: string): APIConnection | undefined => {
  const connections = getAPIConnections();
  return connections.find(conn => conn.id === id);
};

// API bağlantısını sil
export const removeAPIConnection = (id: string): void => {
  const connections = getAPIConnections();
  const updatedConnections = connections.filter(conn => conn.id !== id);
  localStorage.setItem('api_connections', JSON.stringify(updatedConnections));
};

// API bağlantılarını temizle
export const clearAPIConnections = (): void => {
  localStorage.removeItem('api_connections');
};

// Aktif API bağlantısını ayarla
export const setActiveConnection = (id: string): void => {
  localStorage.setItem('active_api_connection', id);
};

// Aktif API bağlantısını getir
export const getActiveConnection = (): string | null => {
  return localStorage.getItem('active_api_connection');
};

// Aktif API bağlantı detaylarını getir
export const getActiveConnectionDetails = (): APIConnection | undefined => {
  const activeId = getActiveConnection();
  return activeId ? getAPIConnectionById(activeId) : undefined;
};