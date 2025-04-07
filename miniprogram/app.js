App({
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:5000',  // Python Flask默认端口是5000
    token: null
  },
  onLaunch() {
    // 检查本地存储中的token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  }
}); 