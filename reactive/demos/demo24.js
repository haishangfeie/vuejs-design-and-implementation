import { reactive, effect } from 'reactive';

console.log('--demo: 设置属性时，间接设置的属性可以触发副作用函数-');
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
  console.log('obj.text', obj.text);
});

effect(() => {
  console.log('obj.text2', obj.text2);
});

setTimeout(() => {
  console.log('----')
  obj.text2 = 'hello 哈利'
}, 100);

/**
 * 当前demo commit de16cc5dc0f4857933726873b38a1dd20a7860b7
 * 针对 commit 941ad3e7e3ea7d548eda0f60bcec508d83926cef 的reactive.js
 * 1. 为什么100毫秒后，'obj.text2 Hello 哈利'会输出两次？
 * 因为执行时
    effect(() => {
      console.log('obj.text2', obj.text2);
    });
    除了obj.text2收集了依赖，obj.text也收集了依赖
    而修改obj.text2的时候，会触发obj.text发生改变，从而触发obj.text执行副作用函数，这里面几句有
    () => {
      console.log('obj.text2', obj.text2);
    }
    而obj.text2也会执行副作用函数，所以就输出了2次

    2. 那输出的两次obj.text2中，第一次是obj.text触发的副作用函数，还是obj.text2触发的副作用函数呢？
    按照上面的代码，会先修改obj.text，所以会先触发obj.text收集的副作用函数，输出
      console.log('obj.text', obj.text);
      接着 console.log('obj.text2', obj.text2);
      然后obj.text修改会触发obj.text2发生修改，
      obj.text2发生修改会触发其收集的副作用函数
      console.log('obj.text2', obj.text2);
 */