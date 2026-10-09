import { useEffect, useState } from 'react';
import { features } from '@/features/registry';
import { type Feature, featureChoice, featureEnabled, featureGroups } from '@/lib/features';

/**
 * One on/off switch per registered feature, in a card per group, kept in sync with storage.
 * `compact` (the popup) shows descriptions only on hover and to screen readers.
 */
export function FeatureToggles({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-6'}>
      {featureGroups.map((group) => {
        const inGroup = features.filter((feature) => feature.group === group);
        if (inGroup.length === 0) return null;
        const headingId = `group-${group.toLowerCase().replaceAll(' ', '-')}`;
        return (
          <section key={group} aria-labelledby={headingId}>
            <h2
              id={headingId}
              className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              {group}
            </h2>
            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:divide-white/5 dark:bg-neutral-900 dark:ring-white/10">
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

// A sliding switch drawn on the checkbox itself (pseudo element knob), so it stays a native input.
const switchClass =
  'relative h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors duration-200 ' +
  'before:absolute before:top-0.5 before:left-0.5 before:size-4 before:rounded-full before:bg-white before:shadow ' +
  'before:transition-transform before:duration-200 checked:bg-blue-600 checked:before:translate-x-4 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ' +
  'disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none motion-reduce:before:transition-none ' +
  'dark:bg-neutral-700 dark:checked:bg-blue-500';

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
      className={`flex items-center gap-3 ${compact ? 'px-3 py-1' : 'px-4 py-3'}`}
      title={compact ? feature.description : undefined}
    >
      <div className="mr-auto min-w-0">
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium">
          {feature.name}
        </label>
        <p
          id={`${inputId}-description`}
          className={compact ? 'sr-only' : 'mt-0.5 text-xs text-neutral-500 dark:text-neutral-400'}
        >
          {feature.description}
        </p>
      </div>
      {feature.choice && <FeatureChoice feature={feature} choice={feature.choice} />}
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className={switchClass}
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
    </li>
  );
}

function FeatureChoice({
  feature,
  choice,
}: {
  feature: Feature;
  choice: NonNullable<Feature['choice']>;
}) {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    const setting = featureChoice(feature);
    setting.getValue().then(setValue);
    return setting.watch(setValue);
  }, [feature]);

  return (
    <select
      aria-label={choice.label}
      className="shrink-0 cursor-pointer rounded-lg bg-neutral-100 py-0.5 pr-1 pl-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-default dark:bg-neutral-800"
      value={value ?? choice.default}
      disabled={value === undefined}
      onChange={(event) => {
        setValue(event.target.value);
        featureChoice(feature).setValue(event.target.value);
      }}
    >
      {Object.entries(choice.options).map(([option, label]) => (
        <option key={option} value={option}>
          {label}
        </option>
      ))}
    </select>
  );
}
