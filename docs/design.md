## 场景
从服务器通过一个接口获取省市区列表数据，结构为：
```js
const result = [
  {
    children: [
      {
        id: 125,
        level: 2,
        name: "东城区",
        number: "00125"
      }
    ],
    id: 123,
    level: 1,
    name: "北京市",
    number: "00123"
  },
  {
    id: 1,
    level: 1,
    name: "安徽省",
    number: "001",
    children: [
      {
        id: 2,
        level: 2,
        name: "合肥市",
        number: "002",
        children: [
          {
            id: 3,
            level: 3,
            name: "瑶海区",
            number: "003"
          }
        ]
      }
    ]
  }
]
```

像直辖市（北京）只有两层结构，要统一为三层结构。

1. 首先要知道哪些数据为二层结构，如何判断?
```js
!data.children[0].children && data.children[0].level === 2
```

2. 将二层结构补充为三层结构
这就像一个链表的问题
```js
const result = [
  {
    children: [
      {
        id: 125,
        level: 2,
        name: "东城区",
        number: "00125"
      }
    ],
    id: 123,
    level: 1,
    name: "北京市",
    number: "00123"
  }
]

const city = result[0]

const province = {...city, children: city}
```

3. 设计一个查询器
根据省的 code 查询到市
根据市的 code 查询到区

可以很方便的获取省列表。

如何单独的根据省的 number 获取到市列表，根据市的 number 获取到区的列表呢?

Map(), 主要用于存储 市 number 对应的市数据, 进而查到区列表

```js
{
  002: {
        id: 2,
        level: 2,
        name: "合肥市",
        number: "002",
        children: [
          {
            id: 3,
            level: 3,
            name: "瑶海区",
            number: "003"
          }
        ]
      }
}
```
