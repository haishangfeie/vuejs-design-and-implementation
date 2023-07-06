import { effect, reactive } from 'reactive';
console.log('--demo: 支持调度执行，控制执行时机--');
/**
 * 默认输出是：1->2->end
 * 希望利用调度变成：1->end->2
 */
// 调度执行
const obj = reactive({
  foo: 1,
});
const options = {
  scheduler: (fn) => {
    setTimeout(fn);
  },
};
effect(() => {
  console.log(obj.foo);
}, options);
obj.foo++;
console.log('end');