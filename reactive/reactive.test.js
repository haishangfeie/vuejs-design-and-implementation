import {
  effect,
  reactive,
  computed,
  watch,
  shallowReactive,
  readonly,
  shallowReadonly,
} from './reactive';
import { jest } from '@jest/globals';
describe('响应式', () => {
  describe('effect', () => {
    test('满足基本的响应式', () => {
      let a;
      const obj = reactive({
        text: 'hello world',
      });
      effect(() => {
        a = obj.text;
      });
      expect(a).toBe('hello world');
      obj.text = 'hello vue';
      expect(a).toBe('hello vue');
    });
    test('改变不相干的key不会触发响应', () => {
      const mockFn = jest.fn(() => {
        a = obj.text;
      });
      let a;
      const obj = reactive({
        text: 'hello world',
        ok: true,
      });
      effect(mockFn);
      expect(a).toBe('hello world');
      obj.ok = false;
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    test('避免遗留的副作用函数', () => {
      const mockFn = jest.fn(() => {
        a = obj.ok ? obj.text : 'not';
      });
      let a;
      const obj = reactive({
        text: 'hello world',
        ok: true,
      });
      effect(mockFn);
      expect(a).toBe('hello world');
      obj.ok = false;
      expect(mockFn).toHaveBeenCalledTimes(2);
      obj.text = 'hello vue';
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
    test('嵌套的effect,obj.text改变时会触发外层effect和里层的effect', () => {
      let a1, a2;
      const obj = reactive({
        text: 'text',
        text2: 'text2',
      });
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      effect(() => {
        fn1();
        effect(() => {
          fn2();
          a2 = obj.text2;
        });
        a1 = obj.text;
      });
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      obj.text = 'text change';
      expect(fn1).toHaveBeenCalledTimes(2);
      expect(fn2).toHaveBeenCalledTimes(2);
    });
    test('嵌套的effect,obj.text2改变时会里层的effect', () => {
      let a1, a2;
      const obj = reactive({
        text: 'text',
        text2: 'text2',
      });
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      effect(() => {
        fn1();
        effect(() => {
          fn2();
          a2 = obj.text2;
        });
        a1 = obj.text;
      });
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      obj.text2 = 'text2 change';
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(2);
    });
    test('避免递归自身导致无限递归循环', () => {
      const obj = reactive({
        val: 1,
      });
      const fn = jest.fn(() => {
        obj.val = obj.val + 1;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
    });
    test('支持调度执行，控制执行时机', () => {
      jest.useFakeTimers();
      const obj = reactive({
        foo: 1,
      });
      const options = {
        scheduler: (fn) => {
          setTimeout(fn);
        },
      };
      let a;
      const fn = jest.fn(() => {
        a = obj.foo;
      });
      effect(fn, options);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.foo++;
      expect(fn).toHaveBeenCalledTimes(1);
      jest.runAllTimers();
      expect(fn).toHaveBeenCalledTimes(2);

      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    test('支持调度执行，控制执行次数', (done) => {
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
      let a;
      let fn = jest.fn(() => {
        a = obj.foo;
      });
      effect(fn, options);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.foo++;
      obj.foo++;
      expect(fn).toHaveBeenCalledTimes(1);
      Promise.resolve().then(() => {
        expect(fn).toHaveBeenCalledTimes(2);
        done();
      });

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
            jobQueue.clear();
          })
          .finally(() => {
            isFlushing = false;
            if (jobQueue.size) {
              flushJob();
            }
          });
      }
    });
    test('支持lazy', () => {
      const obj = reactive({
        foo: 1,
      });

      const fn = jest.fn();
      const effectFn = effect(fn, {
        lazy: true,
      });
      expect(fn).toHaveBeenCalledTimes(0);
      effectFn();
      expect(fn).toHaveBeenCalledTimes(1);
    });
    test('手动执行副作用函数时可以拿到副作用函数返回值', () => {
      const obj = reactive({
        a: 1,
        b: 3,
      });
      const fn = jest.fn(() => {
        return obj.a + obj.b;
      });
      const effectFn = effect(fn, { lazy: true });
      expect(fn).toHaveBeenCalledTimes(0);
      expect(effectFn()).toBe(4);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
  describe('computed', () => {
    test('计算属性-懒计算', () => {
      const obj = reactive({
        a: 1,
        b: 3,
      });
      const getter = jest.fn(() => {
        return obj.a + obj.b;
      });
      const sumRes = computed(getter);
      expect(getter).toHaveBeenCalledTimes(0);
      const a = sumRes.value;
      expect(getter).toHaveBeenCalledTimes(1);
      expect(a).toBe(4);
    });
    test('计算属性-值缓存', () => {
      const obj = reactive({
        a: 1,
        b: 3,
      });
      const getter = jest.fn(() => {
        return obj.a + obj.b;
      });
      const sumRes = computed(getter);
      expect(getter).toHaveBeenCalledTimes(0);
      let a;
      a = sumRes.value;
      expect(getter).toHaveBeenCalledTimes(1);
      expect(a).toBe(4);
      a = sumRes.value;
      a = sumRes.value;
      expect(getter).toHaveBeenCalledTimes(1);
      expect(a).toBe(4);
      obj.a++;
      expect(getter).toHaveBeenCalledTimes(1);
      a = sumRes.value;
      expect(getter).toHaveBeenCalledTimes(2);
      expect(a).toBe(5);
    });
    test('计算属性-副作用函数中读取计算属性，计算属性变化时可以触发副作用函数', () => {
      const obj = reactive({
        a: 1,
        b: 3,
      });
      const c = computed(() => {
        return obj.a + obj.b;
      });
      let val;
      const fn = jest.fn(() => {
        val = c.value;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(val).toBe(4);
      obj.b++;
      expect(fn).toHaveBeenCalledTimes(2);
      expect(val).toBe(5);
    });
  });
  describe('watch', () => {
    test('watch 响应式对象变化时可以触发handler', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn();
      watch(obj, () => {
        fn();
      });
      expect(fn).toHaveBeenCalledTimes(0);
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(1);
    });
    test('watch 接收getter函数', () => {
      const obj = reactive({
        text: 'hello world',
        text2: 'text text',
      });
      const fn = jest.fn();
      watch(() => obj.text, fn);
      expect(fn).toHaveBeenCalledTimes(0);
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text2 = 'text text--';
      expect(fn).toHaveBeenCalledTimes(1);
    });
    test('watch 回调函数中拿到新值、旧值', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn((newVal, oldVal) => {});
      watch(() => obj.text, fn);
      expect(fn).toHaveBeenCalledTimes(0);
      obj.text = 'hello vue';
      expect(fn.mock.calls[0][0]).toBe('hello vue');
      expect(fn.mock.calls[0][1]).toBe('hello world');

      const obj2 = reactive({
        text: 'hello world',
      });
      const fn2 = jest.fn((newVal, oldVal) => {});
      watch(obj2, fn2);
      expect(fn2).toHaveBeenCalledTimes(0);
      obj2.text = 'hello vue';
      expect(fn2.mock.calls[0][0]).toBe(obj2);
      expect(fn2.mock.calls[0][1]).toBe(obj2);
    });
    test('watch 支持立即执行', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn((newVal, oldVal) => {});
      watch(() => obj.text, fn, {
        immediate: true,
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0]).toBe('hello world');
      expect(fn.mock.calls[0][1]).toBe(undefined);
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn.mock.calls[1][0]).toBe('hello vue');
      expect(fn.mock.calls[1][1]).toBe('hello world');
    });
    test('watch 执行时机支持异步执行', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn((newVal, oldVal) => {});
      watch(() => obj.text, fn, {
        flush: 'post',
      });
      expect.assertions(4); // 指明会触发4次断言
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(0);
      return Promise.resolve().then(() => {
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn.mock.calls[0][0]).toBe('hello vue');
        expect(fn.mock.calls[0][1]).toBe('hello world');
      });
    });
    // 我感觉一个用例说明不了问题，两个用例加起来才能说明是不管第一个请求快于还是慢于第二个请求，都可以让之前的请求过期，也就是第一个请求的expired标识总是会标识为true
    describe('watch 支持让副作用过期', () => {
      test('watch 支持让副作用过期 - 第一个异步慢于第二个异步', async () => {
        jest.useFakeTimers();
        const obj = reactive({
          text: 'hello world',
        });
        const fetchData = jest.fn();

        fetchData
          .mockImplementationOnce(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve('first request');
              }, 1000);
            });
          })
          .mockImplementationOnce(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve('second request');
              }, 500);
            });
          });
        let beforeAwait = [];
        let res = [];
        watch(
          () => obj.text,
          async (newVal, oldVal, onInvalidate) => {
            let expired = false;
            beforeAwait.push(newVal);
            onInvalidate(() => {
              expired = true;
            });
            res.push([newVal, await fetchData(), expired]);
          }
        );

        obj.text = 'first';
        obj.text = 'second';
        jest.runAllTimers();
        await Promise.resolve(); // 等待异步操作完成
        // 先触发first,再触发second,但是后触发的方法更早获得返回值，而first获得返回值时已经过期
        expect(beforeAwait).toEqual(['first', 'second']);
        expect(res).toEqual([
          ['second', 'second request', false],
          ['first', 'first request', true],
        ]);
        jest.useRealTimers();
      });
      test('watch 支持让副作用过期 - 第一个异步快于第二个异步', async () => {
        jest.useFakeTimers();
        const obj = reactive({
          text: 'hello world',
        });
        const fetchData = jest.fn();

        fetchData
          .mockImplementationOnce(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve('first request');
              }, 500);
            });
          })
          .mockImplementationOnce(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve('second request');
              }, 1000);
            });
          });
        let beforeAwait = [];
        let res = [];
        watch(
          () => obj.text,
          async (newVal, oldVal, onInvalidate) => {
            let expired = false;
            beforeAwait.push(newVal);
            onInvalidate(() => {
              expired = true;
            });
            res.push([newVal, await fetchData(), expired]);
          }
        );

        obj.text = 'first';
        obj.text = 'second';
        jest.runAllTimers();
        await Promise.resolve(); // 等待异步操作完成
        // 先触发first,再触发second,但是后触发的方法更早获得返回值，而first获得返回值时已经过期
        expect(beforeAwait).toEqual(['first', 'second']);
        expect(res).toEqual([
          ['first', 'first request', true],
          ['second', 'second request', false],
        ]);
        jest.useRealTimers();
      });
    });
  });
  describe('处理代理的各种读取的操作', () => {
    test('访问访问器属性时，间接读取的属性修改可以触发响应', () => {
      const obj = reactive({
        text: 'hello world',
        get bar() {
          return this.text;
        },
      });

      const fn = jest.fn(() => {
        const a = obj.bar;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('in操作符可以触发依赖收集', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn();
      effect(() => {
        if ('text' in obj) {
          fn();
        }
      });
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('for in可以触发依赖收集', () => {
      const obj = reactive({
        text: 'hello world',
      });
      const fn = jest.fn(() => {
        for (let key in obj) {
        }
      });
      effect(() => {
        fn();
      });
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text2 = 'hello vue';
      expect(fn).toHaveBeenCalledTimes(2);
      obj.text = 'hello world2';
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('设置属性时，间接设置的属性可以触发副作用函数', () => {
      const obj = reactive({
        text: 'Tom',
        get text2() {
          return `Hello ${this.text}`;
        },
        set text2(val) {
          const arr = val.split(' ');
          this.text = arr[1] || '';
        },
      });
      const fn = jest.fn(() => {
        obj.text2;
      });
      effect(fn);

      expect(fn).toHaveBeenCalledTimes(1);
      obj.text = 'Mary';
      expect(fn).toHaveBeenCalledTimes(2);
      obj.text2 = 'hello 哈利';
      expect(fn).toHaveBeenCalledTimes(4);
    });
    test('删除操作可以触发ITERATE_KEY相关联的副作用函数', () => {
      const obj = reactive({
        text: 'Tom',
        get text2() {
          return `Hello ${this.text}`;
        },
        set text2(val) {
          const arr = val.split(' ');
          this.text = arr[1] || '';
        },
      });
      const fn = jest.fn(() => {
        for (let key in obj) {
        }
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      delete obj.text2;
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
  describe('合理地触发响应', () => {
    test('值没有变化时不会触发响应', () => {
      const obj = reactive({
        text: 'Tom',
      });
      const fn = jest.fn(() => {
        obj.text;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text = 'Tom';
      expect(fn).toHaveBeenCalledTimes(1);
      obj.text = 'Tom2';
      expect(fn).toHaveBeenCalledTimes(2);
      obj.text = NaN;
      expect(fn).toHaveBeenCalledTimes(3);
      obj.text = NaN;
      expect(fn).toHaveBeenCalledTimes(3);
      obj.text = 1;
      expect(fn).toHaveBeenCalledTimes(4);
    });
    test('避免实例原型的代理对象的set拦截函数被执行', () => {
      const obj = {};
      const proto = { bar: 1 };
      const child = reactive(obj);
      const parent = reactive(proto);

      // 使用parent作为child的原型
      Object.setPrototypeOf(child, parent);

      const fn = jest.fn(() => {
        child.bar;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      child.bar = 2;
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
  describe('深响应&浅响应', () => {
    test('reactive可以触发深响应', () => {
      const obj = reactive({
        foo: {
          bar: 1,
        },
      });
      const fn = jest.fn(() => {
        obj.foo.bar;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.foo.bar = 2;
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('shallowReactive不会触发深响应', () => {
      const obj = shallowReactive({
        foo: {
          bar: 1,
        },
      });
      const fn = jest.fn(() => {
        obj.foo.bar;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      obj.foo.bar = 2;
      expect(fn).toHaveBeenCalledTimes(1);
    });
    test('只读对象修改时不会生效', () => {
      const obj = readonly({
        foo: {
          bar: 1,
        },
      });
      const old = obj.foo;
      obj.foo = 1;
      expect(obj.foo).toStrictEqual(old);
      obj.foo.bar = 2;
      obj.foo.name = 'name';
      expect(obj.foo.bar).toBe(1);
      expect(obj.foo.name).toBe(undefined);
    });
    test('浅只读对象修改修改浅层时不能修改，但是可以修改深层的数据', () => {
      const obj = shallowReadonly({
        foo: {
          bar: 1,
        },
      });

      const old = obj.foo;
      obj.foo = 1;
      expect(obj.foo).toStrictEqual(old);
      obj.foo.bar = 2;
      obj.foo.name = 'name';
      expect(obj.foo.bar).toBe(2);
      expect(obj.foo.name).toBe('name');
    });
  });
  describe('代理数组', () => {
    test('设置数组索引值导致arr.length变化时，会触发与arr.length相关联的响应式', () => {
      const arr = reactive(['foo']);
      const fn = jest.fn(() => {
        arr.length;
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      // 设置索引1的值，会导致数组长度变化
      arr[1] = 'bar';
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('设置arr.length导致数组元素值发生变化时可以触发相关元素关联的响应式', () => {
      const arr = reactive(['foo']);
      const fn = jest.fn(() => {
        console.log('arr[0]', arr[0]);
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      // 设置索引1的值，会导致数组长度变化
      arr.length = 0;
      expect(fn).toHaveBeenCalledTimes(2);
    });
    test('数组 for in遍历数组，发生影响遍历结果的操作时副作用函数要重新执行', () => {
      const arr = reactive(['foo']);
      const fn = jest.fn(() => {
        for (const key in arr) {
          key;
        }
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      arr[2] = 'bar';
      expect(fn).toHaveBeenCalledTimes(2);
      arr.length = 10;
      expect(fn).toHaveBeenCalledTimes(3);
    });
    test('数组 for of 遍历可迭代对象时，需要副作用函数与数组长度和索引之间建立响应式联系-1', () => {
      const arr = reactive([1, 2, 3, 4, 5]);
      const fn = jest.fn(() => {
        for (const val of arr) {
          val
        }
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      arr[1] = 'bar';
      expect(fn).toHaveBeenCalledTimes(2);
      arr.length = 10;
      expect(fn).toHaveBeenCalledTimes(3);
    });
    test('数组 for of 遍历可迭代对象时，需要副作用函数与数组长度和索引之间建立响应式联系-2', () => {
      const arr = reactive([1, 2, 3, 4, 5]);
      const fn = jest.fn(() => {
        for (const val of arr.values()) {
          val
        }
      });
      effect(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      arr[1] = 'bar';
      expect(fn).toHaveBeenCalledTimes(2);
      arr.length = 10;
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
