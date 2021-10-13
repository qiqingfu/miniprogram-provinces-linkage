import initAreaPicker, { getSelectedAreaData } from '../../template/index';

const data = [
  {
    children: [
      {
        id: 125,
        level: 2,
        name: '东城区',
        number: '00125'
      }
    ],
    id: 123,
    level: 1,
    name: '北京市',
    number: '00123'
  },
  {
    id: 1,
    level: 1,
    name: '安徽省',
    number: '001',
    children: [
      {
        id: 2,
        level: 2,
        name: '合肥市',
        number: '002',
        children: [
          {
            id: 3,
            level: 3,
            name: '瑶海区',
            number: '003'
          }
        ]
      }
    ]
  }
];

Page({
  onShow: () => {
    /**
     * 在初始函数时，会定义当前页面的 areaPicker 数据属性
     */
    initAreaPicker({
      data
      // hideDistrict: true, // 是否隐藏区县选择栏，默认显示
    });
  },
  getSelecedData() {
    console.table(getSelectedAreaData());
  }
});
