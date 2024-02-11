import { effect, reactive } from 'reactive';

const obj = {
  text: 'hello world',
  ok: true,
};

const proxy = reactive(obj);

effect(() => {
  console.log('副作用函数1触发');
  document.body.innerText = proxy.ok ? proxy.text : 'not';
});
effect(() => {
  console.log('副作用函数2触发');
  console.log('obj.text', proxy.text);
});
setTimeout(() => {
  console.log('1秒后，修改proxy.ok为false');
  proxy.ok = false;
}, 1000);

setTimeout(() => {
  console.log('2秒后');
  proxy.ok = true;
}, 2000);
