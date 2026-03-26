"use strict";
const common_vendor = require("../common/vendor.js");
const api_http = require("./http.js");
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
function getActivityList(params) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("getActivities", params);
  });
}
function getActivityById(id) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("getActivityById", { id });
  });
}
function publishActivity(form) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("publishActivity", form);
  });
}
function submitCheckin(data) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("submitCheckin", data);
  });
}
function getMyRecords(params) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("getMyRecords", params);
  });
}
function getStatistics() {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("getStatistics");
  });
}
function submitHonor(data) {
  return __async(this, null, function* () {
    return yield api_http.cloudCall("submitHonor", data);
  });
}
function exportReport() {
  return __async(this, null, function* () {
    const fileID = yield api_http.cloudCall("exportReport");
    const { fileList } = yield common_vendor.wx$1.cloud.getTempFileURL({
      fileList: [fileID]
    });
    return { downloadUrl: fileList[0].tempFileURL };
  });
}
exports.exportReport = exportReport;
exports.getActivityById = getActivityById;
exports.getActivityList = getActivityList;
exports.getMyRecords = getMyRecords;
exports.getStatistics = getStatistics;
exports.publishActivity = publishActivity;
exports.submitCheckin = submitCheckin;
exports.submitHonor = submitHonor;
