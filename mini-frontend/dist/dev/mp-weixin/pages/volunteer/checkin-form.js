"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_volunteer = require("../../stores/volunteer.js");
const composables_useAuth = require("../../composables/useAuth.js");
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
  _easycom_uv_upload();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "checkin-form",
  setup(__props) {
    const volunteerStore = stores_volunteer.useVolunteerStore();
    const { requireLogin } = composables_useAuth.useAuth();
    const activityId = common_vendor.ref("");
    const activityName = common_vendor.ref("");
    const activityCategory = common_vendor.ref("");
    const declaredPoints = common_vendor.ref("");
    const remark = common_vendor.ref("");
    const fileList = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const errors = common_vendor.ref({});
    const pointsLimitText = common_vendor.computed(() => {
      const cat = activityCategory.value;
      if (cat === "传承红色文化" || cat === "服务企业发展")
        return "3-10";
      return "1-5";
    });
    common_vendor.onLoad((options) => __async(this, null, function* () {
      const id = (options == null ? void 0 : options.activityId) || "";
      activityId.value = id;
      if (!id)
        return;
      try {
        const activity = yield volunteerStore.fetchActivityById(id);
        activityName.value = activity.name;
        activityCategory.value = activity.category || "其他服务";
      } catch (e) {
        console.error("[checkin-form] fetchActivity error:", e);
      }
    }));
    function validate() {
      errors.value = {};
      const points = parseInt(declaredPoints.value);
      if (!declaredPoints.value) {
        errors.value.points = "请填写申报积分";
      } else if (isNaN(points)) {
        errors.value.points = "申报积分必须为数字";
      } else {
        let min = 1;
        let max = 5;
        const cat = activityCategory.value;
        if (cat === "传承红色文化" || cat === "服务企业发展") {
          min = 3;
          max = 10;
        }
        if (points < min || points > max) {
          errors.value.points = `申报积分须在 ${min} ~ ${max} 之间`;
        }
      }
      return Object.keys(errors.value).length === 0;
    }
    function handleSubmit() {
      return __async(this, null, function* () {
        const ok = yield requireLogin({
          content: "提交打卡需要先登录，是否立即登录？"
        });
        if (!ok)
          return;
        if (!validate())
          return;
        submitting.value = true;
        try {
          const photoUrls = fileList.value.map((f) => f.url || f.path);
          yield volunteerStore.submitCheckin({
            activityId: activityId.value,
            declaredPoints: parseInt(declaredPoints.value),
            activityCategory: activityCategory.value,
            photos: photoUrls,
            remark: remark.value || void 0
          });
          common_vendor.index.showToast({ title: "打卡成功！", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } catch (e) {
          console.error("[checkin-form] submit error:", e);
        } finally {
          submitting.value = false;
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activityName.value
      }, activityName.value ? {
        b: common_vendor.t(activityName.value)
      } : {}, {
        c: declaredPoints.value,
        d: common_vendor.o(($event) => declaredPoints.value = $event.detail.value),
        e: errors.value.points ? 1 : "",
        f: errors.value.points
      }, errors.value.points ? {
        g: common_vendor.t(errors.value.points)
      } : {}, {
        h: activityCategory.value
      }, activityCategory.value ? {
        i: common_vendor.t(activityCategory.value),
        j: common_vendor.t(pointsLimitText.value)
      } : {}, {
        k: common_vendor.o(($event) => fileList.value = $event),
        l: common_vendor.p({
          ["max-count"]: 9,
          ["max-size"]: 5 * 1024 * 1024,
          ["upload-icon"]: "camera",
          ["preview-full-image"]: true,
          fileList: fileList.value
        }),
        m: remark.value,
        n: common_vendor.o(($event) => remark.value = $event.detail.value),
        o: common_vendor.t(remark.value.length),
        p: common_vendor.t(submitting.value ? "提交中..." : "提交打卡"),
        q: submitting.value ? 1 : "",
        r: submitting.value,
        s: common_vendor.o(handleSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2788f303"]]);
wx.createPage(MiniProgramPage);
