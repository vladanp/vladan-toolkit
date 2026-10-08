// Runs in the page's own JavaScript world (see lib/main-world.ts): no extension APIs here.

/** The page APIs used here (missing in some contexts, e.g. insecure pages have no PushManager). */
export type PageWindow = Pick<Window, 'navigator'> & {
  Notification?: typeof Notification;
  PushManager?: typeof PushManager;
};

const declined = () =>
  new DOMException('Notification prompt declined by Vladan Toolkit', 'NotAllowedError');

/**
 * While the feature is on, notification permission requests the user didn't trigger (no click or
 * key press just before) are answered "denied" without Chrome showing its prompt. Sites that already
 * have an answer (allowed or blocked) are untouched.
 */
export function blockNotificationRequests(win: PageWindow, isOn: () => Promise<boolean>) {
  const unasked = () =>
    win.Notification?.permission === 'default' &&
    !(win.navigator.userActivation?.isActive ?? false);

  const notification = win.Notification;
  if (notification?.requestPermission) {
    const original = notification.requestPermission.bind(notification);
    notification.requestPermission = ((callback?: NotificationPermissionCallback) => {
      const decline = unasked(); // Checked now: user activation is gone after an await.
      const result = (async () => (decline && (await isOn()) ? ('denied' as const) : original()))();
      if (typeof callback === 'function') result.then(callback);
      return result;
    }) as typeof notification.requestPermission;
  }

  // Subscribing to push messages asks for the same permission.
  const push = win.PushManager?.prototype;
  if (push?.subscribe) {
    const originalSubscribe = push.subscribe;
    push.subscribe = async function subscribe(
      this: PushManager,
      options?: PushSubscriptionOptionsInit,
    ) {
      if (unasked() && (await isOn())) throw declined();
      return originalSubscribe.call(this, options);
    };
  }
}
