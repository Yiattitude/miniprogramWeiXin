"use strict";
const common_vendor = require("../common/vendor.js");
const api_http = require("./http.js");
async function getActivityList(params) {
  return await api_http.cloudCall("getActivities", params);
}
async function getActivityById(id) {
  return await api_http.cloudCall("getActivityById", { id });
}
async function publishActivity(form) {
  return await api_http.cloudCall("publishActivity", form);
}
async function submitCheckin(data) {
  return await api_http.cloudCall("submitCheckin", data);
}
async function getMyRecords(params) {
  return await api_http.cloudCall("getMyRecords", params);
}
async function getStatistics() {
  return await api_http.cloudCall("getStatistics");
}
async function submitHonor(data) {
  return await api_http.cloudCall("submitHonor", data);
}
async function exportReport() {
  const fileID = await api_http.cloudCall("exportReport");
  const { fileList } = await common_vendor.wx$1.cloud.getTempFileURL({
    fileList: [fileID]
  });
  return { downloadUrl: fileList[0].tempFileURL };
}
exports.exportReport = exportReport;
exports.getActivityById = getActivityById;
exports.getActivityList = getActivityList;
exports.getMyRecords = getMyRecords;
exports.getStatistics = getStatistics;
exports.publishActivity = publishActivity;
exports.submitCheckin = submitCheckin;
exports.submitHonor = submitHonor;
