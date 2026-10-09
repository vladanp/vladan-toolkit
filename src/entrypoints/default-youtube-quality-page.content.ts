import { keepPickedQuality } from '@/features/default-youtube-quality/page';

// Page world: calls YouTube's player API with the quality the isolated script puts on <html>.
export default defineContentScript({
  matches: ['*://www.youtube.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    keepPickedQuality();
  },
});
