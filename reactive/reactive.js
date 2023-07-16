/**
 * 实现计算属性
 */
let activeEffect;
const stack = [];
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
  effects.forEach((fn) => {
    if (fn === activeEffect) {
      return;
    }
    if (fn.options && fn.options.scheduler) {
      fn.options.scheduler(fn);
    } else {
      fn();
    }
  });
}

export const reactive = (data) => {
  return new Proxy(data, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, newVal) {
      target[key] = newVal;
      trigger(target, key);
      return true;
    },
  });
};

// 计算属性
export function computed(getter) {
  let _value;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      trigger(obj, 'value');
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
  const job = () => {
    newVal = effectFn();
    handler(newVal, oldVal);
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
