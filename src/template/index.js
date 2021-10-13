import { apiUrl } from '../config/index';

const defaultOptions = {
  method: 'GET'
};

/**
 * wx.request 网络请求的简易封装, 这块封装很有意思
 * @param {function} fun 接口
 * @param {object} options 接口参数
 * @returns {Promise} Promise对象
 */
function fetch(url) {
  let options = {};
  options.url = url;
  return new Promise((resolve, reject) => {
    options.success = resolve;
    options.fail = reject;
    wx.request({...defaultOptions, ...options});
  });
}

const conf = {
  /**
   * 对省、市、区 字段过长处理
   * @param {string[]} arr
   */
  addDot: function(arr) {
    if (arr instanceof Array) {
      const tmp = arr.slice();
      tmp.map(val => {
        if (val.fullName.length > 4) {
          val.fullNameDot = val.fullName.slice(0, 4) + '...';
        } else {
          val.fullNameDot = val.fullName;
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
    console.log(e);
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
    const { value, provinceData } = this.data.areaPicker;

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
     */
    if (provinceCondition) {
      // 滑动省份
      fetch(apiUrl + provinceData[ cv0 ].code).then((city) => {
        const cityData = city.data.result;
        if (cityData && cityData.length) {
          const dataWithDot = conf.addDot(city.data.result);
          this.setData({
            'areaPicker.cityData': dataWithDot
          });
          return fetch(apiUrl + dataWithDot[ 0 ].code);
        } else {
          this.setData({
            'areaPicker.cityData': [],
            'areaPicker.districtData': [],
            'areaPicker.address': provinceData[ cv0 ].fullName,
            'areaPicker.selected': [ provinceData[ cv0 ] ],
          });
        }
      }).then((district) => {
        const districtData = district.data.result;
        const { cityData } = this.data.areaPicker;
        if (districtData && districtData.length > 0) {
          const dataWithDot = conf.addDot(districtData);
          this.setData({
            'areaPicker.districtData': dataWithDot,
            'areaPicker.value': [ cv0, 0, 0 ],
            'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + cityData[ 0 ].fullName + (hideDistrict ? '' : ' - ' + dataWithDot[ 0 ].fullName),
            'areaPicker.selected': hideDistrict ? [ provinceData[ cv0 ], cityData[ 0 ] ] : [ provinceData[ cv0 ], cityData[ 0 ], dataWithDot[ 0 ] ]
          });
        } else {
          this.setData({
            'areaPicker.districtData': [],
            'areaPicker.value': [ cv0, cv1, 0 ],
            'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + cityData[ 0 ].fullName,
            'areaPicker.selected': [ provinceData[ cv0 ], cityData[ 0 ] ]
          });
        }
      }).catch((e) => {
        console.error(e);
      });
    } else if (cityCondition) {
      /**
       * 市被滑动了，要重新获取区的数据
       */
      const { provinceData, cityData } = this.data.areaPicker;
      // 滑动城市
      fetch(apiUrl + cityData[ cv1 ].code).then((district) => {
        if (!district) return;
        const districtData = district.data.result;
        if (districtData && districtData.length > 0) {
          const dataWithDot = conf.addDot(districtData);
          this.setData({
            'areaPicker.districtData': dataWithDot,
            'areaPicker.value': [ cv0, cv1, 0 ],
            'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + cityData[ cv1 ].fullName + (hideDistrict ? '' : ' - ' + dataWithDot[ 0 ].fullName),
            'areaPicker.selected': hideDistrict ? [ provinceData[ cv0 ], cityData[ cv1 ] ] : [ provinceData[ cv0 ], cityData[ cv1 ], dataWithDot[ 0 ] ]
          });
        } else {
          this.setData({
            'areaPicker.districtData': [],
            'areaPicker.value': [ cv0, cv1, 0 ],
            'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + cityData[ cv1 ].fullName,
            'areaPicker.selected': [ provinceData[ cv0 ], cityData[ cv1 ] ]
          });
        }
      }).catch((e) => {
        console.error(e);
      });
    } else if (districtCondition) {
      /**
       * 仅仅滑动区，不会再发送接口
       */
      const { cityData, districtData } = this.data.areaPicker;
      this.setData({
        'areaPicker.value': currentValue,
        'areaPicker.address': provinceData[ cv0 ].fullName + ' - ' + cityData[ cv1 ].fullName + (hideDistrict ? '' : ' - ' + districtData[ cv2 ].fullName),
        'areaPicker.selected': hideDistrict ? [ provinceData[ cv0 ], cityData[ cv1 ] ] : [ provinceData[ cv0 ], cityData[ cv1 ], districtData[ cv2 ] ]
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

  /**
   * 获取省市区数据
   */
  fetch(apiUrl + '0').then((province) => {
    const firstProvince = province.data.result[ 0 ];
    const dataWithDot = conf.addDot(province.data.result);
    /**
		 * 默认选择获取的省份第一个省份数据
		 */
    self.setData({
      'areaPicker.provinceData': dataWithDot,
      'areaPicker.selectedProvince.index': 0,
      'areaPicker.selectedProvince.code': firstProvince.code,
      'areaPicker.selectedProvince.fullName': firstProvince.fullName,
    });
    /**
     * 根据省 code 获取市列表数据
     */
    return fetch(apiUrl + firstProvince.code);
  }).then((city) => {
    const firstCity = city.data.result[ 0 ];
    const dataWithDot = conf.addDot(city.data.result);
    self.setData({
      'areaPicker.cityData': dataWithDot,
      'areaPicker.selectedCity.index': 0,
      'areaPicker.selectedCity.code': firstCity.code,
      'areaPicker.selectedCity.fullName': firstCity.fullName,
    });
    /**
		 * 省市二级则不请求区域
     *
     * hideDistrict 为 true 则不请求区数据
		 */
    if (!config.hideDistrict) {
      /**
       * 根据选中市的 code 获取区数据
       */
      return fetch(apiUrl + firstCity.code);
    } else {
      /**
       * 不请求区数据处理
       */
      const { provinceData, cityData } = self.data.areaPicker;
      self.setData({
        'areaPicker.value': [ 0, 0 ],
        'areaPicker.address': provinceData[ 0 ].fullName + ' - ' + cityData[ 0 ].fullName,
        'areaPicker.selected': [ provinceData[ 0 ], cityData[ 0 ] ]
      });
    }
  }).then((district) => {
    if (!district) return;
    console.log('district =>', district);
    const firstDistrict = district.data.result[ 0 ];
    const dataWithDot = conf.addDot(district.data.result);
    /**
     * 对处理区或县时，获取省列表和市列表数据
     */
    const { provinceData, cityData } = self.data.areaPicker;
    self.setData({
      /**
       * 表示 picker-view 内的 picker-view-column 选择的第几项（下标从0开始）
       */
      'areaPicker.value': [ 0, 0, 0 ],
      'areaPicker.districtData': dataWithDot,
      'areaPicker.selectedDistrict.index': 0,
      'areaPicker.selectedDistrict.code': firstDistrict.code,
      'areaPicker.selectedDistrict.fullName': firstDistrict.fullName,
      'areaPicker.address': provinceData[ 0 ].fullName + ' - ' + cityData[ 0 ].fullName + ' - ' + firstDistrict.fullName,
      'areaPicker.selected': [ provinceData[ 0 ], cityData[ 0 ], firstDistrict ]
    });
  }).catch((e) => {
    console.error(e);
  });
};
