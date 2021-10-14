import { LEVEL_DEP } from './constant';

const viKey = Symbol('virtualIdentity');
const virtualIdentity = { [viKey]: true };

/**
 * 仅支持两层结构层级的校验
 * @param {*} data
 * @param {*} dep
 */
const getLayerDepth = (data) => {
  return !data.children && data.level === LEVEL_DEP.ONE
    ? LEVEL_DEP.ONE
    : !data.children[ 0 ].children &&
       data.children[ 0 ].level === LEVEL_DEP.TWO
      ? LEVEL_DEP.TWO
      : LEVEL_DEP.DEFAULT;
};

const packsMaps = {
  [LEVEL_DEP.ONE](data) {
    const packData = { ...data, ...virtualIdentity, children: [{ ...data, level: LEVEL_DEP.TWO }] };
    return this[LEVEL_DEP.TWO](packData);
  },
  [LEVEL_DEP.TWO](data) {
    const children = data.children.map((_) => ({ ..._, level: LEVEL_DEP.DEFAULT }));
    return { ...data, ...virtualIdentity, children: [{ ...data, level: LEVEL_DEP.TWO, children }] };
  },
  [LEVEL_DEP.DEFAULT](data) {
    return data;
  }
};

export const pack = data => {
  const depIndex = getLayerDepth(data);
  return packsMaps[depIndex](data);
};

export const isArray = Array.isArray;

export const isObject = (obj) => obj !== null && typeof obj === 'object';

export const find = (list, f) => {
  return list.filter(f)[0];
};

export const getFields = (data, keys = ['number', 'name', 'level']) => {
  let result;

  if (isArray(data)) {
    result = [];
    data.forEach((_) => {
      result.push(getFields(_));
    });
  } else if (isObject(data)) {
    result = {};
    keys.forEach((_) => {
      result[_] = data[_];
    });
  }

  return result;
};
