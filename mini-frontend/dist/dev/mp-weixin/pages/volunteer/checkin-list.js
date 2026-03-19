"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  const _easycom_uv_load_more2 = common_vendor.resolveComponent("uv-load-more");
  (_easycom_uv_loading_icon2 + _easycom_uv_load_more2)();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
const _easycom_uv_load_more = () => "../../components/stub/uv-load-more.js";
if (!Math) {
  (_easycom_uv_loading_icon + CheckinCard + _easycom_uv_load_more + Icon)();
}
const Icon = () => "../../components/common/Icon.js";
const CheckinCard = () => "../../components/volunteer/CheckinCard.js";
const PAGE_SIZE = 10;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "checkin-list",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const list = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      loadList(true);
    });
    common_vendor.onPullDownRefresh(async () => {
      await loadList(true);
      common_vendor.index.stopPullDownRefresh();
    });
    common_vendor.onReachBottom(() => {
      if (!finished.value) {
        loadList();
      }
    });
    function getPublishTime(activity) {
      const ts = Date.parse(activity.createdAt || activity.startTime || activity.endTime || "");
      return Number.isFinite(ts) ? ts : 0;
    }
    function mergeActivities(current, incoming) {
      const map = /* @__PURE__ */ new Map();
      current.forEach((item) => map.set(item._id, item));
      incoming.forEach((item) => map.set(item._id, item));
      return Array.from(map.values()).sort(
        (a, b) => getPublishTime(b) - getPublishTime(a)
      );
    }
    async function loadList(reset = false) {
      if (loading.value)
        return;
      if (reset) {
        page.value = 1;
        finished.value = false;
        list.value = [];
        volunteerStore.resetFilter();
      }
      if (finished.value)
        return;
      loading.value = true;
      try {
        const result = await volunteerStore.fetchActivityList(page.value, PAGE_SIZE);
        const incoming = Array.isArray(result.list) ? result.list : [];
        const merged = mergeActivities(list.value, incoming);
        list.value = merged;
        const totalFromResult = typeof result.total === "number" ? result.total : null;
        const reachedTotal = totalFromResult !== null ? merged.length >= totalFromResult : incoming.length < PAGE_SIZE;
        if (reachedTotal || incoming.length === 0) {
          finished.value = true;
        } else {
          page.value += 1;
        }
      } catch (e) {
        console.error("[checkin-list] fetch error:", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function onLoadMore() {
      if (!finished.value)
        loadList();
    }
    function onCheckin(activity) {
      common_vendor.index.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value && list.value.length === 0
      }, loading.value && list.value.length === 0 ? {
        b: common_vendor.p({
          size: "36"
        })
      } : list.value.length > 0 ? {
        d: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: item._id,
            b: common_vendor.o(onCheckin, item._id),
            c: "0c0f5b1e-1-" + i0,
            d: common_vendor.p({
              activity: item
            })
          };
        }),
        e: common_vendor.o(onLoadMore),
        f: common_vendor.p({
          status: finished.value ? "nomore" : loading.value ? "loading" : "loadmore"
        })
      } : {
        g: common_vendor.p({
          name: "check-circle-line",
          size: "72px"
        })
      }, {
        c: list.value.length > 0
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0c0f5b1e"]]);
wx.createPage(MiniProgramPage);
