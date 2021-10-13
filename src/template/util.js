/**
 *
 * @param {*} data
 */
export const isLayerTwo = (data) => {
  const len = data.children.length;
  return !data.children[0].children &&
  !data.children[len - 1].children &&
  data.children[0].level === 2 &&
  data.children[len - 1].level === 2;
};

/**
 * @param {*} data
 */
export const pack = (data) => {
  const children = data.children.map(child => ({...child, level: 3}));
  return {...data, _virtual: true, children: [{...data, level: 2, children}]};
};

export const isArray = Array.isArray;

export const isObject = obj => obj !== null && typeof obj === 'object';

export const find = (list, f) => {
  return list.filter(f)[0];
};

export const getFields = (data, keys = ['number', 'name', 'level']) => {
  let result;

  if (isArray(data)) {
    result = [];
    data.forEach(_ => {
      result.push(getFields(_));
    });
  } else if (isObject(data)) {
    result = {};
    keys.forEach(_ => { result[_] = data[_] });
  }

  return result;
};
