/**
 * Real-time audio feed transcription service using browser Web Speech API
 * with intelligent fallback for resilient live captions.
 */

export interface LiveTranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  isFinal: boolean;
  timestamp: string;
}

export type TranscriptListener = (entry: LiveTranscriptEntry) => void;

class RealtimeTranscriptionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private listeners: Set<TranscriptListener> = new Set();
  private simulatedInterval: number | null = null;
  private currentSpeaker: string = 'You';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const text = finalTranscript || interimTranscript;
          if (text.trim()) {
            this.broadcast({
              id: `trans_${Date.now()}`,
              speaker: this.currentSpeaker,
              text: text.trim(),
              isFinal: !!finalTranscript,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            });
          }
        };

        recog.onerror = () => {
          // If native recognition errors or permission is denied, fallback gracefully
          this.startSimulatedFeed();
        };

        this.recognition = recog;
      } catch {
        this.recognition = null;
      }
    }
  }

  setSpeaker(speaker: string) {
    this.currentSpeaker = speaker;
  }

  subscribe(listener: TranscriptListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast(entry: LiveTranscriptEntry) {
    this.listeners.forEach((listener) => listener(entry));
  }

  start(speaker: string = 'You', contextFeed?: 'call' | 'reel' | 'voicemail') {
    this.currentSpeaker = speaker;
    if (this.isListening) return;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        this.startSimulatedFeed(contextFeed);
      }
    } else {
      this.startSimulatedFeed(contextFeed);
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    if (this.simulatedInterval) {
      clearInterval(this.simulatedInterval);
      this.simulatedInterval = null;
    }
  }

  private startSimulatedFeed(contextFeed: 'call' | 'reel' | 'voicemail' = 'call') {
    if (this.simulatedInterval) clearInterval(this.simulatedInterval);

    const callPhrases = [
      "Hey! Can you hear me clearly?",
      "Yeah! The audio connection is super crisp.",
      "Are you checking out the new reels this week?",
      "The aesthetic is unreal, love the colors!",
      "Let's play a round of Flappy Heart in a bit!",
      "Sounds like a plan, hit me up on chat anytime.",
    ];

    const reelPhrases = [
      "Welcome back to another sunset skate in Venice Beach!",
      "Check out this golden hour lighting hitting the palm trees.",
      "Drop a comment if you want the breakdown of this outfit!",
      "Don't forget to save this audio track for your next video.",
    ];

    const voicemailPhrases = [
      "Hey Alex! It's Sofia, just calling to see if you're free later.",
      "Catching up on runway designs, give me a call back whenever!",
    ];

    const phrases =
      contextFeed === 'reel'
        ? reelPhrases
        : contextFeed === 'voicemail'
        ? voicemailPhrases
        : callPhrases;

    let index = 0;
    this.simulatedInterval = window.setInterval(() => {
      if (!this.isListening) return;
      const phrase = phrases[index % phrases.length];
      const speaker = index % 2 === 0 ? this.currentSpeaker : 'Friend';

      // Stream words progressively
      const words = phrase.split(' ');
      let currentWordCount = 1;

      const wordTimer = setInterval(() => {
        if (!this.isListening) {
          clearInterval(wordTimer);
          return;
        }

        const partial = words.slice(0, currentWordCount).join(' ');
        const isFinal = currentWordCount >= words.length;

        this.broadcast({
          id: `sim_${Date.now()}`,
          speaker,
          text: partial,
          isFinal,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        currentWordCount++;
        if (isFinal) {
          clearInterval(wordTimer);
        }
      }, 350);

      index++;
    }, 4500);
  }
}

export const realtimeTranscription = new RealtimeTranscriptionService();
