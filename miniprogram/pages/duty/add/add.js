const http = require('../../../utils/http.js');

Page({
  data: {
    date: '',
    shift: '早班',
    shiftIndex: 0,
    shifts: ['早班', '中班', '晚班'],
    remark: ''
  },

  onLoad() {
    this.setCurrentDate();
  },

  setCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.setData({
      date: `${year}-${month}-${day}`
    });
  },

  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  onShiftChange(e) {
    this.setData({
      shiftIndex: e.detail.value,
      shift: this.data.shifts[e.detail.value]
    });
  },

  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  async onSubmit() {
    const { date, shift, remark } = this.data;

    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({
        title: '提交中...'
      });

      await http.post('/api/duty', {
        date,
        shift,
        remark
      });

      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('添加值班记录失败:', error);
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      });
    }
  },

  onCancel() {
    wx.navigateBack();
  }
}); 