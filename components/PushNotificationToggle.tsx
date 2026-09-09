'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, Send, ShieldAlert, Sparkles } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setLoading(false);
      return;
    }

    registerAndCheckSubscription();
  }, []);

  const registerAndCheckSubscription = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Lỗi khởi tạo Service Worker:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isSupported) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Push Notification.');
      return;
    }

    setSubscribing(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Bạn đã chặn thông báo. Vui lòng vào Cài đặt trình duyệt để cho phép thông báo.');
        setSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        alert('Lỗi: Cấu hình VAPID Public Key chưa sẵn sàng trên ứng dụng.');
        setSubscribing(false);
        return;
      }

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();

          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, action: 'unsubscribe' }),
          });
        }
        setIsSubscribed(false);
        setMessage('Đã tắt thông báo Web Push trên thiết bị này.');
      } else {
        // Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, action: 'subscribe' }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIsSubscribed(true);
          setMessage('🎉 Đã bật thông báo Web Push thành công! Bạn sẽ nhận nhắc nhở mỗi sáng.');
        } else {
          alert(data.error || 'Không thể lưu thông tin đăng ký thông báo');
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi bật/tắt Web Push:', err);
      alert(err.message || 'Lỗi mạng khi bật thông báo');
    } finally {
      setSubscribing(false);
    }
  };

  const handleTestPush = async () => {
    setTesting(true);
    setMessage(null);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            alert('Bạn chưa cấp quyền thông báo trên trình duyệt. Hãy bấm vào biểu tượng 🔒 hoặc ⚙️ cạnh thanh địa chỉ URL để cho phép Thông báo.');
            setTesting(false);
            return;
          }
        }

        // Try local notification test first
        try {
          new Notification('📚 Test Thông Báo LịchHọc.Ai', {
            body: 'Thông báo thử nghiệm trực tiếp trên thiết bị của bạn!',
            icon: '/favicon.ico',
          });
        } catch (localErr) {
          console.warn('Lỗi hiển thị local notification:', localErr);
        }
      }

      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || '🚀 Đã gửi Push Test thành công!');
      } else {
        alert(data.error || 'Lỗi khi gửi thông báo test từ máy chủ');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối khi test push');
    } finally {
      setTesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2 font-medium">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Trình duyệt hiện tại chưa hỗ trợ Web Push Notification. (Nếu dùng iPhone, hãy chọn "Thêm vào Màn hình chính").</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#0e2034]/90 border border-sky-900/40 space-y-4 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-xl shrink-0 ${isSubscribed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Thông Báo Hàng Ngày Trên Trình Duyệt</span>
              {isSubscribed && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Đã Bật
                </span>
              )}
            </h3>
            <p className="text-xs text-sky-200/70 mt-1 font-normal">
              Nhận thông báo nổ trực tiếp trên màn hình điện thoại và máy tính mỗi sáng trước giờ đi học.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={handleToggleSubscribe}
          disabled={loading || subscribing}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md sky-bounce ${
            isSubscribed
              ? 'bg-[#091727] hover:bg-sky-950/80 text-sky-200 border border-sky-500/30'
              : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
          } disabled:opacity-50`}
        >
          {subscribing || loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : isSubscribed ? (
            <>
              <BellOff className="w-4 h-4 text-sky-300/70" />
              <span>Tắt Thông Báo Trên Thiết Bị Này</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Bật Thông Báo Web Push Ngay</span>
            </>
          )}
        </button>

        {isSubscribed && (
          <button
            onClick={handleTestPush}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all sky-bounce disabled:opacity-50 flex items-center space-x-1.5"
          >
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{testing ? 'Đang gửi...' : 'Gửi Push Test Ngay'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
