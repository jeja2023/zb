const { request } = require('../../utils/request')

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
    if (options.id) {
      this.setData({
        dutyId: parseInt(options.id)
      })
      this.loadDutyDetail()
    }
  },

  async loadDutyDetail() {
    try {
      const res = await request.get(`/api/duty/${this.data.dutyId}`)
      if (res.data) {
        const shiftIndex = this.data.shifts.indexOf(res.data.shift)
        const statusIndex = res.data.status - 1
        this.setData({
          duty: res.data,
          date: res.data.date,
          shift: res.data.shift,
          shiftIndex: shiftIndex >= 0 ? shiftIndex : 0,
          statusIndex: statusIndex >= 0 ? statusIndex : 0,
          remark: res.data.remark || ''
        })
      }
    } catch (error) {
      console.error('加载值班详情失败:', error)
      wx.showToast({
        title: '加载值班详情失败',
        icon: 'none'
      })
    }
  },

  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  onShiftChange(e) {
    const index = e.detail.value
    this.setData({
      shiftIndex: index,
      shift: this.data.shifts[index]
    })
  },

  onStatusChange(e) {
    const index = e.detail.value
    this.setData({
      statusIndex: index
    })
  },

  onRemarkInput(e) {
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

    try {
      const res = await request.put(`/api/duty/${this.data.dutyId}`, {
        date: this.data.date,
        shift: this.data.shift,
        remark: this.data.remark,
        status: this.data.statusIndex + 1  // 状态从1开始
      })

      if (res.data) {
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
        title: '修改失败',
        icon: 'none'
      })
    }
  },

  onCancel() {
    wx.navigateBack()
  }
}) 