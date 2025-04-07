const http = require('../../utils/http.js');

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    department: ''
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

  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  onRealNameInput(e) {
    this.setData({
      realName: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onDepartmentInput(e) {
    this.setData({
      department: e.detail.value
    });
  },

  async onRegister() {
    const { username, password, confirmPassword, realName, phone, department } = this.data;

    // 表单验证
    if (!username || !password || !confirmPassword || !realName || !phone || !department) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({
        title: '注册中...'
      });

      await http.post('/api/auth/register', {
        username,
        password,
        real_name: realName,
        phone,
        department
      });

      wx.hideLoading();
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });

      // 返回登录页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('注册失败:', error);
      wx.showToast({
        title: error.message || '注册失败',
        icon: 'none'
      });
    }
  },

  onBack() {
    wx.navigateBack();
  }
}); 