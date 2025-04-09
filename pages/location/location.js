// pages/location/location.js
Page({
  data: {
    latitude: '',
    longitude: '',
    address: ''
  },

  onLoad: function(options) {
    if (options.latitude && options.longitude) {
      this.setData({
        latitude: options.latitude,
        longitude: options.longitude
      });
      // 获取地址信息
      this.getLocationAddress(options.latitude, options.longitude);
    }
  },

  getLocationAddress: function(latitude, longitude) {
    const that = this;
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_KEY`,
      success: function(res) {
        if (res.data && res.data.result && res.data.result.address) {
          that.setData({
            address: res.data.result.address
          });
        }
      },
      fail: function(err) {
        console.error('获取地址信息失败：', err);
      }
    });
  }
})