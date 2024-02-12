// 这个是重看书本时重新实现
// 用全局函数存副作用函数，从而避免硬编码副作用函数

/**
  已解决
  存在的问题：依赖项失效后，修改依赖项仍然会触发副作用函数
  解决方案，每次执行副作用函数的时候，将与之关联的依赖集合删除，然后执行副作用函数的时候又会重新建立联系，这时失效的依赖项就和副作用函数没有联系了

  -》执行副作用函数的时，要找到与之关联的依赖集合
 */
/**
  存在的问题：effect发生嵌套时，如果嵌套的effect执行后，再执行在外层的effect的依赖收集，此时activeEffect指向的仍然是嵌套的effect，导致依赖收集到错误的effect内
 */
const effectStack = [];

const cleanup = (effectFn) => {
  if (effectFn.depsList) {
    effectFn.depsList.forEach((deps) => {
      if (deps.has(effectFn)) {
        deps.delete(effectFn);
      }
    });
    effectFn.depsList.clear();
  }
};
// 用来注册副作用函数
export const effect = (fn) => {
  const effectFn = () => {
    cleanup(effectFn);
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
  };
  effectFn();
};

const bucket = new WeakMap();

function track(target, key, receiver) {
  const activeEffect = effectStack[effectStack.length - 1];
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
    if (!activeEffect.depsList) {
      activeEffect.depsList = new Set();
    }
    activeEffect.depsList.add(deps);
  }
}

function trigger(target, key, value, receiver) {
  const depsMap = bucket.get(target);
  if (depsMap) {
    const deps = depsMap.get(key);
    if (deps) {
      // 避免无限循环
      const effects = new Set(deps);
      effects.forEach((effect) => {
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
