// API 配置文件
export const API_CONFIG = {
  // API 类型：'wordpress' 或 'strapi'
  type: 'wordpress',
  
  // WordPress API 配置
  wordpress: {
    baseUrl: 'http://172.16.69.13:8080/wp-json',
    endpoints: {
      posts: '/wp/v2/posts',
      media: '/wp/v2/media',
      users: '/wp/v2/users'
    }
  },
  
  // Strapi API 配置
  strapi: {
    baseUrl: 'http://localhost:1337/api',
    endpoints: {
      issues: '/issues',
      media: '/upload'
    }
  }
};

// 当前使用的 API 配置
export const getCurrentApi = () => {
  return API_CONFIG.type === 'wordpress' ? API_CONFIG.wordpress : API_CONFIG.strapi;
};

// 当前是否使用 WordPress
export const isWordPress = () => API_CONFIG.type === 'wordpress';

// 当前是否使用 Strapi
export const isStrapi = () => API_CONFIG.type === 'strapi'; 