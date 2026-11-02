/**
 * Procedural Video Ad and Character Portrait Animation Renderer
 * Converts static product photos and portraits into dynamic, animated videos
 * using 2.5D parallax, particle systems, cinematic light sweeps, and MediaRecorder stream capture.
 */

export interface VideoAdConfig {
  mode: 'product_ad' | 'character_portrait';
  imageUrl: string;
  headline: string;
  subtitle: string;
  ctaText?: string;
  style: 'luxury_glow' | 'cinematic' | 'cyberpunk' | 'minimalist' | 'living_portrait' | 'hologram_aura';
  durationSeconds: number; // e.g. 5 to 10 seconds
  audioUrl?: string;
}

export async function renderDynamicVideo({
  config,
  onProgress,
}: {
  config: VideoAdConfig;
  onProgress?: (pct: number) => void;
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Load source image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = config.imageUrl;

      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = () => rej(new Error('Failed to load image for video rendering'));
      });

      // Setup 9:16 vertical video canvas (720 x 1280 or 540 x 960 for high perf)
      const width = 540;
      const height = 960;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2d canvas context');

      // Create stream & media recorder
      const stream = canvas.captureStream(30);

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      } catch {
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        resolve(videoUrl);
      };

      mediaRecorder.start();

      const fps = 30;
      const totalFrames = config.durationSeconds * fps;
      let frame = 0;

      // Particle system for luxury glow & cyberpunk
      const particles: { x: number; y: number; r: number; speedY: number; opacity: number; color: string }[] = [];
      const colors =
        config.style === 'cyberpunk'
          ? ['#06b6d4', '#ec4899', '#3b82f6', '#f43f5e']
          : ['#fbbf24', '#f59e0b', '#ec4899', '#ffffff'];

      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.5 + Math.random() * 3,
          speedY: 0.8 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.7,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      const drawFrame = () => {
        if (frame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        const t = frame / totalFrames; // 0 to 1
        const elapsed = frame / fps; // in seconds

        if (onProgress) {
          onProgress(Math.round(t * 100));
        }

        // 1. CLEAR & BACKGROUND
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Ambient colored background gradient based on style
        const bgGrad = ctx.createRadialGradient(
          width / 2,
          height * 0.45,
          50,
          width / 2,
          height * 0.45,
          width * 0.8
        );

        if (config.style === 'luxury_glow') {
          bgGrad.addColorStop(0, '#3b0764'); // deep purple
          bgGrad.addColorStop(0.6, '#18021a');
          bgGrad.addColorStop(1, '#050505');
        } else if (config.style === 'cyberpunk') {
          bgGrad.addColorStop(0, '#0369a1'); // cyan blue
          bgGrad.addColorStop(0.6, '#4a044e'); // neon magenta
          bgGrad.addColorStop(1, '#030712');
        } else if (config.style === 'hologram_aura') {
          bgGrad.addColorStop(0, '#064e3b'); // emerald teal
          bgGrad.addColorStop(0.6, '#0f172a');
          bgGrad.addColorStop(1, '#020617');
        } else {
          bgGrad.addColorStop(0, '#1f2937');
          bgGrad.addColorStop(0.6, '#111827');
          bgGrad.addColorStop(1, '#000000');
        }

        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. DRAW FLOATING PARTICLES (BACKGROUND)
        particles.forEach((p) => {
          p.y -= p.speedY;
          if (p.y < -10) p.y = height + 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity * (0.6 + Math.sin(elapsed * 4 + p.x) * 0.3);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 3. IMAGE LAYER (PRODUCT OR CHARACTER)
        ctx.save();

        if (config.mode === 'product_ad') {
          // Dynamic product motion: 3D float + slow cinematic zoom + tilt
          const scale = 1.0 + Math.sin(t * Math.PI) * 0.12;
          const floatY = Math.sin(elapsed * 2.2) * 14;
          const rotate = Math.sin(elapsed * 1.5) * 0.035;

          const cx = width / 2;
          const cy = height * 0.42 + floatY;

          ctx.translate(cx, cy);
          ctx.rotate(rotate);
          ctx.scale(scale, scale);

          // Soft drop shadow under product
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 35;
          ctx.shadowOffsetY = 25;

          // Maintain aspect ratio centered
          const aspect = img.width / img.height;
          const renderW = width * 0.72;
          const renderH = renderW / aspect;

          ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

          // Specular Light Sweep across product
          const sweepX = (t * (renderW * 2.8)) - renderW * 1.4;
          const sweepGrad = ctx.createLinearGradient(sweepX - 60, -renderH / 2, sweepX + 60, renderH / 2);
          sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
          sweepGrad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
          sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');

          ctx.fillStyle = sweepGrad;
          ctx.fillRect(-renderW / 2, -renderH / 2, renderW, renderH);

          ctx.restore();

          // 4. AD TYPOGRAPHY & BADGES
          // Floating Promotion Badge Top Left
          ctx.save();
          const badgeScale = 1 + Math.sin(elapsed * 3) * 0.04;
          ctx.translate(50, 90);
          ctx.scale(badgeScale, badgeScale);

          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.roundRect(0, 0, 110, 32, 16);
          ctx.fill();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('HOT DEAL 🔥', 55, 20);
          ctx.restore();

          // Main Headline & Subtitle at bottom
          ctx.textAlign = 'center';

          // Headline
          ctx.font = '900 32px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 15;
          ctx.fillText(config.headline || 'NEW ARRIVAL', width / 2, height * 0.76);

          // Subtitle
          ctx.font = '600 16px sans-serif';
          ctx.fillStyle = '#f472b6'; // pink-400
          ctx.fillText(config.subtitle || 'Experience the Next Generation', width / 2, height * 0.81);

          // Call to Action Button
          const ctaPulse = 1 + Math.sin(elapsed * 4) * 0.03;
          ctx.save();
          ctx.translate(width / 2, height * 0.88);
          ctx.scale(ctaPulse, ctaPulse);

          const btnGrad = ctx.createLinearGradient(-110, -22, 110, 22);
          btnGrad.addColorStop(0, '#f43f5e');
          btnGrad.addColorStop(1, '#a855f7');
          ctx.fillStyle = btnGrad;
          ctx.beginPath();
          ctx.roundRect(-110, -22, 220, 44, 22);
          ctx.fill();

          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(config.ctaText || 'SHOP NOW →', 0, 0);
          ctx.restore();

        } else {
          // CHARACTER PORTRAIT ANIMATION MODE
          // Breathing + Eye Blink simulation + Aura Glow
          const breathScale = 1.0 + Math.sin(elapsed * 1.8) * 0.025;
          const headSway = Math.sin(elapsed * 1.2) * 4;

          const cx = width / 2 + headSway;
          const cy = height * 0.44;

          ctx.translate(cx, cy);
          ctx.scale(breathScale, breathScale);

          // Aura glow behind character if hologram style
          if (config.style === 'hologram_aura') {
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 45;
          }

          const aspect = img.width / img.height;
          const renderW = width * 0.82;
          const renderH = renderW / aspect;

          ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

          // Natural eyelid blink every 3.5 seconds
          const blinkCycle = elapsed % 3.5;
          if (blinkCycle > 3.2 && blinkCycle < 3.42) {
            // Eyelid blink overlay
            const eyeY = -renderH * 0.08;
            ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
            ctx.beginPath();
            ctx.ellipse(-renderW * 0.14, eyeY, renderW * 0.09, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(renderW * 0.14, eyeY, renderW * 0.09, 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Character title overlay at bottom
          ctx.textAlign = 'center';
          ctx.font = '900 28px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 16;
          ctx.fillText(config.headline || 'AVATAR LIVE', width / 2, height * 0.82);

          ctx.font = '500 15px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(config.subtitle || 'Living Animated Portrait ✨', width / 2, height * 0.86);
        }

        frame++;
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    } catch (err) {
      reject(err);
    }
  });
}
