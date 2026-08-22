"use client";

class NotificationAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private stopTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudio();
    }
  }

  private initAudio() {
    try {
      if (!this.audio) {
        this.audio = new Audio("/sounds/new-order.mp3");
        this.audio.preload = "auto";
      }
    } catch (e) {
      console.warn("Audio initialization error:", e);
    }
  }

  /**
   * Play the new order notification sound for EXACTLY 2 seconds only.
   * MUST ONLY be called when a genuinely NEW order is detected.
   */
  public playNewOrderSound() {
    if (typeof window === "undefined") return;

    try {
      this.initAudio();

      if (this.stopTimer) {
        clearTimeout(this.stopTimer);
        this.stopTimer = null;
      }

      if (this.audio) {
        this.audio.currentTime = 0;
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Enforce exact 2-second playback limit
              this.stopTimer = setTimeout(() => {
                if (this.audio) {
                  this.audio.pause();
                  this.audio.currentTime = 0;
                }
              }, 2000);
            })
            .catch((err) => {
              console.warn("Audio autoplay blocked by browser policy:", err);
            });
        }
      }
    } catch (e) {
      console.warn("Failed to play notification audio:", e);
    }
  }
}

export const notificationAudio = new NotificationAudioPlayer();
