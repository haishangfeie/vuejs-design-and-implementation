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
      return true
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
const data = {
  a: 1,
  b: 3,
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

/* const c = computed(() => {
  return obj.a + obj.b;
});
console.log(c.value);
setTimeout(() => {
  console.log('1秒后');
  obj.a++;
  console.log(c.value);
  setTimeout(() => {
    console.log(c.value);
    obj.a++;
    console.log(c.value);
  }, 1000);
}, 1000); */

// 计算属性变化时可以触发副作用
// const c = computed(() => {
//   return obj.a + obj.b;
// });
// effect(() => {
//   console.log(c.value);
// });
// obj.b++;
