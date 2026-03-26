"use strict";
const api_http = require("./http.js");
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
function pickDefined(values) {
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value !== void 0 && value !== null)
      return value;
  }
  return void 0;
}
function wechatLogin(data) {
  return __async(this, null, function* () {
    const raw = yield api_http.cloudCall("wechatLogin", data, "volunteer-service");
    const rawAny = raw;
    const dataAny = rawAny && rawAny.data ? rawAny.data : void 0;
    const needBindingValue = pickDefined([
      rawAny ? rawAny.needBinding : void 0,
      rawAny ? rawAny.need_binding : void 0,
      rawAny ? rawAny.needBind : void 0,
      rawAny ? rawAny.need_bind : void 0
    ]);
    const needBinding = needBindingValue === void 0 || needBindingValue === null ? false : needBindingValue;
    const openid = pickDefined([
      rawAny ? rawAny.openid : void 0,
      rawAny ? rawAny.openId : void 0,
      rawAny ? rawAny.open_id : void 0,
      dataAny ? dataAny.openid : void 0
    ]);
    const token = pickDefined([
      rawAny ? rawAny.token : void 0,
      rawAny ? rawAny.accessToken : void 0,
      rawAny ? rawAny.access_token : void 0,
      dataAny ? dataAny.token : void 0
    ]);
    const userInfo = pickDefined([
      rawAny ? rawAny.userInfo : void 0,
      rawAny ? rawAny.user_info : void 0,
      dataAny ? dataAny.userInfo : void 0,
      dataAny ? dataAny.user_info : void 0
    ]);
    return {
      needBinding: !!needBinding,
      openid: openid || void 0,
      token: token || void 0,
      userInfo
    };
  });
}
function bindUser(data) {
  return __async(this, null, function* () {
    try {
      const result = yield api_http.cloudCall(
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
  });
}
const api = {
  wechatLogin,
  bindUser
};
exports.api = api;
exports.bindUser = bindUser;
