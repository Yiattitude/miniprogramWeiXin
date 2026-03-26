"use strict";
const common_vendor = require("../common/vendor.js");
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(common_vendor.index.getStorageSync("token") || "");
  const userInfo = common_vendor.ref(common_vendor.index.getStorageSync("userInfo") || null);
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const isAdmin = common_vendor.computed(() => true);
  common_vendor.watch(
    token,
    (val) => {
      if (val)
        common_vendor.index.setStorageSync("token", val);
      else
        common_vendor.index.removeStorageSync("token");
    },
    { immediate: true }
  );
  function resolveRole(profile) {
    var _a, _b, _c, _d;
    const role = (_d = (_b = profile == null ? void 0 : profile.role) != null ? _b : (_a = profile == null ? void 0 : profile.users) == null ? void 0 : _a.role) != null ? _d : (_c = profile == null ? void 0 : profile.user) == null ? void 0 : _c.role;
    return role === "admin" ? "admin" : "member";
  }
  function syncUserInfo(profile) {
    if (!profile)
      return null;
    const role = resolveRole(profile);
    userInfo.value = __spreadProps(__spreadValues(__spreadValues({}, userInfo.value || {}), profile), { role });
    common_vendor.index.setStorageSync("userInfo", userInfo.value);
    return userInfo.value;
  }
  function fetchProfile(profile) {
    return __async(this, null, function* () {
      if (profile) {
        return syncUserInfo(profile);
      }
      const cached = common_vendor.index.getStorageSync("userInfo");
      return cached ? syncUserInfo(cached) : userInfo.value;
    });
  }
  function logout() {
    token.value = "";
    userInfo.value = null;
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("userInfo");
    common_vendor.index.removeStorageSync("auth_info");
  }
  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    fetchProfile,
    logout,
    syncUserInfo
  };
});
exports.useUserStore = useUserStore;
