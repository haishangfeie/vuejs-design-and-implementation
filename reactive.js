/**
 * 当前的实现并不支持effect的嵌套
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
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    stack.push(effectFn);
    fn();
    stack.pop(effectFn);
    activeEffect = stack[stack.length - 1];
  };
  // 重置数组
  effectFn.deps = [];
  effectFn();
}
const bucket = new WeakMap();
const data = {
  val: 1,
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

// // 执行副作用函数，触发getter
// effect(() => {
//   console.log('--effect1--');
//   document.body.innerText = obj.ok ? obj.text : 'not';
// });

// setTimeout(() => {
//   obj.ok = false;
//   setTimeout(() => {
//     console.log('----');
//     obj.text = '修改也不会触发副作用';
//   }, 1000);
// }, 1000);

// --------
// effect(() => {
//   console.log('--effect1');
//   effect(() => {
//     console.log('--effect2');
//     console.log('---obj.text2', obj.text2);
//   });
//   console.log('---obj.text', obj.text);
// });
// setTimeout(() => {
//   console.log('1秒后');
//   obj.text = 'hhh';
// }, 1000);
/**
 * 不支持嵌套时的结果：
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hello world
 * 1秒后
 * -------------------
 * 期望的结果：
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hello world
 * 1秒后
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hhh
 */

// --------
/**
 * 但是上面的实现虽然实现了栈，但是也意味着修改obj.text2时会有2个副作用函数执行
 * 是不是需要将原来的副作用函数卸载掉呢？
 */
// effect(() => {
//   console.log('--effect1');
//   effect(() => {
//     console.log('--effect2');
//     console.log('---obj.text2', obj.text2);
//   });
//   console.log('---obj.text', obj.text);
// });
// setTimeout(() => {
//   console.log('1秒后');
//   obj.text = 'hhh';
//   setTimeout(() => {
//     console.log('又1秒后');
//     obj.text2 = '2222';
//   }, 1000);
// }, 1000);

effect(() => {
  console.log('无限循环');
  obj.val = obj.val + 1;
});
