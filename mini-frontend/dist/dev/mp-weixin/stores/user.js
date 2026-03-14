"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const token = common_vendor.ref(common_vendor.index.getStorageSync("token") || "");
  const userInfo = common_vendor.ref(common_vendor.index.getStorageSync("userInfo") || null);
  const isLoggedIn = common_vendor.computed(() => !!token.value);
  const isAdmin = common_vendor.computed(() => resolveRole(userInfo.value) === "admin");
  function resolveRole(profile) {
    var _a, _b;
    const role = (profile == null ? void 0 : profile.role) != null ? (profile == null ? void 0 : profile.role) : (((_a = profile == null ? void 0 : profile.users) == null ? void 0 : _a.role) != null ? ((_a = profile == null ? void 0 : profile.users) == null ? void 0 : _a.role) : ((_b = profile == null ? void 0 : profile.user) == null ? void 0 : _b.role));
    return role === "admin" ? "admin" : "member";
  }
  function normalizeProfile(profile) {
    if (!profile)
      return null;
    const normalized = { ...profile };
    let nickName = profile.nickName || profile.nickname || profile.name || profile.userName;
    
    // 规范化昵称：若为空或为默认占位符，生成“微信用户+4位随机数”
    if (!nickName || nickName === "\u5fae\u4fe1\u7528\u6237") {
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      nickName = "\u5fae\u4fe1\u7528\u6237" + randomNum;
    }
    
    normalized.nickName = nickName;
    const avatarUrl = profile.avatarUrl || profile.avatar || profile.headImgUrl || profile.avatar_url;
    if (avatarUrl)
      normalized.avatarUrl = avatarUrl;
    if (!normalized.avatar && avatarUrl)
      normalized.avatar = avatarUrl;
    if (!normalized.avatarUrl && normalized.avatar)
      normalized.avatarUrl = normalized.avatar;
    const role = resolveRole(normalized);
    normalized.role = role;
    return normalized;
  }
  function syncUserInfo(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized)
      return null;
    const merged = { ...userInfo.value || {}, ...normalized };
    if (userInfo.value) {
      if (userInfo.value.nickName && userInfo.value.nickName !== "\u5fae\u4fe1\u7528\u6237" && (!normalized.nickName || normalized.nickName === "\u5fae\u4fe1\u7528\u6237")) {
        merged.nickName = userInfo.value.nickName;
      }
      if (userInfo.value.avatarUrl && !normalized.avatarUrl) {
        merged.avatarUrl = userInfo.value.avatarUrl;
      }
      if (userInfo.value.avatar && !normalized.avatar) {
        merged.avatar = userInfo.value.avatar;
      }
    }
    userInfo.value = merged;
    common_vendor.index.setStorageSync("userInfo", userInfo.value);
    if (!token.value) {
      const fallbackToken = userInfo.value.openid || userInfo.value._openid || "logged";
      token.value = fallbackToken;
      common_vendor.index.setStorageSync("token", token.value);
    }
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
  function login(payload) {
    token.value = (payload == null ? void 0 : payload.token) || "";
    common_vendor.index.setStorageSync("token", token.value);
    syncUserInfo((payload == null ? void 0 : payload.userInfo) || {});
  }
  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    fetchProfile,
    logout,
    login,
    syncUserInfo
  };
});
exports.useUserStore = useUserStore;
