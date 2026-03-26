"use strict";
const common_vendor = require("../common/vendor.js");
const api_volunteer = require("../api/volunteer.js");
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
const useVolunteerStore = common_vendor.defineStore("volunteer", () => {
  const activityList = common_vendor.ref([]);
  const activityTotal = common_vendor.ref(0);
  const currentActivity = common_vendor.ref(null);
  const myRecords = common_vendor.ref([]);
  const recordTotal = common_vendor.ref(0);
  const statistics = common_vendor.ref(null);
  const filter = common_vendor.reactive({
    timeRange: "month",
    location: "",
    keyword: "",
    startDate: void 0,
    endDate: void 0
  });
  function fetchActivityList(page = 1, pageSize = 10) {
    return __async(this, null, function* () {
      const result = yield api_volunteer.getActivityList({
        page,
        pageSize,
        keyword: filter.keyword || void 0,
        location: filter.location || void 0,
        startDate: filter.startDate,
        endDate: filter.endDate
      });
      if (page === 1) {
        activityList.value = result.list;
      } else {
        activityList.value.push(...result.list);
      }
      activityTotal.value = result.total;
      return result;
    });
  }
  function fetchActivityById(id) {
    return __async(this, null, function* () {
      const activity = yield api_volunteer.getActivityById(id);
      currentActivity.value = activity;
      return activity;
    });
  }
  function publishActivity(form) {
    return __async(this, null, function* () {
      const activity = yield api_volunteer.publishActivity(form);
      return activity;
    });
  }
  function submitCheckin(form) {
    return __async(this, null, function* () {
      var _a;
      const record = yield api_volunteer.submitCheckin(form);
      const idx = activityList.value.findIndex((a) => a._id === form.activityId);
      if (idx !== -1) {
        activityList.value[idx] = __spreadProps(__spreadValues({}, activityList.value[idx]), { isCheckedIn: true });
      }
      if (((_a = currentActivity.value) == null ? void 0 : _a._id) === form.activityId) {
        currentActivity.value = __spreadProps(__spreadValues({}, currentActivity.value), { isCheckedIn: true });
      }
      return record;
    });
  }
  function fetchMyRecords(page = 1, pageSize = 10) {
    return __async(this, null, function* () {
      const result = yield api_volunteer.getMyRecords({ page, pageSize });
      if (page === 1) {
        myRecords.value = result.list;
      } else {
        myRecords.value.push(...result.list);
      }
      recordTotal.value = result.total;
      return result;
    });
  }
  function fetchStatistics() {
    return __async(this, null, function* () {
      const data = yield api_volunteer.getStatistics();
      statistics.value = data;
      return data;
    });
  }
  function exportReport() {
    return __async(this, null, function* () {
      const { downloadUrl } = yield api_volunteer.exportReport();
      return downloadUrl;
    });
  }
  function resetFilter() {
    filter.timeRange = "month";
    filter.location = "";
    filter.keyword = "";
    filter.startDate = void 0;
    filter.endDate = void 0;
  }
  return {
    activityList,
    activityTotal,
    currentActivity,
    myRecords,
    recordTotal,
    statistics,
    filter,
    fetchActivityList,
    fetchActivityById,
    publishActivity,
    submitCheckin,
    fetchMyRecords,
    fetchStatistics,
    exportReport,
    resetFilter
  };
});
exports.useVolunteerStore = useVolunteerStore;
