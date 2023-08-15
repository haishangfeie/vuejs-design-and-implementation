import { reactive, effect } from 'reactive';

console.log('--demo: 删除操作可以触发ITERATE_KEY相关联的副作用函数-');
const obj = reactive({
  text: 'Tom',
  get text2() {
    return `Hello ${this.text}`;
  },
  set text2(val) {
    console.log('触发set');
    const arr = val.split(' ');
    this.text = arr[1] || '';
  },
});

effect(() => {
  for (let key in obj) {
    console.log('key', key);
  }
});
console.log('----')
delete obj.text2
