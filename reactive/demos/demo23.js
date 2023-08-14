import { reactive, effect } from 'reactive';

console.log('--demo: for in操作可以触发依赖收集-');
const obj = reactive({
  text: 'hello world',
});

effect(() => {
  for (let key in obj) {
    console.log('key', key);
  }
});

console.log('---');
setTimeout(() => {
  obj.text2 = 2;
  console.log('****分割线****')
}, 100);

// 如果是修改，则不会触发和for in 关联的副作用函数重新执行
setTimeout(() => {
  obj.text = 'hello vue';
}, 500);