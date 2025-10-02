// Utilidades optimizadas para llamadas API
import { tweetsCache, profilesCache, likesCache } from './cache.js';

// API optimizada para obtener tweets con caché
export const fetchTweetsOptimized = async (userId = null) => {
  const cacheKey = userId ? `user-tweets-${userId}` : 'all-tweets';
  
  // Verificar caché primero
  if (tweetsCache.has(cacheKey)) {
    console.log('📦 Tweets cargados desde caché');
    return tweetsCache.get(cacheKey);
  }

  try {
    const url = userId 
      ? `http://localhost:3000/tweets?user_id=${userId}` 
      : 'http://localhost:3000/tweets';
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar tweets');
    
    const data = await response.json();
    
    // Guardar en caché
    tweetsCache.set(cacheKey, data);
    console.log('🌐 Tweets cargados desde servidor y guardados en caché');
    
    return data;
  } catch (error) {
    console.error('Error al obtener tweets:', error);
    throw error;
  }
};

// API optimizada para obtener perfil de usuario con caché
export const fetchUserProfileOptimized = async (userId) => {
  const cacheKey = `profile-${userId}`;
  
  // Verificar caché primero
  if (profilesCache.has(cacheKey)) {
    console.log(`📦 Perfil ${userId} cargado desde caché`);
    return profilesCache.get(cacheKey);
  }

  try {
    const response = await fetch(`http://localhost:3000/users/${userId}/profile`);
    if (!response.ok) throw new Error('Error al cargar perfil');
    
    const data = await response.json();
    
    // Guardar en caché
    profilesCache.set(cacheKey, data);
    console.log(`🌐 Perfil ${userId} cargado desde servidor y guardado en caché`);
    
    return data;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
};

// API optimizada para verificar likes con caché
export const checkUserLikeOptimized = async (tweetId, userId) => {
  const cacheKey = `like-${tweetId}-${userId}`;
  
  // Verificar caché primero
  if (likesCache.has(cacheKey)) {
    return likesCache.get(cacheKey);
  }

  try {
    const response = await fetch(`http://localhost:3000/tweets/${tweetId}/likes?user_id=${userId}`);
    if (!response.ok) throw new Error('Error al verificar like');
    
    const data = await response.json();
    
    // Guardar en caché
    likesCache.set(cacheKey, data.liked);
    
    return data.liked;
  } catch (error) {
    console.error('Error al verificar like:', error);
    return false;
  }
};

// Limpiar caché cuando sea necesario
export const clearCache = () => {
  tweetsCache.clear();
  profilesCache.clear();
  likesCache.clear();
  console.log('🧹 Caché limpiado');
};

// Invalidar caché específico cuando se actualicen datos
export const invalidateTweetsCache = (userId = null) => {
  const cacheKey = userId ? `user-tweets-${userId}` : 'all-tweets';
  tweetsCache.delete(cacheKey);
  console.log(`🗑️ Caché de tweets invalidado: ${cacheKey}`);
};

export const invalidateProfileCache = (userId) => {
  const cacheKey = `profile-${userId}`;
  profilesCache.delete(cacheKey);
  console.log(`🗑️ Caché de perfil invalidado: ${cacheKey}`);
};

export const invalidateLikeCache = (tweetId, userId) => {
  const cacheKey = `like-${tweetId}-${userId}`;
  likesCache.delete(cacheKey);
  console.log(`🗑️ Caché de like invalidado: ${cacheKey}`);
};