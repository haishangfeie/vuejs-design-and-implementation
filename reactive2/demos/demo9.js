import { reactive, watch } from 'reactive';

const obj = reactive({
  a: 1000,
});
let count = 0;
const request = (time, count) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`第${count}次请求，经过${time / 1000}s后返回`);
    }, time);
  });
};
watch(
  () => obj.a,
  async (val, oldVal, onInvalidate) => {
    let expired = false;
    onInvalidate &&
      onInvalidate(() => {
        expired = true;
      });
    const data = await request(obj.a, ++count);
    if (!expired) {
      console.log('data', data);
    }
  }
);

obj.a = 2000;
obj.a = 1000;
