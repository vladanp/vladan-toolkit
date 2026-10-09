import type { Feature } from '@/lib/features';
import { blockNotificationPrompts } from './block-notification-prompts';
import { cleanReddit } from './clean-reddit';
import { defaultYoutubeQuality } from './default-youtube-quality';
import { flagDarkPatterns } from './flag-dark-patterns';
import { hideChatWidgets } from './hide-chat-widgets';
import { hideGoogleOneTap } from './hide-google-one-tap';
import { hideLinkedinPromotedPosts } from './hide-linkedin-promoted-posts';
import { hideNewsletterPopups } from './hide-newsletter-popups';
import { hideStickyBars } from './hide-sticky-bars';
import { hideWatchedSubscriptions } from './hide-watched-subscriptions';
import { hideYoutubeShorts } from './hide-youtube-shorts';
import { rejectCookieBanners } from './reject-cookie-banners';
import { removeTrackingParams } from './remove-tracking-params';
import { showYoutubeDislikes } from './show-youtube-dislikes';
import { skipAmpPages } from './skip-amp-pages';
import { skipYoutubeSponsors } from './skip-youtube-sponsors';

/** Every feature, in the order its switch appears (within its group) in the popup and settings. */
export const features: readonly Feature[] = [
  hideYoutubeShorts,
  hideWatchedSubscriptions,
  skipYoutubeSponsors,
  showYoutubeDislikes,
  defaultYoutubeQuality,
  cleanReddit,
  hideLinkedinPromotedPosts,
  rejectCookieBanners,
  hideNewsletterPopups,
  hideChatWidgets,
  blockNotificationPrompts,
  hideGoogleOneTap,
  hideStickyBars,
  removeTrackingParams,
  skipAmpPages,
  flagDarkPatterns,
];
