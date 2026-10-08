import { storage } from '#imports';

/** Where a feature works; the settings UI groups its switches by this, in this order. */
export const featureGroups = ['YouTube', 'Reddit', 'Pop-ups', 'All websites'] as const;
export type FeatureGroup = (typeof featureGroups)[number];

export interface Feature {
  /** Stable kebab-case id; part of the storage key, so never rename it. */
  id: string;
  /** Short name shown next to the switch. */
  name: string;
  /** One sentence explaining what the feature does. */
  description: string;
  /** Settings section the switch appears in. */
  group: FeatureGroup;
  enabledByDefault: boolean;
}

/** The on/off switch of a feature, synced across the user's browsers. */
export function featureEnabled(feature: Feature) {
  return storage.defineItem<boolean>(`sync:features.${feature.id}.enabled`, {
    fallback: feature.enabledByDefault,
  });
}

/**
 * Runs `enable` while the feature is switched on, and the cleanup it returns when switched off,
 * reacting live to the switch. Returns a function that stops watching (and cleans up).
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
