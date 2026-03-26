"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const stores_user = require("../../stores/user.js");
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
  __name: "bind",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const loading = common_vendor.ref(false);
    const openid = common_vendor.ref("");
    const redirect = common_vendor.ref("/pages/index/index");
    common_vendor.onLoad((query) => {
      const queryOpenId = decodeURIComponent((query == null ? void 0 : query.openid) || "");
      openid.value = queryOpenId || common_vendor.index.getStorageSync("openid") || "";
      if (queryOpenId) {
        common_vendor.index.setStorageSync("openid", queryOpenId);
      }
      const r = (query == null ? void 0 : query.redirect) || "";
      if (r)
        redirect.value = decodeURIComponent(r);
    });
    const form = common_vendor.reactive({
      realName: "",
      phone: ""
    });
    const errors = common_vendor.reactive({
      realName: "",
      phone: ""
    });
    common_vendor.watch(() => form.realName, validateRealName);
    common_vendor.watch(() => form.phone, validatePhone);
    function validateRealName(value) {
      if (!value.trim())
        errors.realName = "请输入真实姓名";
      else if (value.length < 2)
        errors.realName = "姓名至少2个字符";
      else if (!/^[\u4e00-\u9fa5]{2,}$/.test(value))
        errors.realName = "请输入正确的中文姓名";
      else
        errors.realName = "";
    }
    function validatePhone(value) {
      if (!value)
        errors.phone = "请输入手机号码";
      else if (!/^1[3-9]\d{9}$/.test(value))
        errors.phone = "请输入正确的手机号码";
      else
        errors.phone = "";
    }
    function validateForm() {
      validateRealName(form.realName);
      validatePhone(form.phone);
      return !errors.realName && !errors.phone && !!form.realName && !!form.phone;
    }
    function onSubmit() {
      return __async(this, null, function* () {
        if (!openid.value) {
          common_vendor.index.showToast({ title: "缺少 openid，请重新登录", icon: "none" });
          common_vendor.index.redirectTo({ url: `/pages/auth/login?redirect=${encodeURIComponent(redirect.value)}` });
          return;
        }
        if (!validateForm()) {
          common_vendor.index.showToast({ title: "请检查输入信息", icon: "none" });
          return;
        }
        loading.value = true;
        try {
          const res = yield api_user.bindUser({ openid: openid.value, realName: form.realName, phone: form.phone });
          if (!res.success || !res.token) {
            common_vendor.index.showToast({ title: res.message || "绑定失败", icon: "none" });
            return;
          }
          userStore.token = res.token;
          if (res.userInfo)
            userStore.syncUserInfo(res.userInfo);
          common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        } catch (e) {
          common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
        } finally {
          loading.value = false;
        }
      });
    }
    function onCancel() {
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "user-add-line",
          size: "64px",
          color: "#2f62c6"
        }),
        b: form.realName,
        c: common_vendor.o(($event) => form.realName = $event.detail.value),
        d: errors.realName
      }, errors.realName ? {
        e: common_vendor.t(errors.realName)
      } : {}, {
        f: form.phone,
        g: common_vendor.o(($event) => form.phone = $event.detail.value),
        h: errors.phone
      }, errors.phone ? {
        i: common_vendor.t(errors.phone)
      } : {}, {
        j: common_vendor.t(loading.value ? "验证中..." : "确认绑定"),
        k: loading.value,
        l: loading.value,
        m: common_vendor.o(onCancel),
        n: loading.value,
        o: common_vendor.o(onSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6f0ac6de"]]);
wx.createPage(MiniProgramPage);
