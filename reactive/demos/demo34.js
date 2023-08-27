import { effect, reactive } from 'reactive';
console.log('--demo: 数组，设置arr.length，会隐式影响数组元素的值');
// 设置arr.length时，如果元素的key>=arr.length时，该元素的值会受到影响

const arr = reactive(['foo']);
effect(() => {
  console.log('arr[0]', arr[0]);
});

// 设置索引1的值，会导致数组长度变化
arr.length = 0;
