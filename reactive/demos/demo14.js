import { effect, reactive, computed } from 'reactive';
console.log(
  '--demo: 副作用函数中读取计算属性，计算属性变化时可以触发副作用函数--'
);
const obj = reactive({
  a: 1,
  b: 3,
});
const c = computed(() => {
  return obj.a + obj.b;
});
effect(() => {
  const val = c.value;
  console.log('副作用函数执行', val);
});
console.log('修改obj.b，副作用函数可以被触发');
obj.b++;
