import { effect, reactive } from 'reactive';
console.log('--demo: 嵌套的effect--');
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
}, 1000);
/**
 * 不支持嵌套时的结果：
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hello world
 * 1秒后
 * -------------------
 * 期望的结果：
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hello world
 * 1秒后
 * --effect1
 * --effect2
 * ---obj.text2 text2
 * ---obj.text hhh
 */