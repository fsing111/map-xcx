// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    functionList: [
      { id: 1, name: '我的收藏', icon: 'star', url: '' },
      { id: 2, name: '历史记录', icon: 'time', url: '' },
      { id: 3, name: '意见反馈', icon: 'comment', url: '' },
      { id: 4, name: '关于我们', icon: 'info', url: '' }
    ]
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  navigateToFunction(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.functionList.find(item => item.id === id);
    
    if (item && item.url) {
      wx.navigateTo({
        url: item.url
      })
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
})