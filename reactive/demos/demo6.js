import { effect, reactive } from 'reactive';
console.log('--demo: 避免递归自身导致无限递归循环--');
const obj = reactive({
  val: 1,
});
effect(() => {
  console.log('不会触发无限循环');
  obj.val = obj.val + 1;
});
