import { effect, reactive } from 'reactive';
console.log(
  '--demo: 数组，设置数组索引对应的值，可能需要触发arr.length关联的副作用函数'
);

const arr = reactive(['foo']);
effect(() => {
  console.log('arr.length', arr.length);
});

// 设置索引1的值，会导致数组长度变化
arr[1] = 'bar';
