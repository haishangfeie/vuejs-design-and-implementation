// 这个是重看书本时重新实现
// 用全局函数存副作用函数，从而避免硬编码副作用函数

/**
  已解决
  存在的问题：依赖项失效后，修改依赖项仍然会触发副作用函数
  解决方案，每次执行副作用函数的时候，将与之关联的依赖集合删除，然后执行副作用函数的时候又会重新建立联系，这时失效的依赖项就和副作用函数没有联系了

  -》执行副作用函数的时，要找到与之关联的依赖集合
 */
/**
  已解决
  存在的问题：effect发生嵌套时，如果嵌套的effect执行后，再执行在外层的effect的依赖收集，此时activeEffect指向的仍然是嵌套的effect，导致依赖收集到错误的effect内
 */
/**
  已解决
  存在问题：
  当在副作用函数内发生读取，又赋值的操作，会导致追踪依赖收集，然后又在赋值时触发副作用函数，导致副作用函数不断的递归调用自身
 */
/* 
  已实现
  功能：副作用函数支持调度执行
  调度执行：即控制副作用函数执行的时机&次数&方式
*/
/* 
  功能：添加lazy，不立即执行副作用函数，而是手动执行
*/
/* 
  功能：利用effect和option.scheduler可以实现watch
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
export const effect = (fn, options = {}) => {
  const effectFn = () => {
    cleanup(effectFn);
    effectStack.push(effectFn);
    const value = fn();
    effectStack.pop();
    return value;
  };
  effectFn.options = options;
  if (options.lazy) {
    return effectFn;
  }
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
      const activeEffect = effectStack[effectStack.length - 1];
      effects.forEach((effect) => {
        if (activeEffect === effect) {
          return;
        }
        if (effect.options.scheduler) {
          effect.options.scheduler(effect);
        } else {
          effect();
        }
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

export const computed = (getter) => {
  const effectFn = effect(getter, {
    lazy: true,
    scheduler(fn) {
      if (!dirty) {
        dirty = true;
        trigger(obj, 'value');
      }
    },
  });
  let dirty = true;
  let val;
  const obj = {
    get value() {
      track(obj, 'value');
      if (dirty) {
        dirty = false;
        val = effectFn();
      }
      return val;
    },
  };
  return obj;
};

function traverse(obj, seen = new Set()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
    return;
  }
  seen.add(obj);
  Object.keys(obj).forEach((key) => {
    traverse(obj[key]);
  });
  return obj;
}

export const watch = (source, cb) => {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler(fn) {
      const newValue = fn();
      cb(newValue, oldValue);
      oldValue = newValue;
    },
  });
  let oldValue = effectFn();
};
