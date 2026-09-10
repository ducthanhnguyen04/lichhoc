// Utility module for playing notification sounds via Web Audio API & HTML5 Audio

const SOUND_STORAGE_KEY = 'lichhoc_sound_enabled';

/**
 * Check whether sound notifications are enabled by the user.
 * Defaults to true.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  return stored !== 'false';
}

/**
 * Set sound notification preference.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Plays a pleasant crystal chime notification sound using Web Audio API.
 * This works reliably across browsers without requiring external audio file downloads.
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;

  try {
    // Attempt HTML5 Audio fallback first if audio file exists
    const audio = new Audio('/notification.mp3');
    audio.volume = 1.0; // Maximum volume
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio API synth if audio element playback is interrupted or fails
        playSynthesizedChime();
      });
    }
  } catch (err) {
    playSynthesizedChime();
  }
}

/**
 * Synthesizes a loud alarm clock sound sequence repeated 3 times (~11.5s) using Web Audio API.
 * Plays repeated alarm bursts: Bíp-bíp... Bíp-bíp... Bíp-bíp-bíp... Bíp-bíp-Dengg! (x3)
 */
export function playSynthesizedChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Single loop alarm pattern (~3.5s)
    const singlePulses = [
      // Burst 1
      { freq: 880, start: 0.0, dur: 0.14 },
      { freq: 1046.5, start: 0.18, dur: 0.16 },

      // Burst 2
      { freq: 880, start: 0.7, dur: 0.14 },
      { freq: 1046.5, start: 0.88, dur: 0.16 },

      // Burst 3
      { freq: 880, start: 1.4, dur: 0.14 },
      { freq: 1046.5, start: 1.58, dur: 0.14 },
      { freq: 1318.5, start: 1.76, dur: 0.22 },

      // Burst 4 (Finale Alarm Ring)
      { freq: 880, start: 2.3, dur: 0.14 },
      { freq: 1046.5, start: 2.48, dur: 0.14 },
      { freq: 1318.5, start: 2.66, dur: 0.7 },
    ];

    // Repeat 3 times with 0.5s pause
    const loopCount = 3;
    const singleDuration = 3.5;
    const pauseBetweenLoops = 0.5;

    for (let loop = 0; loop < loopCount; loop++) {
      const loopOffset = loop * (singleDuration + pauseBetweenLoops);

      singlePulses.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + loopOffset + start);

        // Maximum clear volume (0.85 gain)
        gain.gain.setValueAtTime(0.001, now + loopOffset + start);
        gain.gain.linearRampToValueAtTime(0.85, now + loopOffset + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + loopOffset + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + loopOffset + start);
        osc.stop(now + loopOffset + start + dur + 0.05);
      });
    }
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
}
