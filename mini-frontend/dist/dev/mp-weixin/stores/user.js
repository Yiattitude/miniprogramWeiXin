"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(common_vendor.index.getStorageSync("token") || "");
  const userInfo = common_vendor.ref(common_vendor.index.getStorageSync("userInfo") || null);
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const isAdmin = common_vendor.computed(() => resolveRole(userInfo.value) === "admin");
  function resolveRole(profile) {
    var _a, _b;
    const role = (profile == null ? void 0 : profile.role) ?? ((_a = profile == null ? void 0 : profile.users) == null ? void 0 : _a.role) ?? ((_b = profile == null ? void 0 : profile.user) == null ? void 0 : _b.role);
    return role === "admin" ? "admin" : "member";
  }
  function syncUserInfo(profile) {
    if (!profile)
      return null;
    const role = resolveRole(profile);
    userInfo.value = { ...userInfo.value || {}, ...profile, role };
    common_vendor.index.setStorageSync("userInfo", userInfo.value);
    return userInfo.value;
  }
  async function fetchProfile(profile) {
    if (profile) {
      return syncUserInfo(profile);
    }
    const cached = common_vendor.index.getStorageSync("userInfo");
    return cached ? syncUserInfo(cached) : userInfo.value;
  }
  function logout() {
    token.value = "";
    userInfo.value = null;
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("userInfo");
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
