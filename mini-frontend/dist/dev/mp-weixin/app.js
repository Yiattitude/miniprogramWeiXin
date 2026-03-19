"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/auth/login.js";
  "./pages/auth/bind.js";
  "./pages/volunteer/index.js";
  "./pages/volunteer/profile.js";
  "./pages/volunteer/publish.js";
  "./pages/volunteer/checkin-list.js";
  "./pages/volunteer/checkin-form.js";
  "./pages/volunteer/record.js";
  "./pages/volunteer/statistics.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    onLaunch(() => {
      if (!common_vendor.wx$1.cloud) {
        console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      } else {
        common_vendor.wx$1.cloud.init({
          env: "cloud1-9gqeut4h5f964174",
          traceUser: true
        });
      }
      if (userStore.isLoggedIn) {
        userStore.fetchProfile().catch((err) => {
          console.error("获取用户信息失败", err);
        });
      }
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
});
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
