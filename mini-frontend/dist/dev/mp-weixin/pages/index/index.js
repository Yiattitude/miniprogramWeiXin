"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    common_vendor.onMounted(async () => {
      if (userStore.isLoggedIn && !userStore.userInfo) {
        await userStore.fetchProfile();
      }
    });
    function goVolunteer() {
      common_vendor.index.switchTab({ url: "/pages/volunteer/index" });
    }
    function goPage(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: ((_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.avatar) || "/static/default-avatar.png",
        b: common_vendor.t(common_vendor.unref(userStore).userInfo ? "你好，" + common_vendor.unref(userStore).userInfo.nickname : "欢迎使用"),
        c: common_vendor.t(((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.unit) || "银发人才平台"),
        d: common_vendor.unref(userStore).isLoggedIn && common_vendor.unref(userStore).userInfo
      }, common_vendor.unref(userStore).isLoggedIn && common_vendor.unref(userStore).userInfo ? {
        e: common_vendor.t(common_vendor.unref(userStore).userInfo.totalHours),
        f: common_vendor.t(common_vendor.unref(userStore).userInfo.totalCount),
        g: common_vendor.t(common_vendor.unref(userStore).userInfo.totalServed)
      } : {}, {
        h: common_vendor.o(goVolunteer),
        i: common_vendor.o(($event) => goPage("/pages/volunteer/signup-list")),
        j: common_vendor.o(($event) => goPage("/pages/volunteer/checkin-list")),
        k: common_vendor.o(($event) => goPage("/pages/volunteer/record")),
        l: common_vendor.o(($event) => goPage("/pages/volunteer/statistics"))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
