const s = new Set([1, 2, 3]);
const p = new Proxy(s, {
  get(target, property, receiver) {
    // 修复报错
    if (property === 'size') {
      return Reflect.get(target, property, target);
    } else {
      return Reflect.get(target, property, receiver);
    }
  },
});

console.log(p.size); // 报错 TypeError: Method get Set.prototype.size called on incompatible receiver
