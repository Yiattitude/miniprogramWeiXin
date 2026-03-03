"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    function goPage(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => goPage("/pages/volunteer/signup-list")),
        b: common_vendor.o(($event) => goPage("/pages/volunteer/checkin-list")),
        c: common_vendor.unref(userStore).isAdmin
      }, common_vendor.unref(userStore).isAdmin ? {
        d: common_vendor.o(($event) => goPage("/pages/volunteer/publish"))
      } : {}, {
        e: common_vendor.o(($event) => goPage("/pages/volunteer/record")),
        f: common_vendor.o(($event) => goPage("/pages/volunteer/statistics")),
        g: common_vendor.unref(userStore).userInfo
      }, common_vendor.unref(userStore).userInfo ? {
        h: common_vendor.t(common_vendor.unref(userStore).userInfo.totalHours),
        i: common_vendor.t(common_vendor.unref(userStore).userInfo.totalCount),
        j: common_vendor.t(common_vendor.unref(userStore).userInfo.totalServed)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9c01f5c3"]]);
wx.createPage(MiniProgramPage);
