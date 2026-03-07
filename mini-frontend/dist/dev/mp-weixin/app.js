"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_user = require("./stores/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/volunteer/index.js";
  "./pages/volunteer/publish.js";
  "./pages/volunteer/signup-list.js";
  "./pages/volunteer/signup-detail.js";
  "./pages/volunteer/checkin-list.js";
  "./pages/volunteer/checkin-form.js";
  "./pages/volunteer/record.js";
  "./pages/volunteer/profile.js";
  "./pages/volunteer/statistics.js";
}
const _sfc_main = {
  onLaunch() {
    const userStore = stores_user.useUserStore();
    if (userStore.isLoggedIn) {
      userStore.fetchProfile().catch(() => {
      });
    }
    
    
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return { app, pinia };
}
createApp().app.mount("#app");
exports.createApp = createApp;
