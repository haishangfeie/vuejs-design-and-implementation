import { reactive, watch } from 'reactive';
console.log('--demo: watch 让副作用过期--');
const obj = reactive({
  text: 'hello world',
});
let time = 1000;
let arr = [1, 2];
watch(
  () => obj.text,
  async (newVal, oldVal, onInvalidate) => {
    let expired = false;

    onInvalidate(() => {
      expired = true;
    });
    const res = await new Promise((resolve) => {
      let res = arr.shift();
      setTimeout(() => {
        console.log(newVal + ' 得到的res');
        resolve(res);
      }, time);
      time = time / 2;
    });
    if (!expired) {
      console.log('res', res);
    } else {
      console.log('res的结果已经过期');
    }
  }
);

obj.text = '先触发发送的信息';

setTimeout(() => {
  obj.text = '后发送的信息';
}, 0);
