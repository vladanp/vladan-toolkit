import { defaultYoutubeQuality } from '@/features/default-youtube-quality';
import { qualityAttribute } from '@/features/default-youtube-quality/page';
import { featureChoice, whileEnabled } from '@/lib/features';

// Tells the page world script (default-youtube-quality-page) the picked quality while the switch is on.
export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    const html = document.documentElement;
    const stop = await whileEnabled(defaultYoutubeQuality, () => {
      const picked = featureChoice(defaultYoutubeQuality);
      let on = true;
      const show = (quality: string) => {
        if (on) html.setAttribute(qualityAttribute, quality);
      };
      picked.getValue().then(show);
      const unwatch = picked.watch(show);
      return () => {
        on = false;
        unwatch();
        html.removeAttribute(qualityAttribute);
      };
    });
    ctx.onInvalidated(stop);
  },
});
