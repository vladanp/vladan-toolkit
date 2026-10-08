import type { Feature } from '@/lib/features';
import { cleanReddit } from './clean-reddit';
import { hideWatchedSubscriptions } from './hide-watched-subscriptions';
import { hideYoutubeShorts } from './hide-youtube-shorts';
import { rejectCookieBanners } from './reject-cookie-banners';
import { removeTrackingParams } from './remove-tracking-params';
import { skipYoutubeSponsors } from './skip-youtube-sponsors';
import { useOldReddit } from './use-old-reddit';

/** Every feature, in the order its switch appears (within its group) in the popup and settings. */
export const features: readonly Feature[] = [
  hideYoutubeShorts,
  hideWatchedSubscriptions,
  skipYoutubeSponsors,
  cleanReddit,
  useOldReddit,
  rejectCookieBanners,
  removeTrackingParams,
];
