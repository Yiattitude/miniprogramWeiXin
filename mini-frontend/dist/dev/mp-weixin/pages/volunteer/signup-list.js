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
  (Icon + _easycom_uv_loading_icon + ActivityCard + _easycom_uv_load_more)();
}
const Icon = () => "../../components/common/Icon.js";
const ActivityCard = () => "../../components/volunteer/ActivityCard.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "signup-list",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const keyword = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const selectedTime = common_vendor.ref("month");
    const selectedLocation = common_vendor.ref("全部地点");
    const timeOptions = [
      { label: "今天", value: "today" },
      { label: "本周", value: "week" },
      { label: "本月", value: "month" }
    ];
    const locationOptions = ["全部地点", "市中心", "社区服务站", "医院", "学校", "公园"];
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    let debounceTimer = null;
    common_vendor.onLoad(() => {
      loadList(true);
    });
    async function loadList(reset = false) {
      if (loading.value)
        return;
      if (reset) {
        page.value = 1;
        finished.value = false;
        list.value = [];
      }
      if (finished.value && !reset)
        return;
      loading.value = true;
      try {
        volunteerStore.filter.keyword = keyword.value;
        volunteerStore.filter.timeRange = selectedTime.value;
        volunteerStore.filter.location = selectedLocation.value === "全部地点" ? "" : selectedLocation.value;
        const result = await volunteerStore.fetchActivityList(page.value);
        list.value = reset ? result.list : [...list.value, ...result.list];
        total.value = result.total;
        if (list.value.length >= result.total) {
          finished.value = true;
        } else {
          page.value++;
        }
      } catch (e) {
        console.error("[signup-list] loadList error:", e);
        common_vendor.index.showToast({ title: (e == null ? void 0 : e.message) || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function onSearch() {
      if (debounceTimer)
        clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadList(true), 300);
    }
    function selectTime(val) {
      selectedTime.value = selectedTime.value === val ? "" : val;
      loadList(true);
    }
    function selectLocation(loc) {
      selectedLocation.value = selectedLocation.value === loc ? "" : loc;
      loadList(true);
    }
    function onCardClick(activity) {
      common_vendor.index.navigateTo({ url: `/pages/volunteer/signup-detail?activityId=${activity._id}` });
    }
    function onLoadMore() {
      if (!finished.value)
        loadList();
    }
    common_vendor.onPullDownRefresh(async () => {
      await loadList(true);
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "search-line",
          size: "16px"
        }),
        b: common_vendor.o([($event) => keyword.value = $event.detail.value, onSearch]),
        c: keyword.value,
        d: common_vendor.t(showFilter.value ? "▲" : "▼"),
        e: common_vendor.o(($event) => showFilter.value = !showFilter.value),
        f: showFilter.value
      }, showFilter.value ? {
        g: common_vendor.f(timeOptions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: selectedTime.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => selectTime(item.value), item.value)
          };
        }),
        h: common_vendor.f(locationOptions, (loc, k0, i0) => {
          return {
            a: common_vendor.t(loc),
            b: loc,
            c: selectedLocation.value === loc ? 1 : "",
            d: common_vendor.o(($event) => selectLocation(loc), loc)
          };
        })
      } : {}, {
        i: common_vendor.t(total.value),
        j: loading.value && list.value.length === 0
      }, loading.value && list.value.length === 0 ? {
        k: common_vendor.p({
          size: "36"
        })
      } : {}, {
        l: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: item._id,
            b: common_vendor.o(onCardClick, item._id),
            c: "85a239f0-2-" + i0,
            d: common_vendor.p({
              activity: item
            })
          };
        }),
        m: !loading.value && list.value.length === 0
      }, !loading.value && list.value.length === 0 ? {
        n: common_vendor.p({
          name: "calendar-line",
          size: "64px"
        })
      } : {}, {
        o: list.value.length > 0
      }, list.value.length > 0 ? {
        p: common_vendor.o(onLoadMore),
        q: common_vendor.p({
          status: finished.value ? "nomore" : loading.value ? "loading" : "loadmore"
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85a239f0"]]);
wx.createPage(MiniProgramPage);
