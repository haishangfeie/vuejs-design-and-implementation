import { reactive, effect } from 'reactive';

const proxy = reactive({
  a: 1,
});

effect(() => {
  'a' in proxy;
  console.log('----');
});

setTimeout(() => {
  proxy.a++;
}, 1000);
