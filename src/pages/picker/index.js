import list from '../../mock/list';

Page({
  data: {
    list,
    visible: false,
    value: ''
  },
  switchHandle() {
    this.setData({
      visible: true
    });
  },
  confirmHandle(e) {
    console.log(e);
    this.setData({
      visible: false
    });
  },
  cancelHandle() {
    this.setData({
      visible: false
    });
  },
  changeHandle(e) {
    console.log(e);
    const value = e.detail.map(_ => _.name).join('-');
    this.setData({
      value
    });
  }
});
