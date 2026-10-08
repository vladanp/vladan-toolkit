import { type Feature, featureEnabled } from './features';
import { askEvent, switchDetail, switchEvent } from './main-world';

/**
 * Isolated world: keeps the feature's page-world script (see mainWorldSwitch) informed of its switch,
 * now and on every change. Returns a function that stops.
 */
export function shareSwitchWithPage(feature: Feature, doc: Document = document): () => void {
  const setting = featureEnabled(feature);
  let on: boolean | undefined;
  const announce = () => {
    if (on === undefined) return;
    doc.dispatchEvent(new CustomEvent(switchEvent, { detail: switchDetail(feature.id, on) }));
  };
  const onAsk = (event: Event) => {
    if ((event as CustomEvent<unknown>).detail === feature.id) announce();
  };
  doc.addEventListener(askEvent, onAsk);
  const unwatch = setting.watch((value) => {
    on = value;
    announce();
  });
  setting.getValue().then((value) => {
    on = value;
    announce();
  });
  return () => {
    doc.removeEventListener(askEvent, onAsk);
    unwatch();
  };
}
