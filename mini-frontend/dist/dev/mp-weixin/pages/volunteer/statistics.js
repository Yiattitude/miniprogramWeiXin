"use strict";
const common_vendor = require("../../common/vendor.js");
const api_volunteer = require("../../api/volunteer.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
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
    common_vendor.onLoad(() => __async(this, null, function* () {
      try {
        const res = yield api_volunteer.getStatistics();
        data.value = res != null ? res : {};
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }));
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
      var _a, _b, _c;
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          size: "36"
        })
      } : common_vendor.e({
        c: common_vendor.t((_a = data.value.totalPoints) != null ? _a : 0),
        d: common_vendor.t((_b = data.value.totalCheckins) != null ? _b : 0),
        e: common_vendor.t((_c = data.value.totalHonors) != null ? _c : 0),
        f: !data.value.checkinRecords || data.value.checkinRecords.length === 0
      }, !data.value.checkinRecords || data.value.checkinRecords.length === 0 ? {
        g: common_vendor.p({
          name: "list-check-line",
          size: "72px"
        })
      } : {
        h: common_vendor.f(data.value.checkinRecords, (item, k0, i0) => {
          var _a2, _b2;
          return {
            a: common_vendor.t(item.activityName),
            b: item.activityName,
            c: common_vendor.t((_b2 = (_a2 = item.points) != null ? _a2 : item.declaredPoints) != null ? _b2 : 0),
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
          var _a2;
          return {
            a: common_vendor.t(item.honorLevel),
            b: item.honorLevel,
            c: common_vendor.t((_a2 = item.honorPoints) != null ? _a2 : 0),
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
