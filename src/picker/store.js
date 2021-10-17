import { isArray, pack, find, cacheFindResult } from './util';

const globalWrapperData = {
  data: [],
  $$map: new Map()
};

const query = {
  /**
   * 查询省列表
   */
  findProvince() {
    return globalWrapperData.data.map(province => ({...province, children: null}));
  },
  /**
   * 省数据的 number | code
   * @param {number} number
   */
  findCity: cacheFindResult((number) => {
    return find(globalWrapperData.data, city => city.number === number).children;
  }),
  /**
   * 市列表的 number | code
   * @param {number} number
   */
  findDistrict: cacheFindResult((number) => {
    return globalWrapperData.$$map.get(number).children;
  })
};

export const createQuery = (data) => {
  if (!isArray(data)) {
    throw new Error(`类型错误：期望值的类型为 Array，结果是${typeof data}`);
  }
  data.forEach((a, b) => { globalWrapperData.data[ b ] = pack(a) });

  createMap();

  return query;
};

function createMap() {
  globalWrapperData.data.forEach(s1 => {
    s1.children.forEach(s2 => {
      globalWrapperData.$$map.set(s2.number, s2);
    });
  });
}
