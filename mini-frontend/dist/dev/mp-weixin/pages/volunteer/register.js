Page({
  data: {
    name: "",
    phone: "",
    genderOptions: ["\u7537", "\u5973", "\u5176\u4ed6"],
    genderIndex: 0,
    age: "",
    unit: "",
    remark: "",
    submitting: false
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    const update = {};
    update[field] = e.detail.value;
    this.setData(update);
  },
  onGenderChange(e) {
    this.setData({ genderIndex: Number(e.detail.value) || 0 });
  },
  async onSubmit() {
    if (this.data.submitting) return;

    const name = String(this.data.name || "").trim();
    const phone = String(this.data.phone || "").trim();
    const ageText = String(this.data.age || "").trim();
    const unit = String(this.data.unit || "").trim();
    const remark = String(this.data.remark || "").trim();

    if (!name) {
      wx.showToast({ title: "\u8bf7\u8f93\u5165\u59d3\u540d", icon: "none" });
      return;
    }

    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u624b\u673a\u53f7", icon: "none" });
      return;
    }

    if (ageText && (!/^\d+$/.test(ageText) || Number(ageText) < 1 || Number(ageText) > 120)) {
      wx.showToast({ title: "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u5e74\u9f84", icon: "none" });
      return;
    }

    if (!wx.cloud || !wx.cloud.database) {
      wx.showModal({
        title: "\u65e0\u6cd5\u63d0\u4ea4",
        content: "\u5f53\u524d\u73af\u5883\u672a\u542f\u7528\u4e91\u5f00\u53d1\uff0c\u8bf7\u68c0\u67e5\u57fa\u7840\u5e93\u7248\u672c\u3002",
        showCancel: false
      });
      return;
    }

    const db = wx.cloud.database();
    const gender = this.data.genderOptions[this.data.genderIndex] || "";

    const payload = {
      name,
      nickName: name,
      phone,
      gender,
      role: "member",
      status: "pending",
      createdAt: db.serverDate()
    };

    if (unit) payload.unit = unit;
    if (ageText) payload.age = Number(ageText);
    if (remark) payload.remark = remark;

    this.setData({ submitting: true });

    try {
      await db.collection("users").add({ data: payload });

      wx.setStorageSync("userInfo", {
        nickName: name,
        unit: unit || "\u94f6\u53d1\u4eba\u624d\u5e73\u53f0",
        phone,
        gender,
        role: "member"
      });

      wx.showToast({ title: "\u63d0\u4ea4\u6210\u529f", icon: "success" });
      setTimeout(() => {
        wx.navigateBack();
      }, 1200);
    } catch (err) {
      wx.showModal({
        title: "\u63d0\u4ea4\u5931\u8d25",
        content: (err && err.message) || "\u8bf7\u7a0d\u540e\u91cd\u8bd5",
        showCancel: false
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});