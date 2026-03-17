"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "LoginModal",
  emits: ["wechat-code", "close"],
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
    async function handleLogin() {
      if (!agreed.value) {
        common_vendor.index.showToast({ title: "请先同意服务协议与隐私政策", icon: "none" });
        return;
      }
      try {
        const loginResult = await common_vendor.index.login({
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
    }
    function toggleAgree() {
      agreed.value = !agreed.value;
    }
    __expose({ open, close });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: "primary",
        b: !agreed.value,
        c: !agreed.value ? 1 : "",
        d: common_vendor.o(handleLogin),
        e: agreed.value
      }, agreed.value ? {} : {}, {
        f: agreed.value ? 1 : "",
        g: common_vendor.o(toggleAgree),
        h: show.value ? 1 : ""
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f765fec6"]]);
wx.createComponent(Component);
