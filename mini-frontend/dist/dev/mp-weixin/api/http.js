"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8080";
function request(options) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method ?? "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {},
        ...options.header
      },
      success(res) {
        const result = res.data;
        if (result.code === 0) {
          resolve(result.data);
        } else if (result.code === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.reLaunch({ url: "/pages/login/index" });
          reject(new Error("登录已过期，请重新登录"));
        } else {
          common_vendor.index.showToast({ title: result.message || "请求失败", icon: "none" });
          reject(new Error(result.message));
        }
      },
      fail(err) {
        common_vendor.index.showToast({ title: "网络异常，请检查连接", icon: "none" });
        reject(err);
      }
    });
  });
}
const http = {
  get(url, params) {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== void 0 && v !== null && v !== "")
    ) : void 0;
    return request({ url, method: "GET", data: cleanParams });
  },
  post(url, data) {
    return request({ url, method: "POST", data });
  },
  put(url, data) {
    return request({ url, method: "PUT", data });
  },
  delete(url, data) {
    return request({ url, method: "DELETE", data });
  }
};
exports.http = http;
