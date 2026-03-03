"use strict";
const common_vendor = require("../common/vendor.js");
const api_http = require("../api/http.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(common_vendor.index.getStorageSync("token") ?? "");
  const userInfo = common_vendor.ref(null);
  const isLoggedIn = common_vendor.computed(() => Boolean(token.value));
  const isAdmin = common_vendor.computed(() => true);
  const role = common_vendor.computed(() => {
    var _a;
    return (_a = userInfo.value) == null ? void 0 : _a.role;
  });
  async function login(code) {
    const result = await api_http.http.post("/api/auth/login", { code });
    token.value = result.token;
    common_vendor.index.setStorageSync("token", result.token);
    await fetchProfile();
  }
  function logout() {
    token.value = "";
    userInfo.value = null;
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.reLaunch({ url: "/pages/login/index" });
  }
  async function fetchProfile() {
    try {
      const info = await api_http.http.get("/api/user/profile");
      userInfo.value = { ...info, role: "admin" };
    } catch (e) {
      console.error("[userStore] fetchProfile error:", e);
    }
  }
  async function updateProfile(data) {
    const updated = await api_http.http.put("/api/user/profile", data);
    userInfo.value = updated;
  }
  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    role,
    login,
    logout,
    fetchProfile,
    updateProfile
  };
});
exports.useUserStore = useUserStore;
