/**
 * AI Music Generator Engine
 * Transforms natural language text prompts (e.g. "retro synthwave jingle", "chill lofi sunset beat")
 * into rich multi-track synthesized audio tracks using algorithmic composition & Web Audio WAV rendering.
 */

export interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  vibe: string;
  duration: number; // seconds
  audioUrl: string;
  bpm: number;
  tags: string[];
  createdAt: string;
}

// Convert audio buffer to standard WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Interleave channel data
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

export async function generateAIMusic({
  prompt,
  vibe = 'Synthwave',
  duration = 15,
}: {
  prompt: string;
  vibe?: string;
  duration?: number;
}): Promise<GeneratedTrack> {
  const p = prompt.toLowerCase();

  // Determine musical parameters based on prompt keywords
  let bpm = 120;
  let scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C major pentatonic
  let leadType: OscillatorType = 'triangle';
  let bassType: OscillatorType = 'sawtooth';

  if (p.includes('lofi') || p.includes('chill') || p.includes('coffee') || vibe === 'Lofi') {
    bpm = 84;
    scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0]; // A minor
    leadType = 'sine';
    bassType = 'triangle';
  } else if (p.includes('synth') || p.includes('cyber') || p.includes('retro') || vibe === 'Synthwave') {
    bpm = 126;
    scale = [196.0, 220.0, 246.94, 293.66, 329.63, 392.0];
    leadType = 'sawtooth';
    bassType = 'sawtooth';
  } else if (p.includes('jingle') || p.includes('commercial') || p.includes('pop') || vibe === 'Jingle') {
    bpm = 135;
    scale = [261.63, 329.63, 392.0, 523.25, 659.25];
    leadType = 'triangle';
    bassType = 'sine';
  } else if (p.includes('trap') || p.includes('beat') || p.includes('hip hop') || vibe === 'Trap') {
    bpm = 140;
    scale = [174.61, 196.0, 207.65, 233.08, 261.63];
    leadType = 'sawtooth';
    bassType = 'sine';
  }

  // Render offline audio
  const sampleRate = 44100;
  const numSamples = sampleRate * duration;
  const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate);

  const beatSec = 60 / bpm;
  const totalBeats = Math.floor(duration / beatSec);

  // 1. Kick and Snare Drums loop
  for (let b = 0; b < totalBeats; b++) {
    const time = b * beatSec;

    // Kick on beat 0 and 2
    if (b % 4 === 0 || b % 4 === 2) {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    }

    // Snare / Clap on beat 1 and 3
    if (b % 4 === 1 || b % 4 === 3) {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(time);
      osc.stop(time + 0.13);
    }

    // Hi-hat on every 8th note
    [0, 0.5].forEach((offset) => {
      const hhTime = (b + offset) * beatSec;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(6000, hhTime);
      gain.gain.setValueAtTime(0.06, hhTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hhTime + 0.04);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(hhTime);
      osc.stop(hhTime + 0.05);
    });
  }

  // 2. Bassline
  for (let b = 0; b < totalBeats; b += 2) {
    const time = b * beatSec;
    const bassNote = scale[b % scale.length] / 2; // drop octave
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = bassType;
    osc.frequency.setValueAtTime(bassNote, time);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + beatSec * 1.8);
    osc.connect(gain);
    gain.connect(offlineCtx.destination);
    osc.start(time);
    osc.stop(time + beatSec * 1.9);
  }

  // 3. Melodic Hook / Arpeggio
  const totalNotes = totalBeats * 2;
  for (let n = 0; n < totalNotes; n++) {
    const time = n * (beatSec / 2);
    const noteFreq = scale[(n * 2 + (n % 3)) % scale.length];

    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = leadType;
    osc.frequency.setValueAtTime(noteFreq, time);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + beatSec * 0.45);
    osc.connect(gain);
    gain.connect(offlineCtx.destination);
    osc.start(time);
    osc.stop(time + beatSec * 0.46);
  }

  // Render the audio graph
  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  const audioUrl = URL.createObjectURL(wavBlob);

  const cleanTitle = prompt.length > 25 ? `${prompt.slice(0, 25)}...` : prompt;

  return {
    id: `track_${Date.now()}`,
    title: cleanTitle || 'Custom AI Soundtrack',
    prompt,
    vibe,
    duration,
    audioUrl,
    bpm,
    tags: [`#${vibe.toLowerCase()}`, '#aimusic', '#soundtrack', '#beats'],
    createdAt: 'Just now',
  };
}
