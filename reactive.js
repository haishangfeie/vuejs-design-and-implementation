// 目标:obj.text改变时，副作用函数可以自动执行

// const obj = {
//   text: 'hello world',
// };
// function effect() {
//   document.body.innerText = obj.text;
// }
// effect()
// setTimeout(() => {
//   obj.text = 'hello vue';
// }, 1000);

/**
 * 当前effect是硬编码实现的响应式
 * 现在希望effect可以不是硬编码
 */
let activeEffect;
function effect(fn) {
  activeEffect = fn;
  fn();
}
const bucket = new Set();
const data = {
  text: 'hello world',
};
const obj = new Proxy(data, {
  get(target, key) {
    bucket.add(activeEffect);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    bucket.forEach((fn) => fn());
    return true;
  },
});

// 执行副作用函数，触发getter
effect(() => {
  console.log('--effect--');
  document.body.innerText = obj.text;
});
setTimeout(() => {
  obj.text = 'hello vue';
}, 1000);
