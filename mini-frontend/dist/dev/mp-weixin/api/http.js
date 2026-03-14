"use strict";
const common_vendor = require("../common/vendor.js");
async function cloudCall(action, data = {}, functionName = "volunteer-service") {
  try {
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
        title: result.message || "鎿嶄綔澶辫触",
        icon: "none"
      });
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(`[Cloud Function Error] ${action}:`, error);
    if (!action.includes("silent")) {
      common_vendor.index.showToast({
        title: "\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528",
        icon: "error"
      });
    }
    throw error;
  }
}
exports.cloudCall = cloudCall;