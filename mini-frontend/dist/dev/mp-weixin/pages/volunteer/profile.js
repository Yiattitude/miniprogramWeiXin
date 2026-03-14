"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_volunteer = require("../../api/volunteer.js");
if (!Math) {
  Icon();
}
const Icon = () => "../../components/common/Icon.js";

// 生成默认昵称：微信用户+随机数字
function generateDefaultNickname() {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return "\u5fae\u4fe1\u7528\u6237" + randomNum;
}

const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const isAdmin = common_vendor.computed(() => userStore.isAdmin);
    const nickname = common_vendor.ref("");
    const avatar = common_vendor.ref("/static/default-avatar.png");
    const showNicknameModal = common_vendor.ref(false);
    const tempNickname = common_vendor.ref("");
    
    // 从userInfo获取头像和昵称
    function loadUserInfo() {
      const info = userStore.userInfo;
      console.log("Current userInfo in profile:", info);
      if (info) {
        const savedNickName = info.nickName || info.nickname || info.name || info.userName;
        if (savedNickName && savedNickName !== "\u5fae\u4fe1\u7528\u6237") {
          nickname.value = savedNickName;
        } else {
          nickname.value = generateDefaultNickname();
          // 自动保存生成的默认昵称
          updateProfile({ nickName: nickname.value, nickname: nickname.value });
        }
        avatar.value = info.avatarUrl || info.avatar || info.headImgUrl || "/static/default-avatar.png";
      } else {
        nickname.value = generateDefaultNickname();
        avatar.value = "/static/default-avatar.png";
      }
      console.log("Profile state updated:", { nickname: nickname.value, avatar: avatar.value });
    }

    // 监听 store 变化更新 UI
    if (userStore && typeof userStore.$subscribe === "function") {
      userStore.$subscribe((mutation, state) => {
        loadUserInfo();
      });
    }
    
    const stats = common_vendor.ref({
      totalActivities: 0,
      totalHours: 0,
      totalCount: 0
    });
    
    common_vendor.onShow(async () => {
      loadUserInfo();
      try {
        const data = await api_volunteer.getStatistics();
        if (data) {
          stats.value.totalActivities = (data.totalActivities != null ? data.totalActivities : 0);
          stats.value.totalHours = (data.totalHours != null ? data.totalHours : 0);
          stats.value.totalCount = (data.totalCount != null ? data.totalCount : 0);
        }
      } catch {
      }
    });
    
    function showToast(title) {
      common_vendor.index.showToast({ title, icon: "none" });
    }
    
    function showLoading(title) {
      common_vendor.index.showLoading({ title, mask: true });
    }
    
    function hideLoading() {
      common_vendor.index.hideLoading();
    }
    
    // 上传头像到云存储
    async function uploadAvatarToCloud(tempFilePath) {
      try {
        showLoading("\u4e0a\u4f20\u5934\u50cf...");
        const cloudPath = "avatars/" + Date.now() + "_" + Math.random().toString(36).substr(2, 9) + ".png";
        const uploadRes = await common_vendor.wx$1.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempFilePath
        });
        hideLoading();
        if (uploadRes && uploadRes.fileID) {
          return uploadRes.fileID;
        }
        return null;
      } catch (err) {
        hideLoading();
        console.error("\u4e0a\u4f20\u5934\u50cf\u5931\u8d25:", err);
        return null;
      }
    }
    
    // 更新用户信息到云端
    async function updateProfile(partial, action = "updateProfile") {
      if (!partial)
        return;
      
      // 权限校验：确保已登录
      if (!userStore.isLoggedIn) {
        showToast("\u8bf7\u5148\u767b\u5f55");
        return;
      }

      if (userStore && typeof userStore.syncUserInfo === "function") {
        userStore.syncUserInfo(partial);
      } else {
        const cached = common_vendor.index.getStorageSync("userInfo") || {};
        const merged = Object.assign({}, cached, partial);
        common_vendor.index.setStorageSync("userInfo", merged);
      }
      try {
        if (common_vendor.wx$1 && common_vendor.wx$1.cloud) {
          await common_vendor.wx$1.cloud.callFunction({
            name: "volunteer-service",
            data: {
              action: action,
              data: partial
            }
          });
        }
      } catch (err) {
        console.error("\u540c\u6b65\u4e91\u7aef\u5931\u8d25:", err);
      }
    }
    
    // 选择头像回调
    async function onChooseAvatar(e) {
      const tempFilePath = e.detail && e.detail.avatarUrl;
      if (!tempFilePath) {
        showToast("\u83b7\u53d6\u5934\u50cf\u5931\u8d25");
        return;
      }
      
      // 先显示临时头像实现秒开刷新
      avatar.value = tempFilePath;
      
      // 上传到云存储获取永久URL
      const cloudFileId = await uploadAvatarToCloud(tempFilePath);
      if (cloudFileId) {
        avatar.value = cloudFileId;
        // 回写云存储URL到数据库
        await updateProfile({ avatarUrl: cloudFileId, avatar: cloudFileId }, "updateAvatar");
        showToast("\u5934\u50cf\u5df2\u66f4\u65b0");
      } else {
        // 上传失败，回退或保存本地
        await updateProfile({ avatarUrl: tempFilePath, avatar: tempFilePath });
        showToast("\u5934\u50cf\u4fdd\u5b58\u6210\u529f\uff0c\u4f46\u4e91\u540c\u6b65\u5931\u8d25");
      }
    }
    
    // 显示昵称编辑弹窗
    function showNicknameEdit() {
      tempNickname.value = nickname.value;
      showNicknameModal.value = true;
    }
    
    // 关闭昵称弹窗
    function closeNicknameModal() {
      showNicknameModal.value = false;
      tempNickname.value = "";
    }
    
    // 确认修改昵称
    async function confirmNickname() {
      const value = tempNickname.value.trim();
      if (!value) {
        showToast("\u6635\u79f0\u4e0d\u80fd\u4e3a\u7a7a");
        return;
      }
      nickname.value = value;
      await updateProfile({ nickName: value, nickname: value });
      closeNicknameModal();
      showToast("\u6635\u79f0\u5df2\u66f4\u65b0");
    }
    
    // 监听昵称输入
    function onNicknameInput(e) {
      tempNickname.value = e.detail.value;
    }
    
    function navTo(url) {
      common_vendor.index.navigateTo({ url });
    }
    
    function onLogout() {
      common_vendor.index.showModal({
        title: "\u63d0\u793a",
        content: "\u786e\u5b9a\u8981\u9000\u51fa\u767b\u5f55\u5417\uff1f",
        success(res) {
          if (res.confirm) {
            userStore.logout();
            common_vendor.index.reLaunch({ url: "/pages/auth/login" });
          }
        }
      });
    }
    
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: avatar.value,
        aa: common_vendor.o(onChooseAvatar),
        b: nickname.value,
        ba: showNicknameModal.value,
        bb: tempNickname.value,
        bc: common_vendor.o(confirmNickname),
        bd: common_vendor.o(closeNicknameModal),
        be: common_vendor.o(showNicknameEdit),
        bf: common_vendor.o(onNicknameInput),
        c: common_vendor.t(isAdmin.value ? "\u7ba1\u7406\u5458" : "\u5fd7\u613f\u8005"),
        d: common_vendor.n(isAdmin.value ? "role-admin" : "role-user"),
        e: common_vendor.t(stats.value.totalActivities),
        f: common_vendor.t(stats.value.totalHours),
        g: common_vendor.t(stats.value.totalCount),
        h: common_vendor.p({
          name: "list-check-line",
          size: "36rpx"
        }),
        i: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        j: common_vendor.o(($event) => navTo("/pages/volunteer/record")),
        k: common_vendor.p({
          name: "checkbox-line",
          size: "36rpx"
        }),
        l: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        m: common_vendor.o(($event) => navTo("/pages/volunteer/checkin-list")),
        n: isAdmin.value
      }, isAdmin.value ? {
        o: common_vendor.p({
          name: "chart-bar-line",
          size: "36rpx"
        }),
        p: common_vendor.p({
          name: "arrow-right-line",
          size: "36rpx"
        }),
        q: common_vendor.o(($event) => navTo("/pages/volunteer/statistics"))
      } : {}, {
        r: common_vendor.p({
          name: "share-forward-line",
          size: "36rpx"
        }),
        s: common_vendor.o(onLogout)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dd49826d"]]);
wx.createPage(MiniProgramPage);
