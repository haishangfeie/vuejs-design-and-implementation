import { reactive, effect } from 'reactive';

console.log('--demo: 删除操作后是否还会触发原来属性依赖的副作用函数？-');
// 我感觉这个更像是遗留的问题，而不是功能，所以这个没有用例
const obj = reactive({
  text: 'Tom',
  get text2() {
    return `Hello ${this.text}`;
  },
});

effect(() => {
  for (let key in obj) {
    console.log('key', key);
  }
});
effect(() => {
    console.log('obj.text', obj.text);
});
console.log('----')
delete obj.text
console.log('*****')
obj.text = 'vue'

/**
 * 结论：按照目前的实现还是会触发原来属性依赖的副作用函数？
 * 针对 commit a49097a75c674f15b854df419195322e0a9439e7
 */