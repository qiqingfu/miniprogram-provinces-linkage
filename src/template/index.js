import { createStore } from './store';
import { getFields } from './util';

const conf = {
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
    /**
     * value [0, 0, 0], 分别对应选中的省市区下标
     */
    const currentValue = e.detail.value;
    const self = _getCurrentPage();
    /**
     * cv0 省
     * cv1 市
     * cv2 区
     */
    const cv0 = currentValue[ 0 ];
    const cv1 = currentValue[ 1 ];
    const cv2 = currentValue[ 2 ];
    const hideDistrict = self.config.hideDistrict;
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
      : value[ 0 ] !== cv0 && value[ 1 ] === cv1 && value[ 2 ] === cv2; // 只看这段

    /**
      * 市 picker-view-column 被滑动了
      */
    const cityCondition = hideDistrict
      ? value[ 0 ] === cv0 && value[ 1 ] !== cv1
      : value[ 0 ] === cv0 && value[ 1 ] !== cv1 && value[ 2 ] === cv2; // 只看这段

      /**
       * 区 picker-view-column 被滑动了
       */
    const districtCondition = hideDistrict
      ? false
      : value[ 0 ] === cv0 && value[ 1 ] === cv1 && value[ 2 ] !== cv2; // 只看这段

    /**
     * 如果省被滑动了，那么要重新获取市、区的数据
     * cv0 为省滑动到的下标，从 provinceData 省列表项中根据下标匹配到对应的省，获取到省 number
     */
    if (provinceCondition) {
      const city = self.store.findCity(provinceData[cv0].number);
      const firstCity = city[0];
      const cityDataWithDot = conf.addDot(city);

      if (city && city.length) {
        self.setData({
          'areaPicker.cityData': cityDataWithDot,
        });

        const district = self.store.findDistrict(firstCity.number);
        const firstDistrict = district[0];
        const districtDataWithDot = conf.addDot(district);

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
            'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + firstCity.name,
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
      const district = self.store.findDistrict(cityData[cv1].number);
      const districtDataWithDot = conf.addDot(district);

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
  }
};

function _getCurrentPage() {
  const pages = getCurrentPages();
  const last = pages.length - 1;
  return pages[ last ];
}

export const getSelectedAreaData = () => {
  const self = _getCurrentPage();
  return self.data.areaPicker.selected;
};

/**
 * 暴露一个初始化方法，在使用 template 模板文件的 onShow 生命周期钩子
 * 中调用，并且支持 hideDistrict 选项配置
 */
export default (config = {}) => {
  /**
   * 获取当前页面实例
   */
  const self = _getCurrentPage();
  /**
   * 向 areaPicker 对象设置是否隐藏 "区" 选项
   */
  self.setData({
    'areaPicker.hideDistrict': !config.hideDistrict
  });
  /**
   * 将 config 绑定到当前页面实例对象上
   * 给当前页面绑定 bindChange 事件处理函数
   */
  self.config = config;
  self.bindChange = conf.bindChange.bind(self);

  const data = config.data;
  if (!data) {
    throw new Error('初始化：必须传入原始数据源 data');
  }

  self.store = createStore(data);

  const province = self.store.findProvince();
  const firstProvince = province[0];
  const provinceDataWithDot = conf.addDot(province);
  console.log('firstProvince =>', firstProvince);

  self.setData({
    'areaPicker.provinceData': provinceDataWithDot,
    'areaPicker.selectedProvince.index': 0,
    'areaPicker.selectedProvince.code': firstProvince.number,
    'areaPicker.selectedProvince.fullName': firstProvince.name,
  });

  const city = self.store.findCity(firstProvince.number);
  const firstCity = city[0];
  const cityDataWithDot = conf.addDot(city);
  console.log('firstCity =>', firstCity);

  self.setData({
    'areaPicker.cityData': cityDataWithDot,
    'areaPicker.selectedCity.index': 0,
    'areaPicker.selectedCity.code': firstCity.number,
    'areaPicker.selectedCity.fullName': firstCity.name,
  });

  if (!config.hideDistrict) {
    const district = self.store.findDistrict(firstCity.number);
    const firstDistrict = district[0];
    const districtDataWithDot = conf.addDot(district);
    console.log('firstDistrict =>', firstDistrict);

    /**
     * 对处理区或县时，获取省列表和市列表数据
     */
    const { provinceData, cityData } = self.data.areaPicker;
    self.setData({
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

    console.log(self.data);
  } else {
    /**
     * 不请求区数据处理
     */
    const { provinceData, cityData } = self.data.areaPicker;
    self.setData({
      'areaPicker.value': [ 0, 0 ],
      'areaPicker.address': provinceData[ 0 ].name + ' - ' + cityData[ 0 ].name,
      'areaPicker.selected': [ provinceData[ 0 ], cityData[ 0 ] ]
    });
  }
};
