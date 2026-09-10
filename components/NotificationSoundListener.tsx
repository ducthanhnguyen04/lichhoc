'use client';

import { useEffect } from 'react';
import { playNotificationChime } from '@/lib/sound';

export default function NotificationSoundListener() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'PLAY_NOTIFICATION_SOUND' || event.data.type === 'PUSH_NOTIFICATION_RECEIVED')) {
        playNotificationChime();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
