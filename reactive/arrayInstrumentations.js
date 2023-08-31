import { setShouldTrack } from './shouldTrack.js';
const arrayInstrumentations = {};
['includes', 'indexOf', 'lastIndexOf'].forEach((method) => {
  const originMethod = Array.prototype[method];

  arrayInstrumentations[method] = function (...args) {
    const res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      return originMethod.apply(this.raw, args);
    }
    return res;
  };
});

['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    setShouldTrack(false);
    const res = originMethod.apply(this, args);
    setShouldTrack(true);

    return res;
  };
});

export default arrayInstrumentations;
