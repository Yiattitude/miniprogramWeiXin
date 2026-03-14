Page({
  data: {
    loading: false
  },
  onLoad() {
    const stores_user = require("../../stores/user.js");
    const userStore = stores_user.useUserStore();
    if (userStore.isLoggedIn) {
      wx.reLaunch({ url: "/pages/index/index" });
    }
  },
  showToast(title) {
    wx.showToast({ title, icon: "none" });
  },
  async handleWechatLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const profileRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: "\u7528\u4e8e\u5b8c\u5584\u5fd7\u613f\u8005\u8d44\u6599",
          success: resolve,
          fail: reject
        });
      });

      const wechatUser = (profileRes && profileRes.userInfo) || {};

      const res = await wx.cloud.callFunction({
        name: "volunteer-service",
        data: {
          action: "login",
          data: {
            userInfo: wechatUser
          }
        }
      });

      const result = (res && res.result) || {};
      if (result.code !== 0) {
        throw new Error(result.message || "\u767b\u5f55\u5931\u8d25");
      }

      const profile = result.data || {};
      const mergedProfile = Object.assign({}, profile, wechatUser);
      const token = profile.openid || profile._openid || "logged";

      const stores_user = require("../../stores/user.js");
      const userStore = stores_user.useUserStore();
      if (userStore && typeof userStore.login === "function") {
        userStore.login({ token, userInfo: mergedProfile });
      } else {
        wx.setStorageSync("token", token);
        wx.setStorageSync("userInfo", mergedProfile);
      }

      wx.setStorageSync("token", token);
      wx.setStorageSync("userInfo", mergedProfile);

      wx.showToast({ title: "\u767b\u5f55\u6210\u529f", icon: "success" });
      setTimeout(() => {
        wx.reLaunch({ url: "/pages/index/index" });
      }, 300);
    } catch (err) {
      const msg = (err && (err.errMsg || err.message)) || "";
      if (msg.includes("cancel")) {
        this.showToast("\u5df2\u53d6\u6d88\u6388\u6743");
      } else {
        this.showToast("\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
        console.error("wechat login failed", err);
      }
    } finally {
      this.setData({ loading: false });
    }
  }
});