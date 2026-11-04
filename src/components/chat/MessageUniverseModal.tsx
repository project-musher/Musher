import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  X,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Star,
  Mic,
  Image as ImageIcon,
  Compass,
  Calendar,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, User } from '../../types';
import { sounds } from '../../utils/audio';

interface MessageUniverseModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageUniverseModal: React.FC<MessageUniverseModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const { messages, chats, currentUser } = useApp();
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'stars' | 'voice' | 'media'>('all');
  const [isAudioAmbienceActive, setIsAudioAmbienceActive] = useState(true);

  const chat = chats.find((c) => c.id === chatId);
  const peerUser = chat?.participants.find((p) => p.id !== currentUser.id);
  const chatMessages = messages[chatId] || [];

  // Filter messages to represent in the universe
  const universeMessages = chatMessages.filter((m) => {
    if (filterType === 'stars') return m.isStar;
    if (filterType === 'voice') return m.mediaType === 'voice';
    if (filterType === 'media') return m.mediaType === 'image';
    return m.isStar || m.mediaType === 'voice' || m.mediaType === 'image' || m.mediaType === 'time_capsule' || m.text;
  });

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    sounds.playCosmicChime();

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 30, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Cosmic Starfield Particle System
    const starCount = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xa78bfa), // soft purple
      new THREE.Color(0x38bdf8), // cyan
      new THREE.Color(0xf472b6), // pink
      new THREE.Color(0xfcd34d), // warm gold
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 120 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[idx] = color.r;
      starColors[idx + 1] = color.g;
      starColors[idx + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Interactive Celestial Objects
    const interactiveObjects: { mesh: THREE.Mesh; message: ChatMessage }[] = [];
    const points: THREE.Vector3[] = [];

    universeMessages.forEach((msg, index) => {
      // Position along a spiral galaxy curve
      const angle = index * 0.7;
      const radius = 15 + index * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(index * 0.5) * 8;
      const pos = new THREE.Vector3(x, y, z);
      points.push(pos);

      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;

      if (msg.mediaType === 'voice') {
        // Voice Notes are Orbiting Planets with Rings
        geometry = new THREE.SphereGeometry(2.4, 32, 32);
        material = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
          roughness: 0.3,
          metalness: 0.8,
        });

        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.position.copy(pos);

        // Ring
        const ringGeo = new THREE.RingGeometry(3.2, 4.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x7dd3fc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        planetMesh.add(ring);

        scene.add(planetMesh);
        interactiveObjects.push({ mesh: planetMesh, message: msg });
      } else if (msg.mediaType === 'image') {
        // Photo Memories are Glowing Nebulae / Octahedrons
        geometry = new THREE.OctahedronGeometry(2.6, 0);
        material = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xbe185d,
          emissiveIntensity: 0.7,
          roughness: 0.2,
          wireframe: false,
        });
        const nebulaMesh = new THREE.Mesh(geometry, material);
        nebulaMesh.position.copy(pos);
        scene.add(nebulaMesh);
        interactiveObjects.push({ mesh: nebulaMesh, message: msg });
      } else if (msg.timeCapsule) {
        // Time Capsules are Holographic Golden Dodecahedrons
        geometry = new THREE.DodecahedronGeometry(2.8, 0);
        material = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.9,
        });
        const capsuleMesh = new THREE.Mesh(geometry, material);
        capsuleMesh.position.copy(pos);
        scene.add(capsuleMesh);
        interactiveObjects.push({ mesh: capsuleMesh, message: msg });
      } else {
        // Standard Star Nodes
        geometry = new THREE.IcosahedronGeometry(1.8, 1);
        material = new THREE.MeshStandardMaterial({
          color: msg.isStar ? 0xfacc15 : 0xa855f7,
          emissive: msg.isStar ? 0xeab308 : 0x7e22ce,
          emissiveIntensity: msg.isStar ? 0.9 : 0.4,
          roughness: 0.4,
        });
        const starMesh = new THREE.Mesh(geometry, material);
        starMesh.position.copy(pos);
        scene.add(starMesh);
        interactiveObjects.push({ mesh: starMesh, message: msg });
      }
    });

    // Constellation lines connecting messages chronologically
    if (points.length > 1) {
      const lineCurve = new THREE.CatmullRomCurve3(points);
      const curvePoints = lineCurve.getPoints(points.length * 8);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.4,
        linewidth: 1,
      });
      const constellationLine = new THREE.Line(lineGeo, lineMat);
      scene.add(constellationLine);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 200);
    pointLight.position.set(0, 40, 20);
    scene.add(pointLight);

    // Orbit controls via direct pointer interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraAngle = { x: 0.3, y: 0 };
    let cameraDistance = 90;

    const updateCamera = () => {
      camera.position.x = Math.sin(cameraAngle.y) * Math.cos(cameraAngle.x) * cameraDistance;
      camera.position.y = Math.sin(cameraAngle.x) * cameraDistance;
      camera.position.z = Math.cos(cameraAngle.y) * Math.cos(cameraAngle.x) * cameraDistance;
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePos = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMousePos.x;
      const deltaY = clientY - prevMousePos.y;
      prevMousePos = { x: clientX, y: clientY };

      cameraAngle.y -= deltaX * 0.008;
      cameraAngle.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.x + deltaY * 0.008));
      updateCamera();
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance = Math.max(30, Math.min(180, cameraDistance + e.deltaY * 0.08));
      updateCamera();
    };

    // Raycaster for tapping nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = interactiveObjects.map((o) => o.mesh);
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let hitMesh: THREE.Object3D | null = intersects[0].object;
        while (hitMesh && !interactiveObjects.some((o) => o.mesh === hitMesh)) {
          hitMesh = hitMesh.parent;
        }
        const found = interactiveObjects.find((o) => o.mesh === hitMesh);
        if (found) {
          sounds.playTap();
          setSelectedMessage(found.message);
        }
      }
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow majestic galaxy rotation
      starField.rotation.y = elapsedTime * 0.02;

      interactiveObjects.forEach((obj, idx) => {
        obj.mesh.rotation.y = elapsedTime * 0.4 + idx;
        obj.mesh.rotation.x = Math.sin(elapsedTime * 0.5 + idx) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [isOpen, filterType, universeMessages.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none animate-fadeIn overflow-hidden">
      {/* Top Cosmic Header */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500/20 to-sky-500/20 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              Message Universe 🌌
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {peerUser?.name || 'Friendship'} Cosmos
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Important messages become stars, voice notes become planets, and memories form constellations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playCosmicChime();
              setIsAudioAmbienceActive(!isAudioAmbienceActive);
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
              isAudioAmbienceActive
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Cosmic Chimes Ambience"
          >
            {isAudioAmbienceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        <div ref={mountRef} className="w-full h-full" />

        {/* Orbit Control Tip Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Drag to orbit • Scroll to zoom • Tap stars & planets to inspect</span>
        </div>

        {/* Filter Floating Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 shadow-2xl">
          <button
            onClick={() => {
              sounds.playTap();
              setFilterType('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            All Constellations
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setFilterType('stars');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
              filterType === 'stars'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" /> Star Messages
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setFilterType('voice');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
              filterType === 'voice'
                ? 'bg-sky-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Voice Planets
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setFilterType('media');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
              filterType === 'media'
                ? 'bg-pink-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Photo Nebulae
          </button>
        </div>

        {/* Selected Memory Inspector Popover */}
        {selectedMessage && (
          <div className="absolute top-6 right-6 z-30 w-80 max-w-[90vw] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {selectedMessage.mediaType === 'voice' ? (
                    <Mic className="w-4 h-4" />
                  ) : selectedMessage.mediaType === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  )}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {selectedMessage.mediaType === 'voice'
                      ? 'Orbiting Planet'
                      : selectedMessage.mediaType === 'image'
                      ? 'Memory Nebula'
                      : 'Celestial Star Node'}
                  </span>
                  <span className="text-[10px] text-zinc-400">{selectedMessage.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-zinc-200">
              {selectedMessage.mediaType === 'image' && selectedMessage.mediaUrl && (
                <div className="mb-2 rounded-xl overflow-hidden border border-zinc-800">
                  <img
                    src={selectedMessage.mediaUrl}
                    alt="Memory"
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}

              {selectedMessage.mediaType === 'voice' && (
                <div className="mb-2 p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-sky-200 flex items-center justify-between">
                  <span className="font-semibold text-xs">🎙️ Voice Transmission</span>
                  <span className="text-[11px] text-sky-400 font-mono">
                    {selectedMessage.voiceDuration || 20}s
                  </span>
                </div>
              )}

              {selectedMessage.timeCapsule && (
                <div className="mb-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200">
                  <span className="font-bold text-xs block mb-1">⏳ {selectedMessage.timeCapsule.title}</span>
                  <span className="text-[11px] text-amber-300/80">
                    {selectedMessage.timeCapsule.isUnlocked
                      ? selectedMessage.timeCapsule.revealedText
                      : 'Sealed Time Capsule'}
                  </span>
                </div>
              )}

              <p className="leading-relaxed bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60">
                {selectedMessage.text || 'Shared a media memory.'}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                {Object.keys(selectedMessage.reactions || {}).length} reactions
              </span>
              <span className="font-mono text-[10px] text-zinc-500">ID: {selectedMessage.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
