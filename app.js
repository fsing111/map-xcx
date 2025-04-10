// app.js
var QQMapWX = require('./qqmap-wx-jssdk.min.js');

App({
  onLaunch: function () {
    // 初始化腾讯地图SDK
    this.globalData.qqmapsdk = new QQMapWX({
      key: 'EYZBZ-373LQ-2EN5Q-BPW5O-TESME-MXBXJ' // 请替换为您申请的key
    });
  },
  globalData: {
    qqmapsdk: null
  }
})
