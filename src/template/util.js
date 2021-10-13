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

export const find = (list, f) => {
  return list.filter(f)[0];
};
