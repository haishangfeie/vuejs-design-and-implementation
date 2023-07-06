import { effect, reactive } from 'reactive';
console.log('--demo: 记录一个effect嵌套的问题（没有解决）--');
/**
 * 但是上面的实现虽然实现了栈，但是也意味着修改obj.text2时会有2个副作用函数执行
 * 是不是需要将原来的副作用函数卸载掉呢？
 */
const obj = reactive({
  text: 'hello world',
  text2: 'text2',
});
effect(() => {
  console.log('--effect1');
  effect(() => {
    console.log('--effect2');
    console.log('---obj.text2', obj.text2);
  });
  console.log('---obj.text', obj.text);
});
setTimeout(() => {
  console.log('1秒后');
  obj.text = 'hhh';
  setTimeout(() => {
    console.log('又1秒后');
    obj.text2 = '2222';
  }, 1000);
}, 1000);
