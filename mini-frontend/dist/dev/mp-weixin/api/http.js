"use strict";
const common_vendor = require("../common/vendor.js");
let cloudInited = false;
function ensureCloudInit() {
  try {
    const wxAny = common_vendor.wx$1;
    if (!(wxAny == null ? void 0 : wxAny.cloud))
      return;
    if (cloudInited)
      return;
    wxAny.cloud.init({
      // 与 App.vue 保持一致；若你后续改 env，请同步这里
      env: "cloud1-9gqeut4h5f964174",
      traceUser: true
    });
    cloudInited = true;
  } catch (e) {
    console.warn("[cloud] init failed:", e);
  }
}
async function cloudCall(action, data = {}, functionName = "volunteer-service") {
  try {
    ensureCloudInit();
    const res = await common_vendor.wx$1.cloud.callFunction({
      name: functionName,
      data: {
        action,
        data
      }
    });
    const result = res.result;
    if (result.code === 0) {
      return result.data;
    } else {
      common_vendor.index.showToast({
        title: result.message || "操作失败",
        icon: "none"
      });
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(`[Cloud Function Error] ${action}:`, error);
    if (!action.includes("silent")) {
      common_vendor.index.showToast({
        title: "服务暂时不可用",
        icon: "error"
      });
    }
    throw error;
  }
}
exports.cloudCall = cloudCall;
