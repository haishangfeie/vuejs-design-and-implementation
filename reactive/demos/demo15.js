import { effect, reactive, watch } from 'reactive';
console.log('--demo: watch 响应式对象变化时可以触发handler--');
const obj = reactive({
  text: 'hello world',
});
watch(obj, () => {
  console.log('数据变了');
});

obj.text = 'hello vue';
