"use strict";
const api_http = require("./http.js");
async function wechatLogin(data) {
  var _a, _b, _c, _d;
  const raw = await api_http.cloudCall("wechatLogin", data, "volunteer-service");
  const needBinding = (raw == null ? void 0 : raw.needBinding) ?? (raw == null ? void 0 : raw.need_binding) ?? (raw == null ? void 0 : raw.needBind) ?? (raw == null ? void 0 : raw.need_bind) ?? false;
  const openid = (raw == null ? void 0 : raw.openid) ?? (raw == null ? void 0 : raw.openId) ?? (raw == null ? void 0 : raw.open_id) ?? ((_a = raw == null ? void 0 : raw.data) == null ? void 0 : _a.openid) ?? "";
  const token = (raw == null ? void 0 : raw.token) ?? (raw == null ? void 0 : raw.accessToken) ?? (raw == null ? void 0 : raw.access_token) ?? ((_b = raw == null ? void 0 : raw.data) == null ? void 0 : _b.token) ?? "";
  const userInfo = (raw == null ? void 0 : raw.userInfo) ?? (raw == null ? void 0 : raw.user_info) ?? ((_c = raw == null ? void 0 : raw.data) == null ? void 0 : _c.userInfo) ?? ((_d = raw == null ? void 0 : raw.data) == null ? void 0 : _d.user_info);
  return {
    needBinding: !!needBinding,
    openid: openid || void 0,
    token: token || void 0,
    userInfo
  };
}
async function bindUser(data) {
  try {
    const result = await api_http.cloudCall(
      "bindUser",
      data,
      "volunteer-service"
    );
    return { success: true, token: result.token, userInfo: result.userInfo, message: "绑定成功" };
  } catch (error) {
    console.error("Bind user error:", error);
    return {
      success: false,
      message: "网络错误，请稍后重试"
    };
  }
}
const api = {
  wechatLogin,
  bindUser
};
exports.api = api;
exports.bindUser = bindUser;
