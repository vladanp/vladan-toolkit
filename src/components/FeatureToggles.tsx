import { useEffect, useState } from 'react';
import { features } from '@/features/registry';
import { type Feature, featureEnabled, featureGroups } from '@/lib/features';

/**
 * One on/off switch per registered feature, grouped by site and kept in sync with storage.
 * `compact` (the popup) shows descriptions only on hover and to screen readers.
 */
export function FeatureToggles({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'mt-2 space-y-2' : 'mt-6 space-y-6'}>
      {featureGroups.map((group) => {
        const inGroup = features.filter((feature) => feature.group === group);
        if (inGroup.length === 0) return null;
        const headingId = `group-${group.toLowerCase().replaceAll(' ', '-')}`;
        return (
          <section key={group} aria-labelledby={headingId}>
            <h2
              id={headingId}
              className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              {group}
            </h2>
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {inGroup.map((feature) => (
                <FeatureToggle key={feature.id} feature={feature} compact={compact} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function FeatureToggle({ feature, compact }: { feature: Feature; compact: boolean }) {
  const [enabled, setEnabled] = useState<boolean>();

  useEffect(() => {
    const setting = featureEnabled(feature);
    setting.getValue().then(setEnabled);
    return setting.watch(setEnabled);
  }, [feature]);

  const inputId = `feature-${feature.id}`;
  const checked = enabled ?? feature.enabledByDefault;
  return (
    <li
      className={`flex items-start gap-3 ${compact ? 'py-1' : 'py-3'}`}
      title={compact ? feature.description : undefined}
    >
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className="mt-0.5 size-4 shrink-0 accent-blue-600"
        checked={checked}
        aria-checked={checked}
        disabled={enabled === undefined}
        aria-describedby={`${inputId}-description`}
        onChange={(event) => {
          // Update immediately (storage confirms asynchronously via watch).
          setEnabled(event.target.checked);
          featureEnabled(feature).setValue(event.target.checked);
        }}
      />
      <div>
        <label htmlFor={inputId} className="text-sm font-medium">
          {feature.name}
        </label>
        <p
          id={`${inputId}-description`}
          className={compact ? 'sr-only' : 'text-xs text-neutral-500'}
        >
          {feature.description}
        </p>
      </div>
    </li>
  );
}
