import { reactive, effect } from 'reactive';

const proxy = reactive(new Map([['key', 1]]));

effect(() => {
  console.log(proxy.get('key')); // 读取键为 key 的值
});

proxy.set('key', 2); // 修改键为 key 的值，应该触发响应
