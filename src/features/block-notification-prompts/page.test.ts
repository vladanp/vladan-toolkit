import { describe, expect, it, vi } from 'vitest';
import { blockNotificationRequests, type PageWindow } from './page';

/** A minimal page `window` with the notification and push APIs. */
function fakeWindow(permission: NotificationPermission, userClicked = false) {
  const requestPermission = vi.fn(async () => 'granted' as const);
  const subscribe = vi.fn(async () => ({ endpoint: 'https://push.example/1' }));
  const PushManager = { prototype: { subscribe } };
  const win = {
    Notification: { permission, requestPermission },
    PushManager,
    navigator: { userActivation: { isActive: userClicked } },
  } as unknown as PageWindow & { Notification: typeof Notification };
  // A push manager instance: its `subscribe` comes from the (patched) prototype.
  const push = Object.create(PushManager.prototype) as { subscribe(): Promise<unknown> };
  return { win, requestPermission, subscribe, push };
}

const on = async () => true;
const off = async () => false;

describe('blockNotificationRequests', () => {
  it('declines unasked requests without showing the prompt, also via the old callback style', async () => {
    const { win, requestPermission } = fakeWindow('default');
    blockNotificationRequests(win, on);
    const callback = vi.fn();
    expect(await win.Notification.requestPermission(callback)).toBe('denied');
    expect(callback).toHaveBeenCalledWith('denied');
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('lets requests through when switched off, after a click, or once the site has an answer', async () => {
    for (const [permission, clicked, isOn] of [
      ['default', false, off],
      ['default', true, on],
      ['granted', false, on],
      ['denied', false, on],
    ] as const) {
      const { win, requestPermission } = fakeWindow(permission, clicked);
      blockNotificationRequests(win, isOn);
      await win.Notification.requestPermission();
      expect(requestPermission, `${permission} clicked=${clicked}`).toHaveBeenCalledTimes(1);
    }
  });

  it('declines unasked push subscriptions too', async () => {
    const { win, push, subscribe } = fakeWindow('default');
    blockNotificationRequests(win, on);
    await expect(push.subscribe()).rejects.toThrow('declined');
    expect(subscribe).not.toHaveBeenCalled();

    const granted = fakeWindow('granted');
    blockNotificationRequests(granted.win, on);
    await granted.push.subscribe();
    expect(granted.subscribe).toHaveBeenCalledTimes(1);
  });
});
