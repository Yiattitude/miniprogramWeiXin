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
    function statusText(status) {
      if (status === "approved")
        return "已通过";
      if (status === "rejected")
        return "已驳回";
      return "审核中";
    }
    function formatShortDate(value) {
      if (!value)
        return "";
      return value.slice(0, 10);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          size: "36"
        })
      } : common_vendor.e({
        c: common_vendor.t(data.value.totalPoints ?? 0),
        d: common_vendor.t(data.value.totalCheckins ?? 0),
        e: common_vendor.t(data.value.totalHonors ?? 0),
        f: !data.value.checkinRecords || data.value.checkinRecords.length === 0
      }, !data.value.checkinRecords || data.value.checkinRecords.length === 0 ? {
        g: common_vendor.p({
          name: "list-check-line",
          size: "72px"
        })
      } : {
        h: common_vendor.f(data.value.checkinRecords, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.activityName),
            b: item.activityName,
            c: common_vendor.t(item.points ?? item.declaredPoints ?? 0),
            d: common_vendor.t(statusText(item.status)),
            e: common_vendor.t(formatShortDate(item.checkedAt)),
            f: item._id || item.id
          };
        })
      }, {
        i: !data.value.honorRecords || data.value.honorRecords.length === 0
      }, !data.value.honorRecords || data.value.honorRecords.length === 0 ? {
        j: common_vendor.p({
          name: "medal-line",
          size: "72px"
        })
      } : {
        k: common_vendor.f(data.value.honorRecords, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.honorLevel),
            b: item.honorLevel,
            c: common_vendor.t(item.honorPoints ?? 0),
            d: common_vendor.t(statusText(item.status)),
            e: common_vendor.t(formatShortDate(item.createdAt)),
            f: item.id || item._id
          };
        })
      }));
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d20f47c1"]]);
wx.createPage(MiniProgramPage);
