import initAreaPicker, { getSelectedAreaData } from '../../template/index';

Page({
  onShow: () => {
    /**
     * 在初始函数时，会定义当前页面的 areaPicker 数据属性
     */
    initAreaPicker({
      // hideDistrict: true, // 是否隐藏区县选择栏，默认显示
    });
  },
  getSelecedData() {
    console.table(getSelectedAreaData());
  }
});
