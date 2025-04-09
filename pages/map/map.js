// pages/map/map.js
Page({
  data: {
    searchValue: '',
    searchResults: []
  },
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
          longitude: res.longitude
        });
        wx.switchTab({
          url: '/pages/index/index'
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
          locationInfo: res.result
        });
      },
      fail: function(res) {
        console.error('逆地址解析失败：', res);
      }
    });
  },
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  onSearch: function(e) {
    const value = this.data.searchValue;
    if (!value.trim()) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    // 执行搜索逻辑
    this.searchPlaces(value);
  },

  searchPlaces: function(value) {
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