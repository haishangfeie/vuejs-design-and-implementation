/**
 * 实现响应式
 */
import arrayInstrumentations from './arrayInstrumentations.js';
import { getShouldTrack } from './shouldTrack.js';
const TriggerTypes = {
  /** 新增 */
  ADD: 'ADD',
  /** 设置 */
  SET: 'SET',
  /** 删除 */
  DELETE: 'DELETE',
};

let activeEffect;
const stack = [];
const ITERATE_KEY = Symbol();

function cleanup(effectFn) {
  const deps = effectFn.deps;
  deps.forEach((effects) => {
    effects.delete(effectFn);
  });
  deps.length = 0;
}
export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    stack.push(effectFn);
    const res = fn();
    stack.pop(effectFn);
    // 重置数组
    activeEffect = stack[stack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
const bucket = new WeakMap();

function track(target, key) {
  if (!activeEffect || !getShouldTrack()) {
    return;
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

function trigger(target, key, type, newVal) {
  const targetMap = bucket.get(target);
  if (!targetMap) {
    return;
  }
  const deps = targetMap.get(key);

  // 避免无限循环
  const effects = new Set();
  if (deps) {
    deps.forEach((fn) => {
      effects.add(fn);
    });
  }

  if (Array.isArray(target) && type === TriggerTypes.ADD) {
    const lenDeps = targetMap.get('length');
    lenDeps &&
      lenDeps.forEach((fn) => {
        effects.add(fn);
      });
  }
  if (Array.isArray(target) && key === 'length') {
    targetMap.forEach((deps, key) => {
      if (key >= newVal) {
        deps.forEach((fn) => {
          effects.add(fn);
        });
      }
    });
  }

  const iterateDeps = targetMap.get(ITERATE_KEY);
  if (
    iterateDeps &&
    (type === TriggerTypes.ADD || type === TriggerTypes.DELETE)
  ) {
    iterateDeps.forEach((fn) => {
      effects.add(fn);
    });
  }

  effects.forEach((effect) => {
    if (effect === activeEffect) {
      return;
    }
    if (effect.options && effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

export const reactive = (obj) => createReactive(obj, false);
export const shallowReactive = (obj) => createReactive(obj, true);
export const readonly = (obj) => createReactive(obj, false, true);
export const shallowReadonly = (obj) => createReactive(obj, true, true);

// 计算属性
export function computed(getter) {
  let _value;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      trigger(obj, 'value', TriggerTypes.SET);
    },
  });
  const obj = {
    get value() {
      if (!dirty) {
        return _value;
      }
      dirty = false;
      _value = effectFn();
      track(obj, 'value');
      return _value;
    },
  };
  return obj;
}

// watch
/**
 *
 * @param {*} source
 * @param {*} handler
 * @param {*} options
 * @param {boolean} options.immediate
 * @param {string} options.flush - 只支持 'post'|'sync'，当前无法区分pre和post
 */
export function watch(source, handler, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let newVal, oldVal;
  let cleanup;
  const onInvalidate = (fn) => {
    cleanup = fn;
  };
  const job = () => {
    newVal = effectFn();
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }
    handler(newVal, oldVal, onInvalidate);
    oldVal = newVal;
  };
  const effectFn = effect(() => getter(), {
    scheduler: () => {
      // 'post'原本是表示组件更新后执行，而这里只是表示异步执行
      if (options.flush === 'post') {
        const p = Promise.resolve();
        p.then(job);
      } else {
        job();
      }
    },
    lazy: true,
  });
  if (options.immediate) {
    job();
  } else {
    oldVal = effectFn();
  }
}
// 递归遍历
function traverse(obj, seen = new Set()) {
  if (!isObject(obj) || seen.has(obj)) {
    return;
  }
  // 避免循环引用导致死循环
  seen.add(obj);
  // 暂时不考虑数组等其他结构
  // if (Array.isArray(obj)) {
  //   for (let i = 0; i < obj.length; i++) {
  //     traverse(obj[i]);
  //     return;
  //   }
  // }
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        traverse(obj[key], seen);
      }
    }
    return obj;
  }
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

const reactiveMap = new Map();
function createReactive(data, isShallow = false, isReadonly = false) {
  return new Proxy(data, {
    get(target, key, receiver) {
      // 为了让代理对象可以访问到原始数据
      if (key === 'raw') {
        return target;
      }
      // typeof key !== 'symbol' 这句的判断是因为使用for...of循环，或者for...of arr.values()都会读取数组的Symbol.iterator属性。为了避免发生意外的错误，以及性能方面的考量，不需要让副作用函数与这类symbol值间建立响应式联系
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);

      if (typeof res === 'object' && res !== null && !isShallow) {
        const existProxy = reactiveMap.get(res);
        if (existProxy) {
          return existProxy;
        }
        const proxyRes = isReadonly ? readonly(res) : reactive(res);
        reactiveMap.set(res, proxyRes);
        return proxyRes;
      }
      return res;
    },
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性${key}是只读的`);
        return true;
      }
      const type = Array.isArray(target)
        ? Number(key) < target.length
          ? TriggerTypes.SET
          : TriggerTypes.ADD
        : Object.prototype.hasOwnProperty.call(target, key)
        ? TriggerTypes.SET
        : TriggerTypes.ADD;

      const oldVal = target[key];
      const res = Reflect.set(target, key, newVal, receiver);

      // 确保receiver是target的代理对象
      if (target === receiver.raw) {
        // 只有值发生变化，触发触发响应
        // 新值与旧值不全等，并且不都是NaN时才触发响应
        if (newVal !== oldVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal);
        }
      }

      return res;
    },
    // 为了在副作用函数内使用in操作符时可以触发依赖收集
    // 这里的原理大概是这样的：in的底层会调用HasProperty的抽象方法
    // 而HasProperty会调用对象内部的[[HasProperty]]，它对应的拦截函数正是has
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    // 拦截 for in，进行依赖收集
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 拦截属性删除操作
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性${key}是只读的`);
        return true;
      }
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      // 存在key而且删除成功
      if (hasKey && res) {
        trigger(target, key, TriggerTypes.DELETE);
      }
      return res;
    },
  });
}
