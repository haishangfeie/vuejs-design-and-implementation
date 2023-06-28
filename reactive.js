/**
 * 希望只在对应属性改变时才触发响应式
 */
let activeEffect;
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
const bucket = new WeakMap();
const data = {
  text: 'hello world',
  text2: 'text2',
};
const obj = new Proxy(data, {
  get(target, key) {
    if (!activeEffect) {
      return target[key];
    }
    if (!bucket.has(target)) {
      bucket.set(target, new Map());
    }
    const targetMap = bucket.get(target);
    if (!targetMap.has(key)) {
      targetMap.set(key, new Set());
    }
    const deps = targetMap.get(key);
    deps.add(activeEffect);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    const targetMap = bucket.get(target);
    if (!targetMap) {
      return;
    }
    const deps = targetMap.get(key);
    if (!deps) {
      return;
    }
    deps.forEach((fn) => fn());
  },
});

// 执行副作用函数，触发getter
effect(() => {
  console.log('--effect1--');
  document.body.innerText = obj.text;
});
effect(() => {
  console.log('--effect2--');
  console.log('obj.text2', obj.text2);
});
setTimeout(() => {
  obj.text = 'hello vue';
  // obj.other = 'hhh';
}, 1000);
