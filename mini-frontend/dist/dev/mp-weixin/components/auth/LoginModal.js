"use strict";
const common_vendor = require("../../common/vendor.js");
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
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "LoginModal",
  emits: ["wechat-code", "admin", "close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const show = common_vendor.ref(true);
    const agreed = common_vendor.ref(true);
    function open() {
      show.value = true;
    }
    function close() {
      show.value = false;
      emit("close");
    }
    function handleLogin() {
      return __async(this, null, function* () {
        if (!agreed.value) {
          common_vendor.index.showToast({ title: "请先同意服务协议与隐私政策", icon: "none" });
          return;
        }
        try {
          const loginResult = yield common_vendor.index.login({
            provider: "weixin"
          });
          if (loginResult.code) {
            emit("wechat-code", loginResult.code);
            close();
          }
        } catch (error) {
          console.error("登录失败:", error);
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none"
          });
        }
      });
    }
    function handleAdminEntry() {
      if (!agreed.value) {
        common_vendor.index.showToast({ title: "请先同意服务协议与隐私政策", icon: "none" });
        return;
      }
      emit("admin");
    }
    function toggleAgree() {
      agreed.value = !agreed.value;
    }
    __expose({ open, close });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !agreed.value,
        b: !agreed.value ? 1 : "",
        c: common_vendor.o(handleAdminEntry),
        d: "primary",
        e: !agreed.value,
        f: !agreed.value ? 1 : "",
        g: common_vendor.o(handleLogin),
        h: agreed.value
      }, agreed.value ? {} : {}, {
        i: agreed.value ? 1 : "",
        j: common_vendor.o(toggleAgree),
        k: show.value ? 1 : ""
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f765fec6"]]);
wx.createComponent(Component);
