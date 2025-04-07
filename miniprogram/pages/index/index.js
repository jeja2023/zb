const http = require('../../utils/http.js');

Page({
  data: {
    userInfo: null,
    currentDate: '',
    duties: []
  },

  onLoad() {
    this.checkLoginStatus();
    this.loadUserInfo();
    this.setCurrentDate();
    this.loadDuties();
  },

  onShow() {
    this.loadDuties();
  },
  
  checkLoginStatus() {
    const app = getApp();
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        // 如果本地没有用户信息但有token,尝试从服务器获取
        const token = wx.getStorageSync('token');
        if (token) {
          const userInfo = await http.get('/api/auth/profile');
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ userInfo });
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 如果是认证错误,跳转到登录页
      if (error.statusCode === 401) {
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    }
  },

  setCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  async loadDuties() {
    try {
      const response = await http.get(`/api/duty/date/${this.data.currentDate}`);
      this.setData({
        duties: response
      });
    } catch (error) {
      console.error('加载值班记录失败:', error);
      wx.showToast({
        title: '获取值班记录失败',
        icon: 'none'
      });
    }
  },

  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
    this.loadDuties();
  },

  onAddDuty() {
    wx.navigateTo({
      url: '/pages/duty/add/add'
    });
  },

  onViewMyDuties() {
    console.log('点击了查看我的值班按钮');
    const userInfo = wx.getStorageSync('userInfo');
    console.log('用户信息:', userInfo);
    
    if (!userInfo) {
      console.log('用户未登录');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    console.log('准备跳转到值班记录页面');
    wx.switchTab({
      url: '/pages/duty/my/my',
      success: (res) => {
        console.log('页面跳转成功', res);
      },
      fail: (err) => {
        console.error('页面跳转失败', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }
}); 