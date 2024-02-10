// 这个是重看书本时重新实现
// 用全局函数存副作用函数，从而避免硬编码副作用函数
let activeEffect;

// 用来注册副作用函数
export const effect = (fn) => {
  activeEffect = fn;
  fn();
};

const bucket = new WeakMap();

export const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (activeEffect) {
        if (!bucket.has(target)) {
          bucket.set(target, new Map());
        }
        const targetMap = bucket.get(target);
        if (!targetMap.has(key)) {
          targetMap.set(key, new Set());
        }
        const effects = targetMap.get(key);
        effects.add(activeEffect);
      }
      return target[key];
    },
    set(target, key, value, receiver) {
      target[key] = value;
      const targetMap = bucket.get(target);
      if (targetMap) {
        const effects = targetMap.get(key);
        if (effects) {
          effects.forEach((effect) => {
            effect();
          });
        }
      }
      return true;
    },
  });
};
