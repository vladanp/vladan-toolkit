import type { Feature } from '@/lib/features';
import { hideYoutubeShorts } from './hide-youtube-shorts';

/** Every feature, in the order shown in the popup and settings page. New features must be added here. */
export const features: readonly Feature[] = [hideYoutubeShorts];
