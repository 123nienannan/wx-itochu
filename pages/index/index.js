//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: "", 
    personName:'',
    workNumber:'',
    canvasWidth:"",
    canvasHeight:''
  },
  setName(e) {
    this.setData({
      personName: e.detail.value
    })
  },
  setNumber(e) {
    this.setData({
      workNumber: e.detail.value
    })
  },
  uploadPhoto() {
    var that = this
    wx.chooseImage({
      count: 1, 
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success:function(photo) {
        var tempFilePaths = photo.tempFilePaths
        wx.getImageInfo({
          src: photo.tempFilePaths[0],
          success:function(res){
            console.log(res)
            var ctx = wx.createCanvasContext('photo_canvas')
            var ratio=1
            var canvasWidth = res.width
            var canvasHeight = res.height
            while (canvasWidth > 200 || canvasHeight > 200) {
              //比例取整
              canvasWidth = Math.trunc(res.width / ratio)
              canvasHeight = Math.trunc(res.height / ratio)
              ratio++;
            }
            that.setData({
              canvasWidth: canvasWidth,
              canvasHeight: canvasHeight
            })//设置canvas尺寸
            ctx.drawImage(photo.tempFilePaths[0], 0, 0, canvasWidth, canvasHeight)
            ctx.draw()
            //下载canvas图片
            setTimeout(function () {
              wx.canvasToTempFilePath({
                canvasId: 'photo_canvas',
                fileType: "jpg",
                success: function (res) {
                  that.upload(that, res.tempFilePath)
                },
                fail: function (error) {
                  // console.log(error)
                }
              })
            }, 100)
          }
        })
      }
    })
  },
  upload(page, path) {
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    }),
      wx.uploadFile({
        url: 'https://twc.digirogar.com/itochu-meeting/file/wx/upload',
        filePath: path,
        name: 'file',
        success: function (res) {
          if (res.statusCode != 200) {
            wx.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000
            })
            return;
          }
          var data = res.data
          page.setData({ //上传成功修改显示头像
            src: path
          })
        },
        fail: function (e) {
          wx.showToast({
            title: '失败',
            icon: 'none',
            duration: 2000
          })
        },
        complete: function () {
          wx.hideToast(); //隐藏Toast
        }
      })
  },
  enternext:function(e) {
    var that = this
    console.log(that.data)
    if (that.data.src == '') {
      wx.showToast({
        title: '头像不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.personName == '') {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.workNumber == '') {
      wx.showToast({
        title: '员工号不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.request({
      url: "https://twc.digirogar.com/itochu-meeting/wx/person/add",
      method: "POST",
      data: {
        personName: that.data.personName,
        workNumber: that.data.workNumber,
        photoUrl: that.data.src
      },
      success: function (res) {
        console.log(res)
        if(res.data.success){
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            personName: '',
            workNumber: '',
            src: ''
          })
        }else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000
          })
        }
        
      },
      fail: function(err) {
        
      }
    })
  }
})