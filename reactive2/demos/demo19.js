import { reactive, effect } from 'reactive';
const p = reactive(new Set([1, 2, 3]));

effect(() => {
  // 在副作用函数内访问 size 属性
  console.log(p.size);
});
// 添加值为 1 的元素，应该触发响应(优化后不应触发响应，因为1已经存在，但添加5可以触发响应)
p.add(1);
p.add(5);
