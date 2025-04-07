App({
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:8000',  // 修改为正确的端口号
    token: null,
    isLoggedIn: false
  },
  onLaunch() {
    // 检查本地存储中的token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.globalData.isLoggedIn = true;
      
      // 加载用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      } else {
        // 如果有token但没有用户信息,尝试获取用户信息
        this.getUserInfo();
      }
      
      // 验证token有效性
      this.verifyToken();
    }
  },
  
  async getUserInfo() {
    const http = require('./utils/http.js');
    try {
      const userInfo = await http.get('/api/auth/profile');
      wx.setStorageSync('userInfo', userInfo);
      this.globalData.userInfo = userInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果token已过期,清除登录状态
      if (error.statusCode === 401) {
        this.clearLoginState();
      }
    }
  },
  
  async verifyToken() {
    const http = require('./utils/http.js');
    try {
      // 调用一个需要认证的API来验证token是否有效
      await http.get('/api/auth/verify-token');
    } catch (error) {
      console.error('Token验证失败:', error);
      // 如果token已过期,清除登录状态
      if (error.statusCode === 401) {
        this.clearLoginState();
      }
    }
  },
  
  clearLoginState() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
  }
}); 