let handleError = (error) => {
  console.warn(error);
};
const registerHandleError = (fn) => {
  handleError = fn;
};
const callWithHandleError = (fn) => {
  try {
    fn && fn();
  } catch (error) {
    handleError(error);
  }
};

const utils = {
  fn1: (cb) => {
    callWithHandleError(cb);
  },
};

// 自定义错误处理
registerHandleError((error) => {
  console.warn(`自定义错误：${error.message}`);
});
utils.fn1(() => {
  throw Error('测试错误');
});
