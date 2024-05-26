import { reactive, effect } from 'reactive';

const proxy = reactive({
  a: 1,
  get b() {
    return this.a;
  },
});

effect(() => {
  console.log(proxy.b);
});

setTimeout(() => {
  proxy.a++;
}, 1000);
