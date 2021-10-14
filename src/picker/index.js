import { createStore } from './store';
import { getFields } from './util';

const EVENTS = {
  CHANGE: 'change',
  CONFIRM: 'confirm'
};

Component({
  properties: {
    list: {
      type: Object,
      value: () => [],
    },
    hideDistrict: {
      type: Boolean,
      value: false
    },
    visible: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    cancel() {
      this.triggerEvent('cancel');
    },
    confirm() {
      this.trigger(EVENTS.CONFIRM);
    },
    getSelectedAreaData () {
      return this.data.areaPicker.selected;
    },
    /**
     * 对省、市、区 字段过长处理
     * @param {string[]} arr
     */
    addDot: function(arr) {
      if (arr instanceof Array) {
        const tmp = arr.slice();
        tmp.map(val => {
          if (val.name.length > 4) {
            val.nameDot = val.name.slice(0, 4) + '...';
          } else {
            val.nameDot = val.name;
          }
        });
        return tmp;
      }
    },
    /**
     * 滑动事件
     * @param {object} e 事件对象
     */
    bindChange: function(e) {
      const { hideDistrict } = this.data;
      /**
       * value [0, 0, 0], 分别对应选中的省市区下标
       */
      const currentValue = e.detail.value;
      /**
       * cv0 省
       * cv1 市
       * cv2 区
       */
      const cv0 = currentValue[ 0 ];
      const cv1 = currentValue[ 1 ];
      const cv2 = currentValue[ 2 ];
      /**
       * 获取 value, picker-view-column 选择的第几项
       * provinceData 省的列表数据
       */
      const { value, provinceData, cityData, districtData } = this.data.areaPicker;

      /**
       * 这是一段什么算法逻辑
       * hideDistrict 为 true 时，不显示区
       *
       * 应该是校验省、市、区哪项被改动了
       *
       * 省 picker-view-column 被滑动了
       */
      const provinceCondition = hideDistrict
        ? value[ 0 ] !== cv0 && value[ 1 ] === cv1
        : value[ 0 ] !== cv0 && value[ 1 ] === cv1 && value[ 2 ] === cv2;

      /**
       * 市 picker-view-column 被滑动了
       */
      const cityCondition = hideDistrict
        ? value[ 0 ] === cv0 && value[ 1 ] !== cv1
        : value[ 0 ] === cv0 && value[ 1 ] !== cv1 && value[ 2 ] === cv2;

      /**
       * 区 picker-view-column 被滑动了
       */
      const districtCondition = hideDistrict
        ? false
        : value[ 0 ] === cv0 && value[ 1 ] === cv1 && value[ 2 ] !== cv2;

      /**
       * 如果省被滑动了，那么要重新获取市、区的数据
       * cv0 为省滑动到的下标，从 provinceData 省列表项中根据下标匹配到对应的省，获取到省 number
       */
      if (provinceCondition) {
        const city = this.store.findCity(provinceData[cv0].number);
        const firstCity = city[0];
        const cityDataWithDot = this.addDot(city);

        if (city && city.length) {
          this.setData({
            'areaPicker.cityData': cityDataWithDot,
          });

          const district = this.store.findDistrict(firstCity.number);
          const firstDistrict = district[0];
          const districtDataWithDot = this.addDot(district);

          if (district && district.length) {
            this.setData({
              'areaPicker.districtData': districtDataWithDot,
              'areaPicker.value': [ cv0, 0, 0 ],
              'areaPicker.address': provinceData[ cv0 ].name + ' - ' + firstCity.name + (hideDistrict ? '' : ' - ' + firstDistrict.name),
              'areaPicker.selected': hideDistrict ? getFields([ provinceData[ cv0 ], firstCity ]) : getFields([ provinceData[ cv0 ], firstCity, firstDistrict ])
            });
          } else {
            this.setData({
              'areaPicker.districtData': [],
              'areaPicker.value': [ cv0, cv1, 0 ],
              'areaPicker.address': provinceData[ cv0 ].name + ' - ' + firstCity.name,
              'areaPicker.selected': getFields([ provinceData[ cv0 ], firstCity ])
            });
          }
        } else {
          /**
           * 当省下面不存在市的情况
           */
          this.setData({
            'areaPicker.cityData': [],
            'areaPicker.districtData': [],
            'areaPicker.address': provinceData[ cv0 ].name,
            'areaPicker.selected': getFields([ provinceData[ cv0 ] ]),
          });
        }
      } else if (cityCondition) {
        /**
         * 市被滑动了，要重新获取区的数据
         */
        const district = this.store.findDistrict(cityData[cv1].number);
        const districtDataWithDot = this.addDot(district);

        if (!district) return;

        if (district && district.length) {
          this.setData({
            'areaPicker.districtData': districtDataWithDot,
            'areaPicker.value': [ cv0, cv1, 0 ],
            'areaPicker.address': provinceData[ cv0 ].name + ' - ' + cityData[ cv1 ].name + (hideDistrict ? '' : ' - ' + districtDataWithDot[ 0 ].name),
            'areaPicker.selected': hideDistrict ? getFields([ provinceData[ cv0 ], cityData[ cv1 ] ]) : getFields([ provinceData[ cv0 ], cityData[ cv1 ], districtDataWithDot[ 0 ] ])
          });
        } else {
          this.setData({
            'areaPicker.districtData': [],
            'areaPicker.value': [ cv0, cv1, 0 ],
            'areaPicker.address': provinceData[ cv0 ].name + ' - ' + cityData[ cv1 ].name,
            'areaPicker.selected': getFields([ provinceData[ cv0 ], cityData[ cv1 ] ])
          });
        }
      } else if (districtCondition) {
        /**
         * 仅仅滑动区，不会再发送接口
         */
        this.setData({
          'areaPicker.value': currentValue,
          'areaPicker.address': provinceData[ cv0 ].name + ' - ' + cityData[ cv1 ].name + (hideDistrict ? '' : ' - ' + districtData[ cv2 ].name),
          'areaPicker.selected': hideDistrict ? getFields([ provinceData[ cv0 ], cityData[ cv1 ] ]) : getFields([ provinceData[ cv0 ], cityData[ cv1 ], districtData[ cv2 ] ])
        });
      }

      this.trigger(EVENTS.CHANGE);
    },
    trigger(eventName) {
      const data = this.getSelectedAreaData();
      this.triggerEvent(eventName, data);
    },
    init() {
      const { hideDistrict, list: data } = this.data;
      this.setData({
        'areaPicker.hideDistrict': !hideDistrict
      });

      if (!data) {
        throw new Error('初始化：必须传入原始数据源 data');
      }

      this.store = createStore(data);

      const province = this.store.findProvince();
      const firstProvince = province[0];
      const provinceDataWithDot = this.addDot(province);

      this.setData({
        'areaPicker.provinceData': provinceDataWithDot,
        'areaPicker.selectedProvince.index': 0,
        'areaPicker.selectedProvince.code': firstProvince.number,
        'areaPicker.selectedProvince.fullName': firstProvince.name,
      });

      const city = this.store.findCity(firstProvince.number);
      const firstCity = city[0];
      const cityDataWithDot = this.addDot(city);

      this.setData({
        'areaPicker.cityData': cityDataWithDot,
        'areaPicker.selectedCity.index': 0,
        'areaPicker.selectedCity.code': firstCity.number,
        'areaPicker.selectedCity.fullName': firstCity.name,
      });

      if (!hideDistrict) {
        const district = this.store.findDistrict(firstCity.number);
        const firstDistrict = district[0];
        const districtDataWithDot = this.addDot(district);

        /**
         * 对处理区或县时，获取省列表和市列表数据
         */
        const { provinceData, cityData } = this.data.areaPicker;

        this.setData({
          /**
           * 表示 picker-view 内的 picker-view-column 选择的第几项（下标从0开始）
           */
          'areaPicker.value': [ 0, 0, 0 ],
          'areaPicker.districtData': districtDataWithDot,
          'areaPicker.selectedDistrict.index': 0,
          'areaPicker.selectedDistrict.code': firstDistrict.number,
          'areaPicker.selectedDistrict.fullName': firstDistrict.name,
          'areaPicker.address': provinceData[0].name + ' - ' + cityData[0].name + ' - ' + firstDistrict.name,
          'areaPicker.selected': [ ...getFields([provinceData[0], cityData[0], firstDistrict]) ]
        });
      } else {
        /**
         * 不请求区数据处理
         */
        const { provinceData, cityData } = this.data.areaPicker;
        this.setData({
          'areaPicker.value': [ 0, 0 ],
          'areaPicker.address': provinceData[ 0 ].name + ' - ' + cityData[ 0 ].name,
          'areaPicker.selected': [ provinceData[ 0 ], cityData[ 0 ] ]
        });
      }
    },
  },
  data: {
    areaPicker: {}
  },
  lifetimes: {
    attached() {
      this.init();
    }
  },
  observers: {
    visible(visible) {
      if (visible) {
        this.trigger(EVENTS.CHANGE);
      }
    }
  }
});
