const list = [
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
      },
      {
        id: 12,
        level: 2,
        name: '芜湖市',
        number: '0012',
        children: [
          {
            id: 13,
            level: 3,
            name: '镜湖区',
            number: '0013'
          }
        ]
      }
    ]
  }
];

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
