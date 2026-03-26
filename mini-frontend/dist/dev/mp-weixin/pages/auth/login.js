"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_user = require("../../api/user.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
if (!Math) {
  LoginModal();
}
const LoginModal = () => "../../components/auth/LoginModal.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const redirect = common_vendor.ref("/pages/index/index");
    common_vendor.onLoad((query) => {
      const r = (query == null ? void 0 : query.redirect) || "";
      if (r)
        redirect.value = decodeURIComponent(r);
    });
    function isTabPage(url) {
      return url === "/pages/index/index" || url === "/pages/volunteer/index" || url === "/pages/volunteer/profile";
    }
    function needProfileBind(info) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const userInfo = info || {};
      const realName = String(
        (_d = (_c = (_b = (_a = userInfo.realName) != null ? _a : userInfo.real_name) != null ? _b : userInfo.fullName) != null ? _c : userInfo.full_name) != null ? _d : ""
      ).trim();
      const phone = String(
        (_h = (_g = (_f = (_e = userInfo.phone) != null ? _e : userInfo.mobile) != null ? _f : userInfo.phoneNumber) != null ? _g : userInfo.tel) != null ? _h : ""
      ).trim();
      return !realName || !phone;
    }
    function onAdminEntry() {
      const url = `/pages/auth/admin-login?redirect=${encodeURIComponent(
        redirect.value || "/pages/admin/statistics"
      )}`;
      common_vendor.index.navigateTo({ url });
    }
    function onWechatCode(code) {
      return __async(this, null, function* () {
        try {
          common_vendor.index.showLoading({ title: "登录中..." });
          const res = yield api_user.api.wechatLogin({ code });
          const openid = res.openid || "";
          if (openid) {
            common_vendor.index.setStorageSync("openid", openid);
          }
          if (res.needBinding) {
            if (!openid) {
              common_vendor.index.showToast({ title: "获取用户标识失败，请重试", icon: "none" });
              return;
            }
            common_vendor.index.navigateTo({
              url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(
                redirect.value || "/pages/index/index"
              )}`
            });
            return;
          }
          if (!res.token) {
            common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
            return;
          }
          if (needProfileBind(res.userInfo)) {
            if (!openid) {
              common_vendor.index.showToast({ title: "获取用户标识失败，请重试", icon: "none" });
              return;
            }
            common_vendor.index.navigateTo({
              url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(
                redirect.value || "/pages/index/index"
              )}`
            });
            return;
          }
          userStore.token = res.token;
          if (res.userInfo)
            userStore.syncUserInfo(res.userInfo);
        } finally {
          common_vendor.index.hideLoading();
        }
        const url = redirect.value || "/pages/volunteer/profile";
        if (isTabPage(url)) {
          common_vendor.index.switchTab({ url });
        } else {
          common_vendor.index.redirectTo({ url });
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onWechatCode),
        b: common_vendor.o(onAdminEntry)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6c56cc25"]]);
wx.createPage(MiniProgramPage);
