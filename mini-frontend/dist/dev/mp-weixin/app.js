"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/volunteer/index.js";
  "./pages/volunteer/profile.js";
  "./pages/volunteer/publish.js";
  "./pages/volunteer/signup-list.js";
  "./pages/volunteer/signup-detail.js";
  "./pages/volunteer/checkin-list.js";
  "./pages/volunteer/checkin-form.js";
  "./pages/volunteer/record.js";
  "./pages/volunteer/statistics.js";
  "./pages/auth/login.js";
}
const AUTH_WHITE_LIST = ["/pages/auth/login"];
let authRedirecting = false;
let authRedirectTimer = null;
function isAuthPage(url) {
  return AUTH_WHITE_LIST.some((path) => url.startsWith(path));
}
function redirectToLogin() {
  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  const current = pages.length ? `/${pages[pages.length - 1].route}` : "";
  if (isAuthPage(current)) {
    authRedirecting = false;
    return;
  }
  if (authRedirecting) {
    return;
  }
  authRedirecting = true;
  if (authRedirectTimer) {
    clearTimeout(authRedirectTimer);
    authRedirectTimer = null;
  }
  authRedirectTimer = setTimeout(() => {
    common_vendor.index.reLaunch({
      url: "/pages/auth/login",
      complete() {
        authRedirecting = false;
      },
      fail() {
        authRedirecting = false;
      }
    });
  }, 50);
}
function setupAuthGuard(userStore) {
  const guard = (args) => {
    const url = (args == null ? void 0 : args.url) || "";
    if (!userStore.isLoggedIn && !isAuthPage(url)) {
      redirectToLogin();
      return false;
    }
    return args;
  };
  common_vendor.index.addInterceptor("navigateTo", { invoke: guard });
  common_vendor.index.addInterceptor("redirectTo", { invoke: guard });
  common_vendor.index.addInterceptor("reLaunch", { invoke: guard });
  common_vendor.index.addInterceptor("switchTab", { invoke: guard });
}
function refreshUserProfile(userStore) {
  if (!common_vendor.wx$1.cloud) {
    return;
  }
  return common_vendor.wx$1.cloud.callFunction({
    name: "volunteer-service",
    data: {
      action: "login",
      data: { userInfo: {} }
    }
  }).then((res) => {
    const result = res && res.result || {};
    if (result.code === 0 && result.data) {
      return userStore.fetchProfile(result.data);
    }
    return userStore.fetchProfile();
  }).catch((err) => {
    console.error("Failed to refresh user profile", err);
    return userStore.fetchProfile();
  });
}
const _sfc_main = {
  onLaunch() {
    if (!common_vendor.wx$1.cloud) {
      console.error("WeChat base library >= 2.2.3 required");
    } else {
      common_vendor.wx$1.cloud.init({
        env: "cloud1-9gqeut4h5f964174",
        traceUser: true
      });
    }
    const userStore = stores_user.useUserStore();
    setupAuthGuard(userStore);
    if (!userStore.isLoggedIn && userStore.userInfo) {
      const fallbackToken = userStore.userInfo.openid || userStore.userInfo._openid || "logged";
      userStore.login({ token: fallbackToken, userInfo: userStore.userInfo });
    }
    if (userStore.isLoggedIn) {
      refreshUserProfile(userStore);
    } else {
      redirectToLogin();
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;