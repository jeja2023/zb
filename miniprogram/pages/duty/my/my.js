const http = require('../../../utils/http.js');

Page({
  data: {
    duties: []
  },

  onLoad() {
    this.loadDuties();
  },

  onShow() {
    this.loadDuties();
  },

  async loadDuties() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
        return;
      }

      const response = await http.get(`/api/duty/user/${userInfo.id}`);
      this.setData({
        duties: response
      });
    } catch (error) {
      console.error('加载值班记录失败:', error);
      wx.showToast({
        title: error.message || '加载值班记录失败',
        icon: 'none'
      });
    }
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/duty/edit/edit?id=${id}`
    });
  },

  async onDelete(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这条值班记录吗？'
      });

      if (res.confirm) {
        wx.showLoading({
          title: '删除中...'
        });

        await http.delete(`/api/duty/${id}`);

        wx.hideLoading();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        this.loadDuties();
      }
    } catch (error) {
      wx.hideLoading();
      console.error('删除值班记录失败:', error);
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  }
}); 