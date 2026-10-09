import { describe, expect, it, vi } from 'vitest';
import { blockOneTap } from './page';

const googleProvider = { configURL: 'https://accounts.google.com/gsi/fedcm.json', clientId: 'x' };

function fakeWindow() {
  const get = vi.fn(async () => null);
  const win = { navigator: { credentials: { get } } } as unknown as Window;
  return { win, get };
}

describe('blockOneTap', () => {
  it('rejects Google One Tap (FedCM) requests while on', async () => {
    const { win, get } = fakeWindow();
    blockOneTap(win, async () => true);
    await expect(
      win.navigator.credentials.get({ identity: { providers: [googleProvider] } } as never),
    ).rejects.toMatchObject({ name: 'NotAllowedError' });
    expect(get).not.toHaveBeenCalled();
  });

  it('lets everything else through', async () => {
    const { win, get } = fakeWindow();
    blockOneTap(win, async () => true);
    const requests = [
      { identity: { mode: 'active', providers: [googleProvider] } }, // A clicked button.
      { identity: { mode: 'button', providers: [googleProvider] } },
      { identity: { providers: [{ configURL: 'https://idp.example/fedcm.json' }] } },
      { publicKey: { challenge: new Uint8Array(1) } }, // Passkeys.
      { password: true },
    ];
    for (const request of requests) await win.navigator.credentials.get(request as never);
    expect(get).toHaveBeenCalledTimes(requests.length);

    const off = fakeWindow();
    blockOneTap(off.win, async () => false);
    await off.win.navigator.credentials.get({ identity: { providers: [googleProvider] } } as never);
    expect(off.get).toHaveBeenCalledTimes(1);
  });
});
