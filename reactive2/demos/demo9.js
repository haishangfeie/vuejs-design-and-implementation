import { reactive, watch } from 'reactive';

const obj = reactive({
  a: 1,
});
let count = 0;
const startTime = performance.now();
const request = (params) => {
  let time = count === 0 ? 1000 : 500;
  count++;
  const curIndex = count;
  return new Promise((resolve) => {
    setTimeout(() => {
      const endTime = performance.now();
      resolve(
        `第${curIndex}次请求，经过${
          Math.round(endTime - startTime) / 1000
        }s后返回，请求参数是${params}`
      );
    }, time);
  });
};
watch(
  () => obj.a,
  async (val, oldVal, onInvalidate) => {
    let expired = false;
    onInvalidate(() => {
      expired = true;
    });
    const data = await request(obj.a);
    if (!expired) {
      console.log('data', data);
    }
  }
);

obj.a = 1;
obj.a = 2;
