import { effect, reactive, computed } from './reactive';
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
      console.log('修改obj.b，副作用函数可以被触发');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(val).toBe(4);
      obj.b++;
      expect(fn).toHaveBeenCalledTimes(2);
      expect(val).toBe(5);
    });
  });
});
