const http = require('../../utils/http.js');

Page({
  data: {
    username: '',
    password: ''
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      // 验证token有效性
      this.verifyTokenAndRedirect();
    }
  },
  
  async verifyTokenAndRedirect() {
    try {
      // 验证token有效性
      await http.get('/api/auth/verify-token');
      
      // 如果token有效,跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    } catch (error) {
      console.error('Token验证失败:', error);
      // token无效,清除旧数据
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  async onLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请填写用户名和密码',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({
        title: '登录中...'
      });

      // 调用登录接口，使用表单格式
      const formData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`;

      const res = await http.post('/api/auth/token', formData, {
        'content-type': 'application/x-www-form-urlencoded'
      });

      wx.hideLoading();

      // 保存token
      wx.setStorageSync('token', res.access_token);
      
      // 更新全局状态
      const app = getApp();
      if (app) {
        app.globalData.token = res.access_token;
        app.globalData.isLoggedIn = true;
      }
      
      // 获取用户信息
      const userInfo = await http.get('/api/auth/profile');
      wx.setStorageSync('userInfo', userInfo);
      
      // 更新全局用户信息
      if (app) {
        app.globalData.userInfo = userInfo;
      }

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  onRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
}); 