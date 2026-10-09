// Runs in the page's own JavaScript world (see lib/main-world.ts): no extension APIs here.

interface IdentityRequest {
  mode?: string;
  providers?: { configURL?: unknown }[];
}

const google = /^https:\/\/accounts\.google\.com\//;

/**
 * Makes the browser's native (FedCM) "Sign in with Google" One Tap prompt fail as if dismissed, while
 * the feature is on. Requests from a clicked sign in button (mode "active"/"button") go through.
 */
export function blockOneTap(win: Window, isOn: () => Promise<boolean>) {
  const credentials = win.navigator.credentials;
  if (!credentials?.get) return;
  const original = credentials.get.bind(credentials);
  credentials.get = async (options?: CredentialRequestOptions) => {
    const identity = (options as { identity?: IdentityRequest } | undefined)?.identity;
    const oneTap =
      identity !== undefined &&
      identity.mode !== 'active' &&
      identity.mode !== 'button' &&
      (identity.providers ?? []).some(
        (p) => typeof p.configURL === 'string' && google.test(p.configURL),
      );
    if (oneTap && (await isOn())) {
      throw new DOMException('Sign in prompt blocked by Vladan Toolkit', 'NotAllowedError');
    }
    return original(options);
  };
}
