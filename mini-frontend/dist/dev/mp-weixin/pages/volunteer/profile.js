"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
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
if (!Math) {
  Icon();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const isAdmin = common_vendor.computed(() => userStore.isAdmin);
    const nickname = common_vendor.computed(() => {
      var _a;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.nickName) || "志愿者";
    });
    const avatar = common_vendor.computed(
      () => {
        var _a;
        return ((_a = userStore.userInfo) == null ? void 0 : _a.avatarUrl) || "/static/default-avatar.png";
      }
    );
    const stats = common_vendor.ref({ totalActivities: 0, totalHours: 0, totalCount: 0 });
    common_vendor.onShow(() => __async(this, null, function* () {
      var _a, _b, _c;
      try {
        const data = yield api_volunteer.getStatistics();
        if (data) {
          stats.value.totalActivities = (_a = data.totalActivities) != null ? _a : 0;
          stats.value.totalHours = (_b = data.totalHours) != null ? _b : 0;
          stats.value.totalCount = (_c = data.totalCount) != null ? _c : 0;
        }
      } catch (e) {
      }
    }));
    function navTo(url) {
      common_vendor.index.navigateTo({ url });
    }
    function onLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success(res) {
          if (res.confirm) {
            userStore.logout();
            common_vendor.index.redirectTo({
              url: `/pages/auth/login?redirect=${encodeURIComponent("/pages/index/index")}`
            });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: avatar.value,
        b: common_vendor.t(nickname.value),
        c: common_vendor.t(isAdmin.value ? "管理员" : "志愿者"),
        d: common_vendor.n(isAdmin.value ? "role-admin" : "role-user"),
        e: common_vendor.t(stats.value.totalActivities),
        f: common_vendor.t(stats.value.totalHours),
        g: common_vendor.t(stats.value.totalCount),
        h: common_vendor.p({
          name: "list-check-line",
          size: "36rpx"
        }),
        i: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        j: common_vendor.o(($event) => navTo("/pages/volunteer/record")),
        k: common_vendor.p({
          name: "checkbox-line",
          size: "36rpx"
        }),
        l: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        m: common_vendor.o(($event) => navTo("/pages/volunteer/checkin-list")),
        n: isAdmin.value
      }, isAdmin.value ? {
        o: common_vendor.p({
          name: "check-circle-line",
          size: "36rpx"
        }),
        p: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        q: common_vendor.o(($event) => navTo("/pages/admin/checkin-audit")),
        r: common_vendor.p({
          name: "medal-line",
          size: "36rpx"
        }),
        s: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        t: common_vendor.o(($event) => navTo("/pages/admin/honor-audit")),
        v: common_vendor.p({
          name: "user-setting-line",
          size: "36rpx"
        }),
        w: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        x: common_vendor.o(($event) => navTo("/pages/admin/user-manage")),
        y: common_vendor.p({
          name: "chart-pie-line",
          size: "36rpx"
        }),
        z: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        A: common_vendor.o(($event) => navTo("/pages/admin/statistics"))
      } : {}, {
        B: common_vendor.p({
          name: "share-forward-line",
          size: "36rpx"
        }),
        C: common_vendor.o(onLogout)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dd49826d"]]);
wx.createPage(MiniProgramPage);
