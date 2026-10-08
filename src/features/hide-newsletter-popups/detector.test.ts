import { describe, expect, it } from 'vitest';
import { signupOffer } from './detector';

describe('signupOffer', () => {
  it.each([
    'Want 20% Off Your First Order? Yes, Please No, I’ll Continue Shopping',
    'Sign in to save 10% or more with a free membership',
    'Join our newsletter for exclusive offers',
    'Subscribe and get early access',
    'Sign up to get 15% off',
    'Unlock 10% discount',
  ])('recognizes "%s"', (text) => expect(signupOffer.test(text)).toBe(true));

  it.each([
    'Your location information indicates that you are in Serbia. Do you want to update your location?',
    'Your session is about to expire. Stay signed in?',
    'Are you 18 or older?',
    'Add $50.00 & Sign-Up to Unlock Free Standard Shipping',
  ])('leaves "%s" alone', (text) => expect(signupOffer.test(text)).toBe(false));
});
