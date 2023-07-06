import { effect, reactive } from 'reactive';
console.log('--demo: 支持调度执行，控制执行次数--');
// 调度执行-控制次数
const obj = reactive({
  foo: 1,
});

let jobQueue = new Set();
let isFlushing = false;
const options = {
  scheduler: (fn) => {
    jobQueue.add(fn);
    flushJob();
  },
};
effect(() => {
  console.log(obj.foo);
}, options);
obj.foo++;
obj.foo++;
console.log('end');

function flushJob() {
  if (isFlushing) {
    return;
  }
  isFlushing = true;
  let chain = Promise.resolve();
  chain
    .then(() => {
      jobQueue.forEach((fn) => {
        fn();
      });
      jobQueue.clear()
    })
    .finally(() => {
      isFlushing = false;
      if (jobQueue.size) {
        flushJob();
      }
    });
}