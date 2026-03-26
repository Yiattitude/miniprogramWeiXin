"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_http = require("../../api/http.js");
if (!Math) {
  Icon();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "admin-login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const loading = common_vendor.ref(false);
    const redirect = common_vendor.ref("/pages/admin/statistics");
    const form = common_vendor.reactive({
      account: "",
      password: ""
    });
    const errors = common_vendor.reactive({
      account: "",
      password: ""
    });
    common_vendor.onLoad((query) => {
      const r = (query == null ? void 0 : query.redirect) || "";
      if (r)
        redirect.value = decodeURIComponent(r);
    });
    function validateAccount(value) {
      if (!value.trim())
        errors.account = "请输入账号";
      else
        errors.account = "";
    }
    function validatePassword(value) {
      if (!value.trim())
        errors.password = "请输入密码";
      else
        errors.password = "";
    }
    function validateForm() {
      validateAccount(form.account);
      validatePassword(form.password);
      return !errors.account && !errors.password;
    }
    function isTabPage(url) {
      return url === "/pages/index/index" || url === "/pages/volunteer/index" || url === "/pages/volunteer/profile";
    }
    async function onSubmit() {
      if (!validateForm()) {
        common_vendor.index.showToast({ title: "请检查输入信息", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await api_http.cloudCall("adminLogin", {
          account: form.account.trim(),
          password: form.password
        });
        if (!(res == null ? void 0 : res.token)) {
          common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
          return;
        }
        userStore.token = res.token;
        if (res.userInfo)
          userStore.syncUserInfo(res.userInfo);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        const url = redirect.value || "/pages/admin/statistics";
        if (isTabPage(url)) {
          common_vendor.index.switchTab({ url });
        } else {
          common_vendor.index.redirectTo({ url });
        }
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }
    function onCancel() {
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "user-setting-line",
          size: "64px",
          color: "#0b2f6b"
        }),
        b: form.account,
        c: common_vendor.o(($event) => form.account = $event.detail.value),
        d: errors.account
      }, errors.account ? {
        e: common_vendor.t(errors.account)
      } : {}, {
        f: form.password,
        g: common_vendor.o(($event) => form.password = $event.detail.value),
        h: errors.password
      }, errors.password ? {
        i: common_vendor.t(errors.password)
      } : {}, {
        j: common_vendor.t(loading.value ? "登录中..." : "登录"),
        k: loading.value,
        l: loading.value,
        m: common_vendor.o(onCancel),
        n: loading.value,
        o: common_vendor.o(onSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-23b29117"]]);
wx.createPage(MiniProgramPage);
