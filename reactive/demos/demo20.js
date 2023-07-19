import { reactive, watch } from 'reactive';
console.log('--demo: watch 让旧的副作用过期--');
const obj = reactive({
  text: 'hello world',
});
let time = 1000;
watch(
  () => obj.text,
  async (newVal, oldVal, onInvalidate) => {
    let expired = false;

    onInvalidate(() => {
      expired = true;
    });
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, time);
      time = time / 2;
    });
    console.log(newVal, '得到结果了');
    if (!expired) {
      console.log('使用的是', newVal, '触发请求的结果');
    }
  }
);

obj.text = '先触发发送的信息';

setTimeout(() => {
  obj.text = '后发送的信息';
}, 0);
console.log(
  '这里确保了不管值触发的请求，那个更快，使用的都是最后变化触发的那个请求'
);
