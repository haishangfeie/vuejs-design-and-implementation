import { effect, reactive } from 'reactive';
console.log('--demo: 改变不相干的key不会触发响应--');
const obj = reactive({
  text: 'hello world',
  ok: true,
});
effect(() => {
  document.body.innerText = obj.text;
});
setTimeout(() => {
  console.log('1秒后:修改obj.ok');
  obj.ok = false;
}, 1000);
