"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(common_vendor.index.getStorageSync("token") || "");
  const userInfo = common_vendor.ref(null);
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const isAdmin = common_vendor.computed(() => {
    var _a;
    return ((_a = userInfo.value) == null ? void 0 : _a.role) === "admin";
  });
  async function fetchProfile() {
    console.log("Fetching user profile from cloud...");
  }
  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    fetchProfile
  };
});
exports.useUserStore = useUserStore;
