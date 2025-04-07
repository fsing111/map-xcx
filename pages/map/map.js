// pages/map/map.js
Page({
  data: {},
  onLoad: function () {
    // 页面加载时的逻辑
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
          markers: [{
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude,
            title: '当前位置',
            width: 20,
            height: 20
          }]
        });
        // 获取位置详情
        that.getLocationInfo(res.latitude, res.longitude);
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
          locationInfo: res.result
        });
      },
      fail: function(res) {
        console.error('逆地址解析失败：', res);
      }
    });
  },
  searchPlaces: function(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value
    });
    
    if (value.length > 0) {
      const that = this;
      qqmapsdk.search({
        keyword: value,
        success: function(res) {
          console.log('搜索结果：', res);
          that.setData({
            searchResults: res.data,
            showSearchResults: true
          });
        },
        fail: function(res) {
          console.error('搜索失败：', res);
        }
      });
    } else {
      this.setData({
        searchResults: [],
        showSearchResults: false
      });
    }
  },
  selectLocation: function(e) {
    const index = e.currentTarget.dataset.index;
    const location = this.data.searchResults[index];
    
    this.setData({
      latitude: location.location.lat,
      longitude: location.location.lng,
      markers: [{
        id: 1,
        latitude: location.location.lat,
        longitude: location.location.lng,
        title: location.title,
        width: 20,
        height: 20
      }],
      searchValue: '',
      searchResults: [],
      showSearchResults: false
    });
  }
})