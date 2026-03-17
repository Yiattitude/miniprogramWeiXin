"use strict";
const common_vendor = require("../common/vendor.js");
const stores_user = require("../stores/user.js");
const api_user = require("../api/user.js");
function useAuth() {
  const userStore = stores_user.useUserStore();
  const loading = common_vendor.ref(false);
  const error = common_vendor.ref(null);
  const isLoggedIn = common_vendor.computed(() => !!userStore.token);
  const currentUser = common_vendor.computed(() => userStore.userInfo);
  function getCurrentPath() {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const route = (current == null ? void 0 : current.route) ? `/${current.route}` : "/pages/index/index";
    const options = (current == null ? void 0 : current.options) || {};
    const qs = Object.keys(options).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`).join("&");
    return qs ? `${route}?${qs}` : route;
  }
  function openLoginPage(redirect) {
    const r = redirect || getCurrentPath();
    common_vendor.index.navigateTo({
      url: `/pages/auth/login?redirect=${encodeURIComponent(r)}`
    });
  }
  async function requireLogin(options) {
    if (userStore.isLoggedIn)
      return true;
    const title = (options == null ? void 0 : options.title) || "提示";
    const content = (options == null ? void 0 : options.content) || "此操作需要登录，是否立即登录？";
    const redirect = (options == null ? void 0 : options.redirect) || getCurrentPath();
    return await new Promise((resolve) => {
      common_vendor.index.showModal({
        title,
        content,
        confirmText: "去登录",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            openLoginPage(redirect);
            resolve(false);
          } else {
            resolve(false);
          }
        },
        fail() {
          resolve(false);
        }
      });
    });
  }
  async function handleWeChatLogin(redirect) {
    loading.value = true;
    error.value = null;
    try {
      const loginRes = await common_vendor.index.login({
        provider: "weixin"
      });
      if (loginRes.code) {
        const authResult = await api_user.api.wechatLogin({ code: loginRes.code });
        if (authResult.needBinding) {
          const openid = authResult.openid || "";
          const r = redirect || getCurrentPath();
          common_vendor.index.navigateTo({
            url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(r)}`
          });
          return { needBinding: true, openid };
        }
        if (authResult.token) {
          userStore.token = authResult.token;
          if (authResult.userInfo)
            userStore.syncUserInfo(authResult.userInfo);
          return { success: true };
        }
      }
    } catch (err) {
      error.value = err.message || "登录失败";
      console.error("WeChat login error:", err);
    } finally {
      loading.value = false;
    }
  }
  async function bindUserInfo(realName, phone) {
    loading.value = true;
    error.value = null;
    try {
      const bindRes = await api_user.api.bindUser({
        openid: getCurrentOpenId(),
        realName,
        phone
      });
      if (bindRes.success) {
        if (bindRes.token)
          userStore.token = bindRes.token;
        if (bindRes.userInfo)
          userStore.syncUserInfo(bindRes.userInfo);
        return { success: true };
      } else {
        error.value = bindRes.message || "绑定失败";
        return { success: false, message: error.value };
      }
    } catch (err) {
      error.value = err.message || "网络错误";
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }
  function logout() {
    userStore.logout();
  }
  function getCurrentOpenId() {
    return common_vendor.index.getStorageSync("openid") || "";
  }
  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    openLoginPage,
    requireLogin,
    handleWeChatLogin,
    bindUserInfo,
    logout
  };
}
exports.useAuth = useAuth;
