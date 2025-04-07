const http = require('../../../utils/http')

Page({
  data: {
    dutyId: null,
    duty: null,
    date: '',
    shift: '',
    shiftIndex: 0,
    shifts: ['早班', '中班', '晚班'],
    statusIndex: 0,
    statuses: ['正常', '请假', '调班'],
    remark: ''
  },

  onLoad(options) {
    console.log('页面加载，选项：', options)
    if (options.id) {
      this.setData({
        dutyId: parseInt(options.id)
      })
      this.loadDutyDetail()
    }
  },

  async loadDutyDetail() {
    try {
      console.log('开始加载值班详情，ID：', this.data.dutyId)
      const data = await http.get(`/api/duty/${this.data.dutyId}`)
      console.log('获取到值班详情：', data)
      if (data) {
        const shiftIndex = this.data.shifts.indexOf(data.shift)
        const statusIndex = data.status - 1
        console.log('班次索引：', shiftIndex, '状态索引：', statusIndex)
        this.setData({
          duty: data,
          date: data.date,
          shift: data.shift,
          shiftIndex: shiftIndex >= 0 ? shiftIndex : 0,
          statusIndex: statusIndex >= 0 ? statusIndex : 0,
          remark: data.remark || ''
        })
      }
    } catch (error) {
      console.error('加载值班详情失败:', error)
      wx.showToast({
        title: error.message || '加载值班详情失败',
        icon: 'none'
      })
    }
  },

  onDateChange(e) {
    console.log('日期变更：', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

  onShiftChange(e) {
    const index = parseInt(e.detail.value)
    console.log('班次变更，索引：', index, '值：', this.data.shifts[index])
    this.setData({
      shiftIndex: index,
      shift: this.data.shifts[index]
    })
  },

  onStatusChange(e) {
    const index = parseInt(e.detail.value)
    console.log('状态变更，索引：', index, '值：', this.data.statuses[index])
    this.setData({
      statusIndex: index
    })
  },

  onRemarkInput(e) {
    console.log('备注输入：', e.detail.value)
    this.setData({
      remark: e.detail.value
    })
  },

  async onSubmit() {
    if (!this.data.date || !this.data.shift) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 检查 token
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    try {
      const submitData = {
        date: this.data.date,
        shift: this.data.shift,
        remark: this.data.remark,
        status: this.data.statusIndex + 1  // 状态从1开始
      }
      console.log('提交数据：', submitData)
      const data = await http.put(`/api/duty/${this.data.dutyId}`, submitData)

      if (data) {
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('修改值班记录失败:', error)
      wx.showToast({
        title: error.message || '修改失败',
        icon: 'none'
      })
    }
  },

  onCancel() {
    wx.navigateBack()
  }
}) 