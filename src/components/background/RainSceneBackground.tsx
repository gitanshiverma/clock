import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Video Plane that textures the rain.mp4 video into Three.js scene
export const RainVideoPlane: React.FC<{
  videoSrc?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
}> = ({ videoSrc = '/rain.mp4', position = [0, 0, -5], scale = [42, 24, 1] }) => {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const tryPlay = () => {
      video.play().catch(() => {
        const unlock = () => {
          video.play().catch(() => {});
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    };

    video.addEventListener('loadeddata', () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      setVideoTexture(texture);
      tryPlay();
    });

    tryPlay();

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (videoTexture) videoTexture.dispose();
    };
  }, [videoSrc]);

  return (
    <mesh position={position}>
      <planeGeometry args={[scale[0], scale[1]]} />
      {videoTexture ? (
        <meshBasicMaterial map={videoTexture} depthWrite={false} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#05080f" depthWrite={false} />
      )}
    </mesh>
  );
};

// Aliased for backwards compatibility
export const SpringVideoPlane = RainVideoPlane;
export const WheelVideoPlane = RainVideoPlane;

// 3D Falling Rain Particle System with Wind Slant & Motion Depth
export const RainParticles: React.FC<{ count?: number }> = ({ count = 2200 }) => {
  const rainRef = useRef<THREE.LineSegments>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 6);
    const vel = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const idx = i * 6;
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 30 - 4;
      const z = (Math.random() - 0.5) * 25 + 1;
      const length = 0.4 + Math.random() * 0.55;

      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;

      pos[idx + 3] = x - 0.06; // Realistic wind slant
      pos[idx + 4] = y - length;
      pos[idx + 5] = z;

      vel[i] = 22 + Math.random() * 14;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((_, delta) => {
    if (!rainRef.current) return;
    const posAttr = rainRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 6;
      const fall = velocities[i] * delta;

      arr[idx + 1] -= fall;
      arr[idx + 4] -= fall;

      if (arr[idx + 1] < -5) {
        const x = (Math.random() - 0.5) * 50;
        const y = 20 + Math.random() * 8;
        const z = (Math.random() - 0.5) * 25 + 1;
        const length = 0.4 + Math.random() * 0.55;

        arr[idx] = x;
        arr[idx + 1] = y;
        arr[idx + 2] = z;

        arr[idx + 3] = x - 0.06;
        arr[idx + 4] = y - length;
        arr[idx + 5] = z;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#cbe5fe"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};

// Aliased for backwards compatibility
export const SpringFloatingParticles = RainParticles;
export const WheelFloatingParticles = RainParticles;

// Road Surface Rain Splashes & Expanding Water Ripples
export const RainSplashes: React.FC<{ count?: number }> = ({ count = 80 }) => {
  const splashRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 35;
      pos[idx + 1] = -3.4;
      pos[idx + 2] = (Math.random() - 0.5) * 25;
    }
    return { positions: pos };
  }, [count]);

  const rippleTexture = useMemo(() => {
    const s = 64;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    if (!splashRef.current) return;
    const mat = splashRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 7) * 0.15;
  });

  return (
    <points ref={splashRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        map={rippleTexture}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// City Night Out-of-Focus Bokeh Orbs in Background
export const BokehLights: React.FC = () => {
  const bokehRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 75;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#f59e0b'), // Golden Streetlight Amber
      new THREE.Color('#fbbf24'), // Warm Yellow
      new THREE.Color('#10b981'), // Emerald Green Traffic Light
      new THREE.Color('#06b6d4'), // Cyan Neon
      new THREE.Color('#38bdf8'), // Blue City Glow
      new THREE.Color('#f43f5e'), // Rose/Red Light
      new THREE.Color('#ffffff'), // Bright White
    ];

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 45;
      pos[idx + 1] = Math.random() * 14 + 0.2;
      pos[idx + 2] = -4.5 + (Math.random() - 0.5) * 2;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  const bokehTexture = useMemo(() => {
    const s = 128;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
    g.addColorStop(0.75, 'rgba(255, 255, 255, 0.2)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    if (!bokehRef.current) return;
    const t = clock.getElapsedTime();
    bokehRef.current.position.y = Math.sin(t * 0.25) * 0.12;
  });

  return (
    <points ref={bokehRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={75} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={75} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={3.2}
        vertexColors
        map={bokehTexture}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Aliased for backwards compatibility
export const WheelBokehLights = BokehLights;
export const SpringBokehLights = BokehLights;

// Complete 3D Rainy Video Environment Scene
export const RainEnvironmentScene: React.FC<{ videoSrc?: string }> = ({
  videoSrc = '/rain.mp4',
}) => {
  return (
    <group position={[0, 0, 0]}>
      {/* 3D Video Plane Backdrop playing rain.mp4 */}
      <RainVideoPlane videoSrc={videoSrc} position={[0, 0, -5]} scale={[42, 24, 1]} />

      {/* Layered 3D Physical Rain Particles streaming in 3D perspective */}
      <RainParticles count={2200} />
      <RainSplashes count={80} />
      <BokehLights />

      {/* Atmospheric Lighting matching rain video tones */}
      <ambientLight intensity={0.65} color="#0d1b2a" />

      {/* Golden streetlight glow on the right */}
      <pointLight position={[6, -1, -3]} intensity={4.5} color="#f59e0b" distance={22} decay={1.8} />
      <pointLight position={[10, 3, -4]} intensity={3.5} color="#fbbf24" distance={28} decay={2} />

      {/* Cool cyan & teal street glow on the left */}
      <pointLight position={[-7, -1, -3]} intensity={2.8} color="#06b6d4" distance={22} decay={2} />
      <pointLight position={[-12, 3, -4]} intensity={3.2} color="#10b981" distance={30} decay={2} />

      {/* Atmospheric Top Backlight */}
      <directionalLight position={[0, 8, -4]} intensity={0.8} color="#93c5fd" />
    </group>
  );
};

// Aliased for backwards compatibility
export const WheelEnvironmentScene = RainEnvironmentScene;
export const SpringEnvironmentScene = RainEnvironmentScene;

// Floating Interactive Camera for Background Parallax
const BackgroundCameraController: React.FC = () => {
  const { camera } = useThree();

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    // Gentle breathing camera movement + dynamic mouse tilt parallax
    camera.position.x = Math.sin(t * 0.15) * 0.25 + pointer.x * 0.6;
    camera.position.y = 0.2 + Math.cos(t * 0.2) * 0.12 + pointer.y * 0.35;
    camera.lookAt(0, 0, -5);
  });

  return null;
};

// Standalone Global 3D Dynamic Rain Video Background Component
export const RainSceneBackground: React.FC<{ videoSrc?: string }> = ({
  videoSrc = '/rain.mp4',
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ minHeight: '100vh', width: '100vw' }}>
      <Canvas
        camera={{ position: [0, 0.2, 8.5], fov: 46 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <RainEnvironmentScene videoSrc={videoSrc} />
        <BackgroundCameraController />
      </Canvas>
      {/* Subtle atmospheric vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
};

// Aliased for backwards compatibility
export const WheelSceneBackground = RainSceneBackground;
export const SpringSceneBackground = RainSceneBackground;


