"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
if (!Math) {
  (_easycom_uv_loading_icon + CheckinCard)();
}
const CheckinCard = () => "../../components/volunteer/CheckinCard.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "checkin-list",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const list = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      fetchList();
    });
    common_vendor.onPullDownRefresh(async () => {
      await fetchList();
      common_vendor.index.stopPullDownRefresh();
    });
    async function fetchList() {
      loading.value = true;
      try {
        await volunteerStore.fetchMySignups();
        list.value = volunteerStore.mySignups;
      } catch (e) {
        console.error("[checkin-list] fetch error:", e);
      } finally {
        loading.value = false;
      }
    }
    function onCheckin(activity) {
      common_vendor.index.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
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
        })
      } : {}, {
        c: list.value.length > 0
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0c0f5b1e"]]);
wx.createPage(MiniProgramPage);
