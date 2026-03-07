"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
if (!Array) {
  const _easycom_uv_loading_icon2 = common_vendor.resolveComponent("uv-loading-icon");
  _easycom_uv_loading_icon2();
}
const _easycom_uv_loading_icon = () => "../../components/stub/uv-loading-icon.js";
if (!Math) {
  _easycom_uv_loading_icon();
}
const PAGE_SIZE = 10;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "record",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const STATUS_MAP = {
      pending: { text: "审核中", color: "#e67e22", bg: "#fff3e0" },
      approved: { text: "已通过", color: "#27ae60", bg: "#e6f9f0" },
      rejected: { text: "已驳回", color: "#e74c3c", bg: "#fde8e8" }
    };
    function statusInfo(status) {
      return STATUS_MAP[status] || { text: status, color: "#a0aab5", bg: "#f0f2f4" };
    }
    function formatDate(iso) {
      if (!iso)
        return "";
      return iso.replace("T", " ").slice(0, 16);
    }
    common_vendor.onLoad(() => loadFirst());
    common_vendor.onPullDownRefresh(async () => {
      await loadFirst();
      common_vendor.index.stopPullDownRefresh();
    });
    async function loadFirst() {
      page.value = 1;
      finished.value = false;
      list.value = [];
      await loadMore();
    }
    async function loadMore() {
      if (loading.value || finished.value)
        return;
      loading.value = true;
      try {
        const result = await volunteerStore.fetchMyRecords(page.value, PAGE_SIZE);
        list.value = page.value === 1 ? result.list : [...list.value, ...result.list];
        total.value = result.total;
        if (list.value.length >= result.total) {
          finished.value = true;
        } else {
          page.value++;
        }
      } catch (err) {
        console.error("[record] load error:", err);
      } finally {
        loading.value = false;
      }
    }
    function previewPhoto(photos, index) {
      common_vendor.index.previewImage({
        urls: photos,
        current: photos[index]
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(total.value),
        b: loading.value && list.value.length === 0
      }, loading.value && list.value.length === 0 ? {
        c: common_vendor.p({
          size: "36"
        })
      } : common_vendor.e({
        d: list.value.length === 0 && !loading.value
      }, list.value.length === 0 && !loading.value ? {} : {
        e: common_vendor.f(list.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.activityName),
            b: common_vendor.t(statusInfo(item.status).text),
            c: statusInfo(item.status).color,
            d: statusInfo(item.status).bg,
            e: common_vendor.t(item.activityLocation),
            f: common_vendor.t(formatDate(item.checkedAt)),
            g: common_vendor.t(item.serviceHours),
            h: common_vendor.t(item.serviceCount),
            i: item.remark
          }, item.remark ? {
            j: common_vendor.t(item.remark)
          } : {}, {
            k: item.photos && item.photos.length > 0
          }, item.photos && item.photos.length > 0 ? {
            l: common_vendor.f(item.photos, (url, idx, i1) => {
              return {
                a: idx,
                b: url,
                c: common_vendor.o(($event) => previewPhoto(item.photos, idx), idx)
              };
            })
          } : {}, {
            m: item._id
          });
        })
      }, {
        f: loading.value
      }, loading.value ? {
        g: common_vendor.p({
          size: "28"
        })
      } : finished.value && list.value.length > 0 ? {} : {}, {
        h: finished.value && list.value.length > 0,
        i: common_vendor.o(loadMore)
      }));
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aae55db7"]]);
wx.createPage(MiniProgramPage);
