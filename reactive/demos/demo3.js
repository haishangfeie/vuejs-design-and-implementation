import { effect, reactive } from 'reactive';
console.log('--demo: 避免遗留的副作用函数--');
const obj = reactive({
  text: 'hello world',
  ok: true,
});
effect(() => {
  console.log('--effect1--');
  document.body.innerText = obj.ok ? obj.text : 'not';
});

setTimeout(() => {
  obj.ok = false;
  setTimeout(() => {
    console.log('--1秒后：修改obj.text，但不会触发响应--');
    obj.text = '修改也不会触发副作用';
  }, 1000);
}, 1000);
