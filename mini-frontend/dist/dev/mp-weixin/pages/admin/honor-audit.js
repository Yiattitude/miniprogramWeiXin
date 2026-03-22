"use strict";
const common_vendor = require("../../common/vendor.js");
const api_admin = require("../../api/admin.js");
const utils_format = require("../../utils/format.js");
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
  __name: "honor-audit",
  setup(__props) {
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const finished = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const total = common_vendor.ref(0);
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
    function displayName(item) {
      return item.userName || item.realName || "未知用户";
    }
    function displayPhone(item) {
      return item.phone || item.userPhone || "";
    }
    function displayHonor(item) {
      return item.honorLevel || item.honor_type || "未填写";
    }
    function displayPoints(item) {
      return Number(item.honorPoints ?? item.honor_points ?? 0);
    }
    function onTabChange(e) {
      currentTab.value = e.index;
      currentStatus.value = tabList[e.index].value;
      loadFirst();
    }
    function formatCreatedAt(value) {
      if (!value)
        return "";
      return utils_format.formatDateTime(new Date(value));
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
        const result = await api_admin.getAdminHonors({ page: page.value, pageSize: PAGE_SIZE, status: currentStatus.value });
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
    }
    function previewProofs(urls) {
      if (!urls || urls.length === 0)
        return;
      const images = urls.filter((url) => /\.(png|jpe?g|gif|webp)$/i.test(url));
      if (images.length === 0) {
        common_vendor.index.showToast({ title: "仅支持图片预览", icon: "none" });
        return;
      }
      common_vendor.index.previewImage({
        urls: images,
        current: images[0]
      });
    }
    function onApprove(item, index) {
      const recordId = item.id || item._id;
      common_vendor.index.showModal({
        title: "确认通过",
        content: `确定通过 ${displayName(item)} 的荣誉审核并发放 ${displayPoints(item)} 积分吗？`,
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "处理中" });
            try {
              const resp = await api_admin.auditHonor({ id: recordId, pass: true });
              if (resp.code === 0) {
                common_vendor.index.showToast({ title: "已通过" });
                list.value.splice(index, 1);
                total.value--;
              }
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    }
    function onReject(item, index) {
      const recordId = item.id || item._id;
      common_vendor.index.showModal({
        title: "驳回审核",
        content: "请输入驳回理由：",
        editable: true,
        placeholderText: "例如：材料不清晰/无法核验",
        success: async (res) => {
          if (res.confirm) {
            if (!res.content) {
              common_vendor.index.showToast({ title: "必须填写驳回理由", icon: "none" });
              return;
            }
            common_vendor.index.showLoading({ title: "处理中" });
            try {
              const resp = await api_admin.auditHonor({ id: recordId, pass: false, rejectReason: res.content });
              if (resp.code === 0) {
                common_vendor.index.showToast({ title: "已驳回" });
                list.value.splice(index, 1);
                total.value--;
              }
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
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
          name: "medal-line",
          size: "72px"
        })
      } : {
        g: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: "d739111e-2-" + i0,
            b: common_vendor.t(displayName(item)),
            c: common_vendor.t(displayPhone(item)),
            d: common_vendor.t(statusInfo(item.status).text),
            e: statusInfo(item.status).color,
            f: statusInfo(item.status).bg,
            g: "d739111e-3-" + i0,
            h: common_vendor.t(displayHonor(item)),
            i: "d739111e-4-" + i0,
            j: common_vendor.t(displayPoints(item)),
            k: "d739111e-5-" + i0,
            l: common_vendor.t(formatCreatedAt(item.createdAt)),
            m: item.rejectReason
          }, item.rejectReason ? {
            n: common_vendor.t(item.rejectReason)
          } : {}, {
            o: item.proofs && item.proofs.length > 0
          }, item.proofs && item.proofs.length > 0 ? {
            p: common_vendor.t(item.proofs.length),
            q: common_vendor.o(($event) => previewProofs(item.proofs), item.id || item._id)
          } : {}, {
            r: item.status === "pending"
          }, item.status === "pending" ? {
            s: common_vendor.o(($event) => onReject(item, index), item.id || item._id),
            t: common_vendor.o(($event) => onApprove(item, index), item.id || item._id)
          } : {}, {
            v: item.id || item._id
          });
        }),
        h: common_vendor.p({
          name: "user-3-line",
          size: "20px"
        }),
        i: common_vendor.p({
          name: "medal-line",
          size: "16px"
        }),
        j: common_vendor.p({
          name: "coin-2-line",
          size: "16px"
        }),
        k: common_vendor.p({
          name: "time-line",
          size: "16px"
        })
      }, {
        l: loading.value
      }, loading.value ? {
        m: common_vendor.p({
          size: "28"
        })
      } : finished.value && list.value.length > 0 ? {} : {}, {
        n: finished.value && list.value.length > 0,
        o: common_vendor.o(loadMore)
      }));
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d739111e"]]);
wx.createPage(MiniProgramPage);
