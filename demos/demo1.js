import { effect, reactive } from 'reactive';
console.log('--demo: 基本的响应式--');
const obj = reactive({
  text: 'hello world',
});
effect(() => {
  document.body.innerText = obj.text;
});
setTimeout(() => {
  obj.text = 'hello vue';
}, 1000);
