"use strict";
const common_vendor = require("../../common/vendor.js");
const api_volunteer = require("../../api/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_loading_icon + Icon)();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "statistics",
  setup(__props) {
    const loading = common_vendor.ref(true);
    const data = common_vendor.ref({});
    common_vendor.onLoad(async () => {
      try {
        const res = await api_volunteer.getStatistics();
        data.value = res ?? {};
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          size: "36"
        })
      } : common_vendor.e({
        c: common_vendor.t(data.value.totalActivities ?? 0),
        d: common_vendor.t(data.value.totalSignups ?? 0),
        e: common_vendor.t(data.value.totalCheckins ?? 0),
        f: common_vendor.t(data.value.totalHours ?? 0),
        g: !data.value.activities || data.value.activities.length === 0
      }, !data.value.activities || data.value.activities.length === 0 ? {
        h: common_vendor.p({
          name: "chart-bar-line",
          size: "72px"
        })
      } : {
        i: common_vendor.f(data.value.activities, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.name,
            c: common_vendor.t(item.signupCount ?? 0),
            d: common_vendor.t(item.checkinCount ?? 0),
            e: common_vendor.t(item.totalHours ?? 0),
            f: item._id
          };
        })
      }));
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d20f47c1"]]);
wx.createPage(MiniProgramPage);
