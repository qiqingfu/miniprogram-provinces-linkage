import { isArray, isLayerTwo, pack, find } from './util';

const db = {
  data: [],
  $$map: new Map(),
  /**
   * 查询省列表
   */
  findProvince() {
    return this.data.map(_ => ({..._, children: null}));
  },
  /**
   * 省数据的 number | code
   * @param {number} number
   */
  findCity(number) {
    return find(this.data, _ => _.number === number).children;
  },
  /**
   * 市列表的 number | code
   * @param {number} number
   */
  findDistrict(number) {
    return this.$$map.get(number).children;
  }
};

function createMap(db) {
  db.data.forEach(s1 => {
    s1.children.forEach(s2 => {
      db.$$map.set(s2.number, s2);
    });
  });
}

export const createStore = (data) => {
  if (!isArray(data)) {
    throw new Error(`类型错误：期望值的类型为 Array，结果是${typeof data}`);
  }

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (isLayerTwo(val)) {
      db.data[i] = pack(val);
    } else {
      db.data[i] = val;
    }
  }

  createMap(db);

  return Object.freeze(db);
};
