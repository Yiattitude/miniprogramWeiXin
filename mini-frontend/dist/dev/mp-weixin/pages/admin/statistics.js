"use strict";
const common_vendor = require("../../common/vendor.js");
const api_admin = require("../../api/admin.js");
if (!Math) {
  Icon();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "statistics",
  setup(__props) {
    const stats = common_vendor.ref(null);
    common_vendor.onLoad(async () => {
      common_vendor.index.showLoading({ title: "加载数据中" });
      try {
        const res = await api_admin.getAdminStats();
        if (res.code === 0 && res.data) {
          stats.value = res.data;
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: stats.value
      }, stats.value ? {
        b: common_vendor.t(stats.value.totalUsers),
        c: common_vendor.t(stats.value.totalCheckins),
        d: common_vendor.t(stats.value.totalPointsIssued),
        e: common_vendor.p({
          name: "medal-line",
          size: "20px",
          color: "#f39c12"
        }),
        f: common_vendor.f(stats.value.topUsers, (user, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.n("rank-" + (index + 1)),
            c: common_vendor.t(user.realName),
            d: common_vendor.t(user.totalPoints),
            e: index
          };
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8cc66245"]]);
wx.createPage(MiniProgramPage);
