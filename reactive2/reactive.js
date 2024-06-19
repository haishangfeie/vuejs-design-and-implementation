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

function trigger(target, key, type) {
  const depsMap = bucket.get(target);
  if (depsMap) {
    const deps = depsMap.get(key);

    const effectToRun = new Set();
    if (deps) {
      // 避免无限循环
      const effects = new Set(deps);
      const activeEffect = effectStack[effectStack.length - 1];
      effects.forEach((effect) => {
        if (activeEffect !== effect) {
          effectToRun.add(effect);
        }
      });
    }
    if (type === TRIGGER_TYPES.ADD || type === TRIGGER_TYPES.DELETE) {
      const iterateDeps = depsMap.get(ITERATE_KEY);
      if (iterateDeps) {
        // 避免无限循环
        const effects = new Set(iterateDeps);
        const activeEffect = effectStack[effectStack.length - 1];
        effects.forEach((effect) => {
          if (activeEffect !== effect) {
            effectToRun.add(effect);
          }
        });
      }
    }

    effectToRun.forEach((effect) => {
      if (effect.options.scheduler) {
        effect.options.scheduler(effect);
      } else {
        effect();
      }
    });
  }
}

const ITERATE_KEY = Symbol();
const TRIGGER_TYPES = {
  ADD: 'ADD',
  SET: 'SET',
  DELETE: 'DELETE',
};
export const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target;
      }
      track(target, key, receiver);
      return Reflect.get(target, key, receiver);
    },
    // 拦截 key in obj
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    // 拦截 for ... in
    ownKeys(target) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    set(target, key, value, receiver) {
      const prev = target[key];
      const type = Object.prototype.hasOwnProperty.call(target, key)
        ? TRIGGER_TYPES.SET
        : TRIGGER_TYPES.ADD;
      const res = Reflect.set(target, key, value, receiver);
      if (target === receiver.raw) {
        // 考虑NaN的情况
        if (prev !== value && (prev === prev || value === value)) {
          trigger(target, key, type);
        }
      }


      return res;
    },
    deleteProperty(target, key) {
      const has = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (res && has) {
        trigger(target, key, TRIGGER_TYPES.DELETE);
      }
      return res;
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

/* 
  options.flush pre|post|sync
  sync是同步执行，post是调度函数将将副作用放到微任务队列中，并在dom更新结束后执行
  而pre涉及组件的更新时间，暂时无法模拟
  
  其实这里，我有点疑惑，按照目前的实现 post，似乎做不到在dom更新结束后执行
  vue在的实现确实是和现在的实现类似，post时是会放入后置队列中，而渲染函数是放到刷新队列中的，这两个队列都是微任务，而dom的更新是同步的，因此线执行刷新队列再执行后置队列就可以确保post时回调是在dom更新结束后执行。
  我之所以原来有困惑是搞混了一个概念，就是dom更新并不等于页面渲染，页面渲染是在微任务清空后进行的，而dom更新是可以在微任务执行过程中执行的。
*/
/* 
  功能：提供让副作用过期的手段
*/
export const watch = (source, cb, options = {}) => {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue;

  let cleanup;
  const onInvalidate = (fn) => {
    cleanup = fn;
  };
  const job = () => {
    const newValue = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(newValue, oldValue, onInvalidate);
    oldValue = newValue;
  };
  const effectFn = effect(getter, {
    lazy: true,
    scheduler(fn) {
      if (options.flush === 'post') {
        const p = Promise.resolve();
        p.then(job);
      } else {
        job();
      }
    },
  });

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
};
