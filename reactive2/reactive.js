// 这个是重看书本时重新实现
// 用全局函数存副作用函数，从而避免硬编码副作用函数

let activeEffect;

// 用来注册副作用函数
export const effect = (fn) => {
  activeEffect = fn;
  fn();
};

const bucket = new WeakMap();

function track(target, key, receiver) {
  if (activeEffect) {
    if (!bucket.has(target)) {
      bucket.set(target, new Map());
    }
    const depsMap = bucket.get(target);
    if (!depsMap.has(key)) {
      depsMap.set(key, new Set());
    }
    const deps = depsMap.get(key);
    deps.add(activeEffect);
  }
}

function trigger(target, key, value, receiver) {
  const depsMap = bucket.get(target);
  if (depsMap) {
    const deps = depsMap.get(key);
    if (deps) {
      deps.forEach((effect) => {
        effect();
      });
    }
  }
}

export const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key, receiver);
      return target[key];
    },
    set(target, key, value, receiver) {
      target[key] = value;
      trigger(target, key, value, receiver);
      return true;
    },
  });
};
