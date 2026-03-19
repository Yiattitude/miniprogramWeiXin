"use strict";
const common_vendor = require("../common/vendor.js");
const api_volunteer = require("../api/volunteer.js");
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
  async function submitCheckin(form) {
    var _a;
    const record = await api_volunteer.submitCheckin(form);
    const idx = activityList.value.findIndex((a) => a._id === form.activityId);
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isCheckedIn: true };
    }
    if (((_a = currentActivity.value) == null ? void 0 : _a._id) === form.activityId) {
      currentActivity.value = { ...currentActivity.value, isCheckedIn: true };
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
    const data = await api_volunteer.getStatistics();
    statistics.value = data;
    return data;
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
