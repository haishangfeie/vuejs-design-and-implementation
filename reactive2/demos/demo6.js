// 希望利用调度器，控制执行的次数，忽略proxy.a的中间状态，只打印同步操作的最终结果

import { effect, reactive } from 'reactive';

const obj = {
  a: 1,
};
const proxy = reactive(obj);

const queue = new Set();
let isDoing = false;
const doQueue = () => {
  if (isDoing) {
    return;
  }
  isDoing = true;
  Promise.resolve()
    .then(() => {
      queue.forEach((effect) => {
        effect();
        queue.delete(effect);
      });
    })
    .finally(() => {
      isDoing = false;
    });
};
effect(
  () => {
    console.log(proxy.a);
  },
  {
    scheduler(fn) {
      queue.add(fn);
      doQueue();
    },
  }
);

proxy.a++;
proxy.a++;
