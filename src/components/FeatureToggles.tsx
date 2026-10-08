import { useEffect, useState } from 'react';
import { features } from '@/features/registry';
import { type Feature, featureEnabled } from '@/lib/features';

/** One on/off switch per registered feature, kept in sync with storage. */
export function FeatureToggles() {
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {features.map((feature) => (
        <FeatureToggle key={feature.id} feature={feature} />
      ))}
    </ul>
  );
}

function FeatureToggle({ feature }: { feature: Feature }) {
  const [enabled, setEnabled] = useState<boolean>();

  useEffect(() => {
    const setting = featureEnabled(feature);
    setting.getValue().then(setEnabled);
    return setting.watch(setEnabled);
  }, [feature]);

  const inputId = `feature-${feature.id}`;
  const checked = enabled ?? feature.enabledByDefault;
  return (
    <li className="flex items-start gap-3 py-3">
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className="mt-0.5 size-4 accent-blue-600"
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
        <p id={`${inputId}-description`} className="text-xs text-neutral-500">
          {feature.description}
        </p>
      </div>
    </li>
  );
}
