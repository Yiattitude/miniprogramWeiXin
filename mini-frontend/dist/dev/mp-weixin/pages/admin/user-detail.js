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
  (Icon + _easycom_uv_loading_icon)();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "user-detail",
  setup(__props) {
    const user = common_vendor.ref(null);
    const logs = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const userId = common_vendor.ref("");
    const adjType = common_vendor.ref("add");
    const adjAmount = common_vendor.ref("");
    const adjReason = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      userId.value = (options == null ? void 0 : options.id) || "";
      if (userId.value) {
        loadUser();
      }
    });
    function formatTime(val) {
      if (!val)
        return "";
      return val.substring(0, 10);
    }
    function formatDateTimeRaw(val) {
      if (!val)
        return "";
      return utils_format.formatDateTime(new Date(val));
    }
    function loadUser() {
      return __async(this, null, function* () {
        if (!userId.value)
          return;
        try {
          const detail = yield api_admin.getAdminUser(userId.value);
          if (detail.code === 0 && detail.data) {
            user.value = detail.data;
            yield loadLogs();
          }
        } catch (err) {
          common_vendor.index.showToast({ title: "用户信息加载失败", icon: "none" });
        }
      });
    }
    function loadLogs() {
      return __async(this, null, function* () {
        if (!user.value)
          return;
        loading.value = true;
        try {
          const res = yield api_admin.getPointsLogs(user.value._id);
          if (res.code === 0 && res.data) {
            logs.value = res.data.list;
          }
        } finally {
          loading.value = false;
        }
      });
    }
    function submitAdjust() {
      return __async(this, null, function* () {
        const amount = Number(adjAmount.value);
        const reason = adjReason.value.trim();
        if (!amount || amount <= 0) {
          common_vendor.index.showToast({ title: "请输入有效的调整数值", icon: "none" });
          return;
        }
        if (!reason) {
          common_vendor.index.showToast({ title: "必须填写操作原因", icon: "none" });
          return;
        }
        const actAmount = adjType.value === "add" ? amount : -amount;
        common_vendor.index.showModal({
          title: "二次确认",
          content: `确认要为该用户 ${actAmount > 0 ? "增加" : "扣除"} ${Math.abs(actAmount)} 积分吗？`,
          success: (res) => __async(this, null, function* () {
            if (res.confirm && user.value) {
              common_vendor.index.showLoading({ title: "提交中" });
              try {
                const resp = yield api_admin.adjustUserPoints({ targetUserId: user.value._id, amount: actAmount, reason });
                if (resp.code === 0) {
                  common_vendor.index.showToast({ title: "操作成功" });
                  adjAmount.value = "";
                  adjReason.value = "";
                  yield loadUser();
                }
              } finally {
                common_vendor.index.hideLoading();
              }
            }
          })
        });
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: user.value
      }, user.value ? {
        b: common_vendor.p({
          name: "user-3-fill",
          size: "36px",
          color: "#fff"
        }),
        c: common_vendor.t(user.value.realName || "未名氏"),
        d: common_vendor.t(user.value.phone || "无电话记录"),
        e: common_vendor.t(user.value.totalPoints),
        f: common_vendor.t(formatTime(user.value.bindAt)),
        g: common_vendor.t(user.value.checkinCount)
      } : {}, {
        h: common_vendor.p({
          name: "edit-box-line",
          size: "18px",
          color: "#3a7bd5"
        }),
        i: adjType.value === "add" ? 1 : "",
        j: common_vendor.o(($event) => adjType.value = "add"),
        k: adjType.value === "sub" ? 1 : "",
        l: common_vendor.o(($event) => adjType.value = "sub"),
        m: adjAmount.value,
        n: common_vendor.o(($event) => adjAmount.value = $event.detail.value),
        o: adjReason.value,
        p: common_vendor.o(($event) => adjReason.value = $event.detail.value),
        q: common_vendor.o(submitAdjust),
        r: loading.value
      }, loading.value ? {
        s: common_vendor.p({
          size: "28"
        })
      } : logs.value.length === 0 ? {} : {
        v: common_vendor.f(logs.value, (log, k0, i0) => {
          return {
            a: common_vendor.t(log.reason),
            b: common_vendor.t(log.changeAmount > 0 ? "+" : ""),
            c: common_vendor.t(log.changeAmount),
            d: common_vendor.n(log.changeAmount > 0 ? "pos" : "neg"),
            e: common_vendor.t(log.type === "audit_pass" ? "打卡自动结算" : "人工调整"),
            f: common_vendor.t(formatDateTimeRaw(log.createdAt)),
            g: common_vendor.t(log.afterPoints),
            h: log._id
          };
        })
      }, {
        t: logs.value.length === 0
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e7bd75d2"]]);
wx.createPage(MiniProgramPage);
