import { reactive, effect } from 'reactive';
console.log('--demo: 访问访问器属性时，间接读取的属性修改无法触发响应-');
const obj = reactive({
  text: 'hello world',
  get bar() {
    return this.text;
  },
});

effect(() => {
  console.log(obj.bar);
});

console.log('---');
obj.text = 'hello vue';
