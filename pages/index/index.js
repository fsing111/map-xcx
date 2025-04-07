// index.js - 当前位置页面

var QQMapWX = require('../../qqmap-wx-jssdk.js');
var qqmapsdk;

Page({
  data: {
    // 移除与用户信息相关的数据
    // userInfo: {},
    // hasUserInfo: false,
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    locationInfo: null, // 用于存储位置信息
    markers: [], // 用于存储地图标记点
    latitude: 39.908860,
    longitude: 116.397390,
    showNavInput: false, // 控制导航输入框的显示
    navMode: 'driving', // 导航模式：驾车、公交、步行
    destination: '', // 导航目的地
    navRoutes: [] // 导航路线信息
  },
  onLoad: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'SO2BZ-OBFWL-KYVPT-M6UKQ-SKJZF-2EFKK', // 请确保使用您自己的密钥
      sk: 'hi8xapfFMhyCYC0T908fWyZGIoNvfvOF' // 添加sk
    });

    // 获取当前位置
    this.getCurrentLocation();
  },
  getCurrentLocation: function() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        console.log('当前位置信息：', res);
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          locationInfo: {
            address: `经度：${res.longitude}，纬度：${res.latitude}`
          },
          markers: [{
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude,
            title: '当前位置',
            width: 20,
            height: 20
          }]
        });
      },
      fail: function(err) {
        console.error('获取位置失败：', err);
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },
  getLocationInfo: function(latitude, longitude) {
    const that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        console.log('位置详情：', res);
        that.setData({
          locationInfo: res.result,
          markers: [{
            id: 0,
            latitude: latitude,
            longitude: longitude,
            title: '当前位置',
            iconPath: '/images/marker.png', // 如果需要自定义图标，请添加图标文件
            width: 20,
            height: 20
          }]
        });
      },
      fail: function(res) {
        console.error('逆地址解析失败：', res);
      }
    });
  },
  onShow: function () {
    // 页面显示时的逻辑
  },
  
  // 打开导航面板
  openNavigation: function() {
    this.setData({
      showNavInput: true
    });
  },
  
  // 关闭导航面板
  closeNavigation: function() {
    this.setData({
      showNavInput: false
    });
  },
  
  // 选择导航模式
  selectNavMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      navMode: mode
    });
  },
  
  // 输入目的地
  inputDestination: function(e) {
    this.setData({
      destination: e.detail.value
    });
  },
  
  // 开始导航
  startNavigation: function() {
    const that = this;
    const destination = this.data.destination;
    
    if (!destination) {
      wx.showToast({
        title: '请输入目的地',
        icon: 'none'
      });
      return;
    }
    
    // 先通过搜索接口获取目的地的经纬度
    qqmapsdk.search({
      keyword: destination,
      success: function(res) {
        console.log('目的地搜索结果：', res);
        if (res.data.length > 0) {
          const destLocation = res.data[0].location;
          that.calculateRoute(destLocation);
        } else {
          wx.showToast({
            title: '未找到该地点',
            icon: 'none'
          });
        }
      },
      fail: function(res) {
        console.error('搜索目的地失败：', res);
        wx.showToast({
          title: '搜索目的地失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 计算路线
  calculateRoute: function(destLocation) {
    const that = this;
    const mode = this.data.navMode;
    
    qqmapsdk.direction({
      mode: mode,
      from: {
        latitude: this.data.latitude,
        longitude: this.data.longitude
      },
      to: {
        latitude: destLocation.lat,
        longitude: destLocation.lng
      },
      success: function(res) {
        console.log('路线规划成功：', res);
        that.setData({
          navRoutes: res.result.routes,
          showNavInput: false
        });
        
        // 显示导航信息
        that.showNavigationInfo(res.result);
      },
      fail: function(res) {
        console.error('路线规划失败：', res);
        wx.showToast({
          title: '路线规划失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 显示导航信息
  showNavigationInfo: function(result) {
    const routes = result.routes[0];
    const distance = routes.distance;
    const duration = routes.duration;
    
    // 格式化距离和时间
    const distanceText = distance > 1000 ? (distance / 1000).toFixed(1) + '公里' : distance + '米';
    const durationText = Math.ceil(duration / 60) + '分钟';
    
    wx.showModal({
      title: '导航信息',
      content: `距离：${distanceText}\n预计用时：${durationText}\n是否开始导航？`,
      confirmText: '开始',
      success: function(res) {
        if (res.confirm) {
          // 打开微信内置地图导航
          wx.openLocation({
            latitude: parseFloat(result.routes[0].polyline[result.routes[0].polyline.length - 1].lat),
            longitude: parseFloat(result.routes[0].polyline[result.routes[0].polyline.length - 1].lng),
            name: result.routes[0].destination.title || '目的地',
            address: result.routes[0].destination.address || '',
            scale: 18
          });
        }
      }
    });
  },
  // 移除获取用户信息的函数
  // getUserInfo: function(e) {
  //   console.log(e)
  //   app.globalData.userInfo = e.detail.userInfo
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // }
})
