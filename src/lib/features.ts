import { storage } from '#imports';

/** A user-facing feature. Every feature gets an on/off switch in the popup and settings page. */
export interface Feature {
  /** Stable kebab-case id, used in the storage key. Never rename it once released. */
  id: string;
  name: string;
  description: string;
  enabledByDefault: boolean;
}

/** The feature's on/off setting, synced across the user's Chrome profiles. */
export function featureEnabled(feature: Feature) {
  return storage.defineItem<boolean>(`sync:features.${feature.id}.enabled`, {
    fallback: feature.enabledByDefault,
  });
}

/**
 * Runs `enable` while the feature is switched on and the cleanup it returns when switched off,
 * reacting live to the setting (no page reload). Returns a function that stops watching and cleans up.
 */
export async function whileEnabled(feature: Feature, enable: () => () => void) {
  const setting = featureEnabled(feature);
  let disable: (() => void) | undefined;
  const apply = (on: boolean) => {
    if (on && !disable) disable = enable();
    if (!on && disable) {
      disable();
      disable = undefined;
    }
  };

  const unwatch = setting.watch(apply);
  apply(await setting.getValue());
  return () => {
    unwatch();
    apply(false);
  };
}
