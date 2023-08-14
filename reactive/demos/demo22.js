import { reactive, effect } from 'reactive';

console.log('--demo: in操作符触发依赖收集-');
const obj = reactive({
  text: 'hello world',
});

effect(() => {
  if('text' in obj){
    console.log('触发了effect')
  }
});

console.log('---');
setTimeout(() => {
  console.log('---100ms后')
  obj.text = 2
}, 100);

// 不过目前的实现，哪怕是不存在的key也会进行依赖收集，这是对的吗？
/* const obj = reactive({
  text: 'hello world',
});

effect(() => {
  if('text2' in obj){
    console.log('触发了effect')
  }
});

console.log('---');
setTimeout(() => {
  console.log('---100ms后')
  obj.text2 = 2
}, 100); */
