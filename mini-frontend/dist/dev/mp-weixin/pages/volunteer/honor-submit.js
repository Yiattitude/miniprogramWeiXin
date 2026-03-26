"use strict";
const common_vendor = require("../../common/vendor.js");
const api_volunteer = require("../../api/volunteer.js");
const composables_useAuth = require("../../composables/useAuth.js");
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
if (!Array) {
  const _easycom_uv_upload2 = common_vendor.resolveComponent("uv-upload");
  _easycom_uv_upload2();
}
const _easycom_uv_upload = () => "../../components/stub/uv-upload.js";
if (!Math) {
  (_easycom_uv_upload + Icon)();
}
const Icon = () => "../../components/common/Icon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "honor-submit",
  setup(__props) {
    const honorSubmitting = common_vendor.ref(false);
    const honorLevels = ["国家级荣誉", "省部级荣誉", "厅局级荣誉", "厂处级荣誉"];
    const honorMap = {
      "国家级荣誉": 20,
      "省部级荣誉": 16,
      "厅局级荣誉": 12,
      "厂处级荣誉": 10
    };
    const selectedHonor = common_vendor.ref("");
    const honorPoints = common_vendor.ref(0);
    const honorImages = common_vendor.ref([]);
    const honorFiles = common_vendor.ref([]);
    const { requireLogin } = composables_useAuth.useAuth();
    const userStore = stores_user.useUserStore();
    function onHonorChange(e) {
      const level = honorLevels[e.detail.value];
      selectedHonor.value = level;
      honorPoints.value = honorMap[level] || 0;
    }
    function chooseHonorFiles() {
      common_vendor.index.chooseMessageFile({
        count: 3,
        type: "file",
        success(res) {
          const list = Array.isArray(res.tempFiles) ? res.tempFiles : [];
          const mapped = list.map((item) => ({
            name: item.name || "未命名文件",
            path: item.path,
            size: item.size
          }));
          honorFiles.value = [...honorFiles.value, ...mapped];
        }
      });
    }
    function removeHonorFile(index) {
      const list = [...honorFiles.value];
      list.splice(index, 1);
      honorFiles.value = list;
    }
    function submitHonor() {
      return __async(this, null, function* () {
        const ok = yield requireLogin({
          content: "提交荣誉信息需要先登录，是否立即登录？"
        });
        if (!ok)
          return;
        if (!selectedHonor.value) {
          common_vendor.index.showToast({ title: "请选择荣誉级别", icon: "none" });
          return;
        }
        const userInfo = userStore.userInfo || {};
        const userId = userInfo._id || userInfo.userId || userInfo.id || userInfo._openid || "";
        honorSubmitting.value = true;
        try {
          const proofs = [
            ...honorImages.value.map((item) => item.url || item.path).filter(Boolean),
            ...honorFiles.value.map((item) => item.path).filter(Boolean)
          ];
          yield api_volunteer.submitHonor({
            userId,
            honorLevel: selectedHonor.value,
            honorPoints: honorPoints.value,
            proofs
          });
          common_vendor.index.showToast({ title: "提交成功，等待审核", icon: "success" });
          selectedHonor.value = "";
          honorPoints.value = 0;
          honorImages.value = [];
          honorFiles.value = [];
        } catch (err) {
          common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败，请重试", icon: "none" });
        } finally {
          honorSubmitting.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedHonor.value || "请选择荣誉级别"),
        b: !selectedHonor.value ? 1 : "",
        c: honorLevels,
        d: common_vendor.o(onHonorChange),
        e: common_vendor.t(honorPoints.value),
        f: common_vendor.o(($event) => honorImages.value = $event),
        g: common_vendor.p({
          ["max-count"]: 9,
          ["max-size"]: 10 * 1024 * 1024,
          ["upload-icon"]: "camera",
          ["preview-full-image"]: true,
          fileList: honorImages.value
        }),
        h: common_vendor.o(chooseHonorFiles),
        i: honorFiles.value.length > 0
      }, honorFiles.value.length > 0 ? {
        j: common_vendor.f(honorFiles.value, (file, idx, i0) => {
          return {
            a: "463ac47f-1-" + i0,
            b: common_vendor.t(file.name),
            c: common_vendor.o(($event) => removeHonorFile(idx), file.path || idx),
            d: "463ac47f-2-" + i0,
            e: file.path || idx
          };
        }),
        k: common_vendor.p({
          name: "file-text-line",
          size: "16px",
          color: "#6b7b8d"
        }),
        l: common_vendor.p({
          name: "close-line",
          size: "16px",
          color: "#c0392b"
        })
      } : {}, {
        m: common_vendor.t(honorSubmitting.value ? "提交中..." : "提交荣誉信息"),
        n: honorSubmitting.value,
        o: common_vendor.o(submitHonor)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-463ac47f"]]);
wx.createPage(MiniProgramPage);
