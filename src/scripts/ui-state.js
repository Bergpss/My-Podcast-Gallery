export const GalleryState = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  EMPTY: 'empty',
  ERROR: 'error'
});

export function createInitialState() {
  return {
    status: GalleryState.LOADING,
    message: 'Loading podcasts…'
  };
}
