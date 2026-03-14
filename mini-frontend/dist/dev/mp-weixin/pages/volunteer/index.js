"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
if (!Math) {
  Icon();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    function goPage(path) {
      common_vendor.index.navigateTo({ url: path });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "edit-2-line",
          size: "26px"
        }),
        b: common_vendor.o(($event) => goPage("/pages/volunteer/signup-list")),
        c: common_vendor.p({
          name: "checkbox-line",
          size: "26px"
        }),
        d: common_vendor.o(($event) => goPage("/pages/volunteer/checkin-list")),
        e: common_vendor.unref(userStore).isAdmin
      }, common_vendor.unref(userStore).isAdmin ? {
        f: common_vendor.p({
          name: "add-circle-line",
          size: "26px"
        }),
        g: common_vendor.o(($event) => goPage("/pages/volunteer/publish"))
      } : {}, {
        h: common_vendor.p({
          name: "list-check-line",
          size: "26px"
        }),
        i: common_vendor.o(($event) => goPage("/pages/volunteer/record")),
        j: common_vendor.p({
          name: "chart-bar-line",
          size: "26px"
        }),
        k: common_vendor.o(($event) => goPage("/pages/volunteer/statistics")),
        l: common_vendor.unref(userStore).userInfo
      }, common_vendor.unref(userStore).userInfo ? {
        m: common_vendor.t(common_vendor.unref(userStore).userInfo.totalHours || 0),
        n: common_vendor.t(common_vendor.unref(userStore).userInfo.totalCount || 0),
        o: common_vendor.t(common_vendor.unref(userStore).userInfo.totalServed || 0)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9c01f5c3"]]);
wx.createPage(MiniProgramPage);
