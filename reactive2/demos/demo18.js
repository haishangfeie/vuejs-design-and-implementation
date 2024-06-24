const s = new Set([1, 2, 3]);
const p = new Proxy(s, {
  get(target, key, receiver) {
    if (key === 'size') {
      return Reflect.get(target, key, target);
    }
    // 读取其他属性的默认行为
    // return Reflect.get(target, key, receiver);
    // 解决报错
    return target[key].bind(target);
  },
});

// 调用 delete 方法删除值为 1 的元素
// 会得到错误 TypeError: Method Set.prototype.delete called on incompatible receiver [object Object]
p.delete(1);
