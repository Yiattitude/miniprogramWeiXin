"use strict";
const common_vendor = require("../../common/vendor.js");
const api_admin = require("../../api/admin.js");
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
  (Icon + _easycom_uv_loading_icon)();
}
const Icon = () => "../../components/common/Icon.js";
const PAGE_SIZE = 15;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "user-manage",
  setup(__props) {
    const keyword = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    common_vendor.onLoad(() => loadFirst());
    common_vendor.onPullDownRefresh(() => __async(this, null, function* () {
      yield loadFirst();
      common_vendor.index.stopPullDownRefresh();
    }));
    function onSearch() {
      loadFirst();
    }
    function clearSearch() {
      keyword.value = "";
      loadFirst();
    }
    function loadFirst() {
      return __async(this, null, function* () {
        page.value = 1;
        finished.value = false;
        list.value = [];
        yield loadMore();
      });
    }
    function loadMore() {
      return __async(this, null, function* () {
        if (loading.value || finished.value)
          return;
        loading.value = true;
        try {
          const result = yield api_admin.getAdminUsers({ page: page.value, pageSize: PAGE_SIZE, keyword: keyword.value });
          if (result.code === 0 && result.data) {
            list.value = page.value === 1 ? result.data.list : [...list.value, ...result.data.list];
            total.value = result.data.total;
            if (list.value.length >= result.data.total) {
              finished.value = true;
            } else {
              page.value++;
            }
          }
        } catch (err) {
          common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        } finally {
          loading.value = false;
        }
      });
    }
    function goDetail(item) {
      common_vendor.index.navigateTo({
        url: `/pages/admin/user-detail?id=${item._id}`
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "search-2-line",
          size: "18px",
          color: "#99a2aa"
        }),
        b: common_vendor.o(onSearch),
        c: keyword.value,
        d: common_vendor.o(($event) => keyword.value = $event.detail.value),
        e: keyword.value
      }, keyword.value ? {
        f: common_vendor.o(clearSearch),
        g: common_vendor.p({
          name: "close-circle-fill",
          size: "16px",
          color: "#ccc"
        })
      } : {}, {
        h: common_vendor.t(total.value),
        i: common_vendor.f(list.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.realName || "未绑名"),
            b: item.role === "admin"
          }, item.role === "admin" ? {} : {}, {
            c: common_vendor.t(item.totalPoints),
            d: "65f4a66c-2-" + i0,
            e: common_vendor.t(item.phone || "未绑定手机号"),
            f: "65f4a66c-3-" + i0,
            g: common_vendor.t(item.checkinCount),
            h: item._id,
            i: common_vendor.o(($event) => goDetail(item), item._id)
          });
        }),
        j: common_vendor.p({
          name: "phone-line",
          size: "16px",
          color: "#7a8797"
        }),
        k: common_vendor.p({
          name: "checkbox-line",
          size: "16px",
          color: "#7a8797"
        }),
        l: loading.value
      }, loading.value ? {
        m: common_vendor.p({
          size: "28"
        })
      } : finished.value && list.value.length > 0 ? {} : {}, {
        n: finished.value && list.value.length > 0,
        o: list.value.length === 0 && !loading.value
      }, list.value.length === 0 && !loading.value ? {
        p: common_vendor.p({
          name: "ghost-line",
          size: "64px",
          color: "#dce1e6"
        })
      } : {}, {
        q: common_vendor.o(loadMore)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-65f4a66c"]]);
wx.createPage(MiniProgramPage);
