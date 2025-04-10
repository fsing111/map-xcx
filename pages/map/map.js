// pages/map/map.js
const QQMapWX = require('../../qqmap-wx-jssdk.min.js');
let qqmapsdk;

Page({
  data: {
    searchValue: '',
    searchResults: [],
    suggestions: [],
    showSuggestions: false,
    scale: 1,
    translateX: 0,
    translateY: 0,
    lastTapTime: 0,
    lastScale: 1,
    lastX: 0,
    lastY: 0
  },
  onLoad: function () {
    // 初始化腾讯地图SDK
    qqmapsdk = new QQMapWX({
      key: 'EYZBZ-373LQ-2EN5Q-BPW5O-TESME-MXBXJ'
    });
    
    // 页面加载时的逻辑
    this.setData({
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  },

  handleTouchStart: function(e) {
    if (e.touches.length === 1) {
      // 单指触摸，记录起始位置
      const touch = e.touches[0];
      this.setData({
        lastX: touch.clientX - this.data.translateX,
        lastY: touch.clientY - this.data.translateY
      });
    } else if (e.touches.length === 2) {
      // 双指触摸，计算初始距离
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      this.initialDistance = distance;
      this.initialScale = this.data.scale;
    }
  },

  handleTouchMove: function(e) {
    if (e.touches.length === 1) {
      // 单指拖动
      const touch = e.touches[0];
      let newX = touch.clientX - this.data.lastX;
      let newY = touch.clientY - this.data.lastY;

      // 获取视口尺寸
      const viewportWidth = wx.getSystemInfoSync().windowWidth;
      const viewportHeight = wx.getSystemInfoSync().windowHeight;
      
      // 计算图片实际尺寸
      const imageWidth = viewportWidth * this.data.scale;
      const imageHeight = viewportHeight * this.data.scale;
      
      // 计算可移动的最大范围
      const maxTranslateX = Math.max(0, (imageWidth - viewportWidth) / 4); // 将除数从2改为4
      const maxTranslateY = Math.max(0, (imageHeight - viewportHeight) / 4); // 将除数从2改为4

      // 严格限制拖动范围，确保不会出现空白
      newX = Math.min(Math.max(newX, -maxTranslateX), maxTranslateX);
      newY = Math.min(Math.max(newY, -maxTranslateY), maxTranslateY);

      this.setData({
        translateX: newX,
        translateY: newY
      });
    } else if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const newScale = (distance / this.initialDistance) * this.initialScale;
      // 限制缩放范围在1到3之间，确保图片至少填充满屏幕
      const scale = Math.min(Math.max(newScale, 1), 3);

      // 保持当前中心点不变
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      this.setData({
        scale: scale,
        translateX: this.data.translateX,
        translateY: this.data.translateY
      });
    }
  },

  handleTouchEnd: function(e) {
    // 处理双击缩放
    if (e.touches.length === 0) {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - this.data.lastTapTime;

      if (timeDiff < 300) {
        // 双击检测
        const newScale = this.data.scale === 1 ? 2 : 1;
        this.setData({
          scale: newScale,
          translateX: 0,
          translateY: 0
        });
      }

      this.setData({
        lastTapTime: currentTime
      });
    }
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

  onSearchInput: function(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value,
      showSuggestions: false,
      suggestions: []
    });
    
    if (value.length > 0) {
      const that = this;
      // 获取关键词提示
      qqmapsdk.getSuggestion({
        keyword: value,
        region: '北京市大兴区',
        region_fix: 1,
        success: function(res) {
          if (res.data && res.data.length > 0) {
            that.setData({
              suggestions: res.data,
              showSuggestions: true
            });
            that.setData({
              suggestions: res.data,
              showSuggestions: true
            });
          } else {
            that.setData({
              suggestions: [],
              showSuggestions: false
            });
          }
        },
        fail: function(res) {
          console.error('获取提示失败：', res);
          that.setData({
            suggestions: [],
            showSuggestions: false
          });
        }
      });
    } else {
      this.setData({
        suggestions: [],
        showSuggestions: false
      });
    }
  },

  // 选择提示的地点
  selectSuggestion: function(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.suggestions[index];
    this.setData({
      searchValue: suggestion.title,
      showSuggestions: false
    });
    this.searchPlaces(suggestion.title);
  },

  searchPlaces: function(value) {
    if (value.length > 0) {
      const that = this;
      qqmapsdk.search({
        keyword: value,
        region: '北京市大兴区',
        region_fix: 1,
        success: function(res) {
          console.log('搜索结果：', res);
          if (res.data && res.data.length > 0) {
            // 将搜索结果传递到location_search页面
            wx.navigateTo({
              url: `/pages/location_search/location_search?keyword=${encodeURIComponent(value)}&searchResults=${encodeURIComponent(JSON.stringify(res.data))}`
            });
          } else {
            wx.showToast({
              title: '未找到相关地点',
              icon: 'none'
            });
          }
        },
        fail: function(res) {
          console.error('搜索失败：', res);
          wx.showToast({
            title: '搜索失败',
            icon: 'none'
          });
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