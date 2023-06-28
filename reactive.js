/**
 * 当前分支切换会产生遗留的副作用函数，下面的目标就是处理因为遗留副作用函数导致的不必要的副作用函数执行
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
  ok: true,
};
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});

function track(target, key) {
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
}

function trigger(target, key) {
  const targetMap = bucket.get(target);
  if (!targetMap) {
    return;
  }
  const deps = targetMap.get(key);
  if (!deps) {
    return;
  }
  deps.forEach((fn) => fn());
}

// 执行副作用函数，触发getter
effect(() => {
  console.log('--effect1--');
  document.body.innerText = obj.ok ? obj.text : 'not';
});

setTimeout(() => {
  obj.ok = false;
  setTimeout(() => {
    obj.text = 'hhh';
  }, 1000);
}, 1000);
