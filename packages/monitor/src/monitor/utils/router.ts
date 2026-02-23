export function listenRouteChange(cb: () => void) {
  const rawPushState = history.pushState;
  history.pushState = function (...args) {
    rawPushState.apply(this, args);
    cb();
  };

  const rawReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    rawReplaceState.apply(this, args);
    cb();
  };

  window.addEventListener('popstate', cb);
}
