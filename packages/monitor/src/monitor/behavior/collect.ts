import { eventBus } from '../utils/eventBus';
import { listenRouteChange } from '../utils/router';

let inited = false;

export function initBehaviorCollector() {
  if (inited) return;
  inited = true;
  initClickListener();
  initRouteListener();
}

function initRouteListener() {
  const emitRoute = () => {
    eventBus.emit('behavior', {
      type: 'route',
      data: { url: location.pathname },
    });
  };

  listenRouteChange(emitRoute);
}

function initClickListener() {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement;
      if (!target || target === document.body) return;
      if (!shouldRecordClick(target)) return;

      eventBus.emit('behavior', {
        type: 'click',
        data: getDomInfo(target),
      });
    },
    true,
  );
}

function getDomInfo(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const cls =
    el.className && typeof el.className === 'string'
      ? `.${el.className.split(/\s+/).slice(0, 2).join('.')}`
      : '';

  const text = el.innerText?.trim().replace(/\s+/g, ' ').slice(0, 30);

  return {
    tag,
    selector: `${tag}${id}${cls}`,
    text,
  };
}

function shouldRecordClick(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  return ['button', 'a', 'input', 'div'].includes(tag);
}
