// 基础URL
const BASE_URL = 'http://localhost:8000'

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加token到请求头
  const token = wx.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 如果是token接口或者明确传入了token参数,优先使用传入的token
  if (config.data && config.data.token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${config.data.token}`
    }
    // 删除请求体中的token参数,防止影响API调用
    delete config.data.token;
  }
  
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  // 检查响应状态
  if (response.statusCode === 401) {
    // token过期，清除本地存储并跳转到登录页
    const app = getApp();
    if (app) {
      app.clearLoginState();
    } else {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    }
    
    // 如果不是在验证token的接口,则跳转到登录页
    if (!response.config || !response.config.url.includes('/api/auth/verify-token')) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
    
    throw {
      message: '登录已过期，请重新登录',
      statusCode: 401
    };
  }
  if (response.statusCode === 403) {
    throw {
      message: '无权执行此操作',
      statusCode: 403
    };
  }
  if (response.statusCode === 404) {
    throw {
      message: '请求的资源不存在',
      statusCode: 404
    };
  }
  if (response.statusCode === 422) {
    throw {
      message: response.data.detail || '请求参数错误',
      statusCode: 422
    };
  }
  if (response.statusCode >= 500) {
    throw {
      message: '服务器内部错误，请稍后重试',
      statusCode: response.statusCode
    };
  }
  return response
}

// 请求方法
const request = (method, url, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const config = requestInterceptor({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...headers
      }
    })

    wx.request({
      ...config,
      success: (res) => {
        try {
          // 添加请求URL到响应对象,以便响应拦截器使用
          res.config = {url};
          
          // 响应拦截
          const response = responseInterceptor(res)
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(response.data)
          } else {
            reject({
              message: response.data.detail || '请求失败',
              statusCode: response.statusCode
            })
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject({
          message: '网络请求失败',
          statusCode: 0
        })
      }
    })
  })
}

// 导出请求方法
module.exports = {
  get: (url, data) => request('GET', url, data),
  post: (url, data, headers) => request('POST', url, data, headers),
  put: (url, data) => request('PUT', url, data),
  delete: (url, data) => request('DELETE', url, data)
} 