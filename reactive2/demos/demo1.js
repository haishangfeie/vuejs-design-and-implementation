import { effect, reactive } from 'reactive';

const obj = {
  text: 'hello world',
};

const proxy = reactive(obj);

effect(() => {
  document.body.innerText = proxy.text;
});

setTimeout(() => {
  // proxy.text = 'hello Vue';
  proxy.text2 = 'hello Vue';
  console.log('setTimeout');
}, 1000);
