import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@lichhoc.ai';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('[WARN] VAPID keys missing in environment variables. Web Push sending will fail.');
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SendPushOptions {
  subscription: PushSubscriptionData;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendWebPushNotification({
  subscription,
  title,
  body,
  url = '/my-schedule',
  icon = '/favicon.ico',
}: SendPushOptions) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys chưa được cấu hình trong môi trường server.');
  }

  const payload = JSON.stringify({
    title,
    body,
    url,
    icon,
  });

  return await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    },
    payload
  );
}
