"use strict";
const common_vendor = require("../common/vendor.js");
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
function cloudCall(_0) {
  return __async(this, arguments, function* (action, data = {}, functionName = "volunteer-service") {
    try {
      ensureCloudInit();
      const res = yield common_vendor.wx$1.cloud.callFunction({
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
  });
}
exports.cloudCall = cloudCall;
