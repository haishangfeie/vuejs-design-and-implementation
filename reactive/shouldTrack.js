let shouldTrack = true;

export const getShouldTrack = () => {
  return shouldTrack;
};
export const setShouldTrack = (flag) => {
  shouldTrack = !!flag;
};
