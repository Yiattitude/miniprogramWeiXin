"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../node-modules/@climblee/uv-ui/components/uv-loading-icon/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_loading_icon + StatTable)();
}
const StatTable = () => "../../components/volunteer/StatTable.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "statistics",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const TIME_TABS = [
      { label: "全部", value: "all" },
      { label: "本月", value: "month" },
      { label: "本季度", value: "quarter" },
      { label: "本年", value: "year" }
    ];
    const activePeriod = common_vendor.ref("all");
    const activeScope = common_vendor.ref("personal");
    const loading = common_vendor.ref(false);
    const exporting = common_vendor.ref(false);
    const stats = common_vendor.computed(() => volunteerStore.statistics);
    const categoryColumns = [
      { label: "活动类别", align: "left" },
      { label: "参与次数", align: "center" },
      { label: "总时长(h)", align: "center" }
    ];
    const categoryRows = common_vendor.computed(() => {
      var _a;
      if (!((_a = stats.value) == null ? void 0 : _a.byCategory))
        return [];
      return stats.value.byCategory.map((r) => [r.category, String(r.count), String(r.totalHours)]);
    });
    const categoryTotalRow = common_vendor.computed(() => {
      var _a;
      if (!((_a = stats.value) == null ? void 0 : _a.byCategory) || stats.value.byCategory.length === 0)
        return [];
      const totalCount = stats.value.byCategory.reduce((s, r) => s + r.count, 0);
      const totalHours = stats.value.byCategory.reduce((s, r) => s + r.totalHours, 0);
      return ["合计", String(totalCount), String(totalHours)];
    });
    const activityColumns = [
      { label: "活动名称", align: "left" },
      { label: "参与人数", align: "center" },
      { label: "总时长(h)", align: "center" }
    ];
    const activityRows = common_vendor.computed(() => {
      var _a;
      if (!((_a = stats.value) == null ? void 0 : _a.byActivity))
        return [];
      return stats.value.byActivity.map((r) => [r.activityName, String(r.personCount), String(r.totalHours)]);
    });
    const activityTotalRow = common_vendor.computed(() => {
      var _a;
      if (!((_a = stats.value) == null ? void 0 : _a.byActivity) || stats.value.byActivity.length === 0)
        return [];
      const totalPerson = stats.value.byActivity.reduce((s, r) => s + r.personCount, 0);
      const totalHours = stats.value.byActivity.reduce((s, r) => s + r.totalHours, 0);
      return ["合计", String(totalPerson), String(totalHours)];
    });
    async function loadStats() {
      loading.value = true;
      try {
        await volunteerStore.fetchStatistics({
          scope: activeScope.value,
          period: activePeriod.value
        });
      } finally {
        loading.value = false;
      }
    }
    common_vendor.onLoad(loadStats);
    common_vendor.watch([activePeriod, activeScope], loadStats);
    async function handleExport() {
      exporting.value = true;
      try {
        const downloadUrl = await volunteerStore.exportReport({
          scope: activeScope.value,
          period: activePeriod.value,
          format: "excel"
        });
        common_vendor.index.downloadFile({
          url: downloadUrl,
          success(res) {
            if (res.statusCode === 200) {
              common_vendor.index.openDocument({
                filePath: res.tempFilePath,
                showMenu: true,
                success() {
                  common_vendor.index.showToast({ title: "导出成功", icon: "success" });
                },
                fail() {
                  common_vendor.index.showToast({ title: "文件已下载", icon: "success" });
                }
              });
            }
          },
          fail() {
            common_vendor.index.showToast({ title: "下载失败，请重试", icon: "none" });
          }
        });
      } catch (e) {
        console.error("[statistics] exportReport error:", e);
      } finally {
        exporting.value = false;
      }
    }
    common_vendor.onPullDownRefresh(() => {
      loadStats().finally(() => common_vendor.index.stopPullDownRefresh());
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(TIME_TABS, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.value,
            c: common_vendor.n(activePeriod.value === tab.value ? "tab-active" : ""),
            d: common_vendor.o(($event) => activePeriod.value = tab.value, tab.value)
          };
        }),
        b: common_vendor.n(activeScope.value === "personal" ? "seg-active" : ""),
        c: common_vendor.o(($event) => activeScope.value = "personal"),
        d: common_vendor.n(activeScope.value === "team" ? "seg-active" : ""),
        e: common_vendor.o(($event) => activeScope.value = "team"),
        f: loading.value
      }, loading.value ? {
        g: common_vendor.p({
          size: "40"
        })
      } : common_vendor.e({
        h: stats.value
      }, stats.value ? {
        i: common_vendor.t(stats.value.totalHours),
        j: common_vendor.t(activeScope.value === "personal" ? "我的时长(h)" : "总时长(h)"),
        k: common_vendor.t(stats.value.totalCount),
        l: common_vendor.t(stats.value.totalServed)
      } : {}, {
        m: stats.value
      }, stats.value ? {
        n: common_vendor.p({
          columns: categoryColumns,
          rows: categoryRows.value,
          ["total-row"]: categoryTotalRow.value
        })
      } : {}, {
        o: stats.value && activeScope.value === "team"
      }, stats.value && activeScope.value === "team" ? {
        p: common_vendor.p({
          columns: activityColumns,
          rows: activityRows.value,
          ["total-row"]: activityTotalRow.value
        })
      } : {}, {
        q: stats.value
      }, stats.value ? {
        r: common_vendor.t(exporting.value ? "导出中..." : "导出 Excel 报表"),
        s: common_vendor.n(exporting.value ? "btn-disabled" : ""),
        t: common_vendor.o(($event) => !exporting.value && handleExport())
      } : {}));
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d20f47c1"]]);
wx.createPage(MiniProgramPage);
