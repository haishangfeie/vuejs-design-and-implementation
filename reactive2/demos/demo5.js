// 验证调度器功能
import { effect, reactive } from 'reactive';

const obj = {
  a: 1,
};
const proxy = reactive(obj);

effect(
  () => {
    console.log(proxy.a);
  },
  {
    scheduler(fn) {
      setTimeout(() => {
        fn();
      }, 0);
    },
  }
);

proxy.a++;

console.log('结束了');
