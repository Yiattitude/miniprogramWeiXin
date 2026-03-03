"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const refreshing = common_vendor.ref(false);
    common_vendor.onShow(async () => {
      if (userStore.isLoggedIn) {
        await userStore.fetchProfile();
      }
    });
    async function handleRefresh() {
      refreshing.value = true;
      try {
        await userStore.fetchProfile();
      } finally {
        refreshing.value = false;
        common_vendor.index.stopPullDownRefresh();
      }
    }
    common_vendor.onPullDownRefresh(() => {
      handleRefresh();
    });
    function goPage(url) {
      common_vendor.index.navigateTo({ url });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        confirmText: "退出",
        confirmColor: "#e74c3c",
        success(res) {
          if (res.confirm) {
            userStore.logout();
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return common_vendor.e({
        a: ((_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.avatar) || "/static/default-avatar.png",
        b: common_vendor.t(((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.nickname) || "银发人才"),
        c: common_vendor.t(((_c = common_vendor.unref(userStore).userInfo) == null ? void 0 : _c.unit) || "暂未设置单位"),
        d: common_vendor.t(common_vendor.unref(userStore).isAdmin ? "管理员" : "志愿者"),
        e: common_vendor.n(common_vendor.unref(userStore).isAdmin ? "role-admin" : "role-member"),
        f: common_vendor.t(((_d = common_vendor.unref(userStore).userInfo) == null ? void 0 : _d.totalHours) ?? 0),
        g: common_vendor.t(((_e = common_vendor.unref(userStore).userInfo) == null ? void 0 : _e.totalCount) ?? 0),
        h: common_vendor.t(((_f = common_vendor.unref(userStore).userInfo) == null ? void 0 : _f.totalServed) ?? 0),
        i: common_vendor.o(($event) => goPage("/pages/volunteer/record")),
        j: common_vendor.o(($event) => goPage("/pages/volunteer/statistics")),
        k: common_vendor.o(($event) => goPage("/pages/volunteer/checkin-list")),
        l: common_vendor.o(($event) => goPage("/pages/volunteer/signup-list")),
        m: common_vendor.unref(userStore).isAdmin
      }, common_vendor.unref(userStore).isAdmin ? {
        n: common_vendor.o(($event) => goPage("/pages/volunteer/publish"))
      } : {}, {
        o: common_vendor.o(handleLogout)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dd49826d"]]);
wx.createPage(MiniProgramPage);
