// pages/location_search/location_search.js
Page({
  data: {
    searchResults: [],
    keyword: '',
    selectedLocation: null
  },

  onLoad: function(options) {
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
      // 显示搜索结果
      if (options.searchResults) {
        try {
          const decodedResults = decodeURIComponent(options.searchResults);
          const results = JSON.parse(decodedResults);
          this.setData({
            searchResults: results
          });
        } catch (e) {
          console.error('解析搜索结果失败：', e);
        }
      }
    }
  },

  // 选择位置
  selectLocation: function(e) {
    const index = e.currentTarget.dataset.index;
    const location = this.data.searchResults[index];
    
    // 添加位置信息验证
    if (!location || !location.location || !location.location.lat || !location.location.lng) {
      wx.showToast({
        title: '位置信息无效',
        icon: 'error'
      });
      return;
    }
    
    this.setData({
      selectedLocation: location
    });

    // 返回到地图页面并传递选中的位置信息
    const pages = getCurrentPages();
    const mapPage = pages[pages.length - 2]; // 获取地图页面
    
    if (mapPage) {
      mapPage.setData({
        latitude: location.location.lat,
        longitude: location.location.lng,
        markers: [{
          id: 1,
          latitude: location.location.lat,
          longitude: location.location.lng,
          title: location.title,
          address: location.address,
          callout: {
            content: location.title,
            color: '#000000',
            fontSize: 14,
            borderRadius: 4,
            bgColor: '#ffffff',
            padding: 8,
            display: 'ALWAYS'
          }
        }]
      });

      wx.showToast({
        title: '已选择位置',
        icon: 'success'
      });
    }
    
    wx.navigateBack({
      delta: 1
    });
  }
})