"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_format = require("../../utils/format.js");
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
  (_easycom_uv_loading_icon + Icon)();
}
const Icon = () => "../../components/common/Icon.js";
const PAGE_SIZE = 10;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "checkin-audit",
  setup(__props) {
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const isDetailOpen = common_vendor.ref(false);
    const currentDetail = common_vendor.ref(null);
    const currentDetailIndex = common_vendor.ref(-1);
    const tabList = [
      { name: "待审核", value: "pending" },
      { name: "已通过", value: "approved" },
      { name: "已驳回", value: "rejected" }
    ];
    const currentTab = common_vendor.ref(0);
    const currentStatus = common_vendor.ref("pending");
    const STATUS_MAP = {
      pending: { text: "待审核", color: "#e67e22", bg: "#fff3e0" },
      approved: { text: "已通过", color: "#27ae60", bg: "#e6f9f0" },
      rejected: { text: "已驳回", color: "#e74c3c", bg: "#fde8e8" }
    };
    function statusInfo(status) {
      return STATUS_MAP[status] || { text: status, color: "#a0aab5", bg: "#f0f2f4" };
    }
    function onTabChange(e) {
      currentTab.value = e.index;
      currentStatus.value = tabList[e.index].value;
      loadFirst();
    }
    function formatCheckedAt(value) {
      if (!value)
        return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime()))
        return "";
      return utils_format.formatDateTime(date);
    }
    common_vendor.onLoad(() => loadFirst());
    common_vendor.onPullDownRefresh(() => __async(this, null, function* () {
      yield loadFirst();
      common_vendor.index.stopPullDownRefresh();
    }));
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
          const result = yield api_admin.getAdminCheckins({ page: page.value, pageSize: PAGE_SIZE, status: currentStatus.value });
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
    function previewPhoto(photos, index) {
      common_vendor.index.previewImage({
        urls: photos,
        current: photos[index]
      });
    }
    function showDetail(item, index) {
      currentDetail.value = item;
      currentDetailIndex.value = index;
      isDetailOpen.value = true;
    }
    function closeDetail() {
      isDetailOpen.value = false;
      setTimeout(() => {
        currentDetail.value = null;
        currentDetailIndex.value = -1;
      }, 300);
    }
    function onApprove(item, index) {
      common_vendor.index.showModal({
        title: "确认通过",
        content: `确定通过 ${item.realName} 的 ${item.declaredPoints} 积分申报吗？核实无误后将自动发放积分。`,
        success: (res) => __async(this, null, function* () {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "处理中" });
            try {
              const resp = yield api_admin.auditCheckin({ recordId: item._id, pass: true });
              if (resp.code === 0) {
                common_vendor.index.showToast({ title: "已通过" });
                closeDetail();
                list.value.splice(index, 1);
                total.value--;
              }
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        })
      });
    }
    function onReject(item, index) {
      common_vendor.index.showModal({
        title: "驳回审核",
        content: "请输入驳回理由：",
        editable: true,
        placeholderText: "例如：照片不清晰/未按要求打卡",
        success: (res) => __async(this, null, function* () {
          if (res.confirm) {
            if (!res.content) {
              common_vendor.index.showToast({ title: "必须填写驳回理由", icon: "none" });
              return;
            }
            common_vendor.index.showLoading({ title: "处理中" });
            try {
              const resp = yield api_admin.auditCheckin({ recordId: item._id, pass: false, rejectReason: res.content });
              if (resp.code === 0) {
                common_vendor.index.showToast({ title: "已驳回" });
                closeDetail();
                list.value.splice(index, 1);
                total.value--;
              }
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        })
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabList, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.name),
            b: currentTab.value === index
          }, currentTab.value === index ? {} : {}, {
            c: tab.value,
            d: currentTab.value === index ? 1 : "",
            e: common_vendor.o(($event) => onTabChange({
              index,
              name: tab.name,
              value: tab.value
            }), tab.value)
          });
        }),
        b: common_vendor.t(total.value),
        c: loading.value && list.value.length === 0
      }, loading.value && list.value.length === 0 ? {
        d: common_vendor.p({
          size: "36"
        })
      } : common_vendor.e({
        e: list.value.length === 0 && !loading.value
      }, list.value.length === 0 && !loading.value ? {
        f: common_vendor.p({
          name: "file-text-line",
          size: "72px"
        })
      } : {
        g: common_vendor.f(list.value, (item, index, i0) => {
          return {
            a: "9a7a0f56-2-" + i0,
            b: common_vendor.t(item.realName || "未知用户"),
            c: common_vendor.t(item.phone),
            d: common_vendor.t(statusInfo(item.status).text),
            e: statusInfo(item.status).color,
            f: statusInfo(item.status).bg,
            g: common_vendor.t(item.activityName),
            h: "9a7a0f56-3-" + i0,
            i: common_vendor.t(item.activityCategory || "未分类"),
            j: "9a7a0f56-4-" + i0,
            k: common_vendor.t(item.declaredPoints),
            l: common_vendor.o(($event) => showDetail(item, index), item._id),
            m: item._id
          };
        }),
        h: common_vendor.p({
          name: "user-3-line",
          size: "20px"
        }),
        i: common_vendor.p({
          name: "star-line",
          size: "16px"
        }),
        j: common_vendor.p({
          name: "coin-2-line",
          size: "16px"
        })
      }, {
        k: loading.value
      }, loading.value ? {
        l: common_vendor.p({
          size: "28"
        })
      } : finished.value && list.value.length > 0 ? {} : {}, {
        m: finished.value && list.value.length > 0,
        n: common_vendor.o(loadMore)
      }), {
        o: isDetailOpen.value
      }, isDetailOpen.value ? common_vendor.e({
        p: common_vendor.o(closeDetail),
        q: common_vendor.p({
          name: "close-line",
          size: "24px",
          color: "#999"
        }),
        r: currentDetail.value
      }, currentDetail.value ? common_vendor.e({
        s: common_vendor.t(currentDetail.value.realName),
        t: common_vendor.t(currentDetail.value.phone),
        v: common_vendor.t(currentDetail.value.activityName),
        w: common_vendor.t(currentDetail.value.activityCategory || "未分类"),
        x: common_vendor.t(currentDetail.value.declaredPoints),
        y: common_vendor.t(formatCheckedAt(currentDetail.value.checkedAt)),
        z: currentDetail.value.remark
      }, currentDetail.value.remark ? {
        A: common_vendor.t(currentDetail.value.remark)
      } : {}, {
        B: currentDetail.value.rejectReason
      }, currentDetail.value.rejectReason ? {
        C: common_vendor.t(currentDetail.value.rejectReason)
      } : {}, {
        D: currentDetail.value.photos && currentDetail.value.photos.length > 0
      }, currentDetail.value.photos && currentDetail.value.photos.length > 0 ? {
        E: common_vendor.f(currentDetail.value.photos, (url, idx, i0) => {
          return {
            a: idx,
            b: url,
            c: common_vendor.o(($event) => previewPhoto(currentDetail.value.photos, idx), idx)
          };
        })
      } : {}, {
        F: currentDetail.value.status === "pending"
      }, currentDetail.value.status === "pending" ? {
        G: common_vendor.o(($event) => onReject(currentDetail.value, currentDetailIndex.value)),
        H: common_vendor.o(($event) => onApprove(currentDetail.value, currentDetailIndex.value))
      } : {}) : {}, {
        I: common_vendor.o(() => {
        }),
        J: common_vendor.o(closeDetail)
      }) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a7a0f56"]]);
wx.createPage(MiniProgramPage);
