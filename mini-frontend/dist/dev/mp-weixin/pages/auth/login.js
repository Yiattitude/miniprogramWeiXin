"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_user = require("../../api/user.js");
if (!Math) {
  LoginModal();
}
const LoginModal = () => "../../components/auth/LoginModal.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const redirect = common_vendor.ref("/pages/index/index");
    const forceBind = common_vendor.ref(false);
    const didAutoJump = common_vendor.ref(false);
    common_vendor.onLoad((query) => {
      const r = (query == null ? void 0 : query.redirect) || "";
      if (r)
        redirect.value = decodeURIComponent(r);
      forceBind.value = String((query == null ? void 0 : query.forceBind) || "") === "1";
      if (forceBind.value && !didAutoJump.value) {
        didAutoJump.value = true;
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: `/pages/auth/bind?openid=${encodeURIComponent(
              "mock_openid_" + Date.now()
            )}&redirect=${encodeURIComponent(redirect.value || "/pages/index/index")}`
          });
        }, 0);
      }
    });
    function isTabPage(url) {
      return url === "/pages/index/index" || url === "/pages/volunteer/index" || url === "/pages/volunteer/profile";
    }
    function needProfileBind(info) {
      const userInfo = info || {};
      const realName = String(
        userInfo.realName ?? userInfo.real_name ?? userInfo.fullName ?? userInfo.full_name ?? ""
      ).trim();
      const phone = String(
        userInfo.phone ?? userInfo.mobile ?? userInfo.phoneNumber ?? userInfo.tel ?? ""
      ).trim();
      return !realName || !phone;
    }
    async function onWechatCode(code) {
      try {
        common_vendor.index.showLoading({ title: "登录中..." });
        if (forceBind.value) {
          common_vendor.index.navigateTo({
            url: `/pages/auth/bind?openid=${encodeURIComponent(
              "mock_openid_" + Date.now()
            )}&redirect=${encodeURIComponent(redirect.value || "/pages/index/index")}`
          });
          return;
        }
        const res = await api_user.api.wechatLogin({ code });
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
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onWechatCode)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6c56cc25"]]);
wx.createPage(MiniProgramPage);
