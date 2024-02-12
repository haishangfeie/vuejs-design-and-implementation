// 验证是否解决副作用函数递归调用自身导致无限循环
import { effect, reactive } from 'reactive';

const obj = {
  a: 1,
};
const proxy = reactive(obj);

effect(() => {
  console.log('执行副作用函数');
  proxy.a = proxy.a + 1;
  console.log(proxy.a);
});

setTimeout(() => {
  console.log('1秒后');
  proxy.a = 10;
}, 1000);
