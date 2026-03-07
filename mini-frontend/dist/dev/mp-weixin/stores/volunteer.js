"use strict";
const common_vendor = require("../common/vendor.js");
const api_volunteer = require("../api/volunteer.js");
const useVolunteerStore = common_vendor.defineStore("volunteer", () => {
  const activityList = common_vendor.ref([]);
  const activityTotal = common_vendor.ref(0);
  const currentActivity = common_vendor.ref(null);
  const mySignups = common_vendor.ref([]);
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
  async function fetchActivityList(page = 1, pageSize = 10) {
    const result = await api_volunteer.getActivityList({
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
  }
  async function fetchActivityById(id) {
    const activity = await api_volunteer.getActivityById(id);
    currentActivity.value = activity;
    return activity;
  }
  async function publishActivity(form) {
    const activity = await api_volunteer.publishActivity(form);
    return activity;
  }
  async function signupActivity(activityId) {
    var _a;
    await api_volunteer.signup(activityId);
    const idx = activityList.value.findIndex((a) => a._id === activityId);
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isSignedUp: true };
    }
    if (((_a = currentActivity.value) == null ? void 0 : _a._id) === activityId) {
      currentActivity.value = { ...currentActivity.value, isSignedUp: true };
    }
  }
  async function cancelSignup(activityId) {
    var _a;
    await api_volunteer.cancelSignup(activityId);
    const idx = activityList.value.findIndex((a) => a._id === activityId);
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isSignedUp: false };
    }
    if (((_a = currentActivity.value) == null ? void 0 : _a._id) === activityId) {
      currentActivity.value = { ...currentActivity.value, isSignedUp: false };
    }
  }
  async function fetchMySignups() {
    mySignups.value = await api_volunteer.getMySignups();
  }
  async function submitCheckin(form) {
    const record = await api_volunteer.submitCheckin(form);
    const idx = mySignups.value.findIndex((a) => a._id === form.activityId);
    if (idx !== -1) {
      mySignups.value[idx] = { ...mySignups.value[idx], isCheckedIn: true };
    }
    return record;
  }
  async function fetchMyRecords(page = 1, pageSize = 10) {
    const result = await api_volunteer.getMyRecords({ page, pageSize });
    if (page === 1) {
      myRecords.value = result.list;
    } else {
      myRecords.value.push(...result.list);
    }
    recordTotal.value = result.total;
    return result;
  }
  async function fetchStatistics() {
    statistics.value = await api_volunteer.getStatistics();
  }
  async function exportReport() {
    const { downloadUrl } = await api_volunteer.exportReport();
    return downloadUrl;
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
    mySignups,
    myRecords,
    recordTotal,
    statistics,
    filter,
    fetchActivityList,
    fetchActivityById,
    publishActivity,
    signupActivity,
    cancelSignup,
    fetchMySignups,
    submitCheckin,
    fetchMyRecords,
    fetchStatistics,
    exportReport,
    resetFilter
  };
});
exports.useVolunteerStore = useVolunteerStore;
