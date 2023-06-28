/**
 * 当前分支切换会产生遗留的副作用函数，下面的目标就是处理因为遗留副作用函数导致的不必要的副作用函数执行
 */
let activeEffect;
function cleanup(effectFn) {
  const deps = effectFn.deps;
  deps.forEach((effects) => {
    effects.delete(effectFn);
  });
  deps.length = 0;
}
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
    activeEffect = null;
  };
  // 重置数组
  effectFn.deps = [];
  effectFn();
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
  activeEffect.deps.push(deps);
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
  // 避免无限循环
  const effects = new Set(deps);
  effects.forEach((fn) => fn());
}

// 执行副作用函数，触发getter
effect(() => {
  console.log('--effect1--');
  document.body.innerText = obj.ok ? obj.text : 'not';
});

setTimeout(() => {
  obj.ok = false;
  setTimeout(() => {
    console.log('----');
    obj.text = '修改也不会触发副作用';
  }, 1000);
}, 1000);
