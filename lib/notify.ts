'use server';

import webpush from 'web-push';

// Thin wrapper to send Web Push notifications.
// In a real deployment, use the `web-push` library with your VAPID keys.

export type PushSubscriptionLike = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@toyota-sos.com',
      publicVapidKey,
      privateVapidKey
    );
  } catch (err) {
    console.error('Failed to set VAPID details:', err);
  }
} else {
  console.warn('VAPID keys are missing. Web Push will not work.');
}

export async function sendWebPush(
  subscription: PushSubscriptionLike,
  payload: Record<string, unknown>
): Promise<void> {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn('VAPID keys not configured, skipping push');
    return;
  }

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    console.warn('Invalid subscription object, skipping push', subscription);
    return;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload)
    );
  } catch (err: any) {
    if (err.statusCode === 410) {
      // Subscription is gone (expired/unsubscribed)
      // We could remove it from DB here if we had DB access, 
      // but usually we just ignore or let a cleanup job handle it.
      console.warn('Subscription expired/gone:', subscription.endpoint);
    } else {
      console.error('Error sending web push:', err);
    }
    // Don't throw, just log, so we don't break the main flow
  }
}
