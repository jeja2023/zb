// 基础URL
const BASE_URL = 'http://localhost:5000'

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
  return config
}

// 响应拦截器
const responseInterceptor = (response) => {
  // 检查响应状态
  if (response.statusCode === 401) {
    // token过期，清除本地存储并跳转到登录页
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.navigateTo({
      url: '/pages/login/login'
    })
    throw new Error('登录已过期，请重新登录')
  }
  if (response.statusCode === 403) {
    throw new Error('无权执行此操作')
  }
  if (response.statusCode === 404) {
    throw new Error('请求的资源不存在')
  }
  if (response.statusCode >= 500) {
    throw new Error('服务器内部错误，请稍后重试')
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
        // 响应拦截
        const response = responseInterceptor(res)
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data)
        } else {
          reject(new Error(response.data.detail || '请求失败'))
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject(new Error('网络请求失败'))
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