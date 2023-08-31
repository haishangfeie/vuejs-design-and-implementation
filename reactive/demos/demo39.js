import { effect, reactive } from 'reactive';
console.log(
  '--demo: 隐式修改数组长度的原型的修改操作的方法不会建立length属性与副作用函数间的联系'
);

const arr = reactive([]);
effect(() => {
  console.log('a')
  arr.push(1);
});
effect(() => {
  console.log('b');
  
  arr.push(1);
});
