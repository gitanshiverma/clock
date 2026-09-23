import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TaskBlock } from '../../types';
import { RainEnvironmentScene } from '../background/RainSceneBackground';

export type TaskFilterMode = 'next12h' | 'am' | 'pm' | 'all';

// Convert "HH:MM" to hours (0..12) for 12-hour clock face
function timeTo12Hours(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  const hour12 = h % 12;
  return hour12 + m / 60;
}

// Helper to check if current time is within, past, or before task
export function getTaskTimeStatus(task: TaskBlock, now: Date): 'past' | 'active' | 'upcoming' {
  if (task.completed) return 'past';

  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);

  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const currentMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const isActive = endMin > startMin
    ? currentMin >= startMin && currentMin < endMin
    : currentMin >= startMin || currentMin < endMin;

  if (isActive) return 'active';
  return 'upcoming';
}

// Smart 24h filter for 12h clock face - correctly handles 24h wrap-around, Next 12h window, AM, PM, and All modes
export function isTaskVisibleOnClock(
  task: TaskBlock,
  now: Date,
  mode: TaskFilterMode = 'next12h'
): boolean {
  if (task.completed) return false;

  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);

  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const currentMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // 1. If task is currently active right now, always show on clock
  const isActive = endMin > startMin
    ? currentMin >= startMin && currentMin < endMin
    : currentMin >= startMin || currentMin < endMin;

  if (isActive) return true;

  // 2. Filter modes
  if (mode === 'am') {
    // Show tasks starting in AM or ending in AM
    return startH < 12 || (endMin > 0 && endMin <= 720 && endMin !== startMin);
  }
  if (mode === 'pm') {
    // Show tasks starting in PM or spanning across PM
    return startH >= 12 || (startMin < 720 && (endMin > 720 || endMin < startMin));
  }
  if (mode === 'all') {
    return true;
  }

  // 'next12h' (default):
  // Show active tasks and any tasks that start within the next 12 hours (720 minutes) from now
  const minutesUntilStart = (startMin - currentMin + 1440) % 1440;
  return minutesUntilStart > 0 && minutesUntilStart <= 720;
}



// Generate the authentic Dial Texture matching the Schoolhouse Wall Clock with zero white margin
function createAuthenticSchoolhouseDialTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const center = size / 2;
  const dialRadius = size * 0.48;

  // 1. Fill entire texture with solid deep black (#000000)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // 2. Draw warm parchment / ivory dial face circle inside dialRadius
  const dialGrad = ctx.createRadialGradient(
    center * 0.95,
    center * 0.92,
    40,
    center,
    center,
    dialRadius
  );
  dialGrad.addColorStop(0, '#fffef9');
  dialGrad.addColorStop(0.65, '#f7f2e4');
  dialGrad.addColorStop(0.92, '#ece3ce');
  dialGrad.addColorStop(1, '#ddd1b8');

  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(center, center, dialRadius, 0, Math.PI * 2);
  ctx.fill();

  // Slim, refined black rim around the dial
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.stroke();

  // Thin inner concentric circle line
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center, center, dialRadius * 0.97, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Minute & Hour Track on Perimeter
  const trackRadius = dialRadius * 0.925;
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isHour = i % 5 === 0;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    if (isHour) {
      // Bold rectangular/square hour marker tick
      ctx.fillStyle = '#000000';
      const tickWidth = 12;
      const tickLength = 34;
      ctx.fillRect(-tickWidth / 2, -trackRadius, tickWidth, tickLength);
    } else {
      // Crisp thin minute ticks
      ctx.fillStyle = '#1e2024';
      const tickWidth = 4;
      const tickLength = 16;
      ctx.fillRect(-tickWidth / 2, -trackRadius, tickWidth, tickLength);
    }
    ctx.restore();
  }

  // 4. Vintage Mid-Century Geometric Numerals
  const numbers = [
    { num: '12', x: 0, y: -0.69 },
    { num: '1', x: 0.355, y: -0.60 },
    { num: '2', x: 0.615, y: -0.35 },
    { num: '3', x: 0.69, y: 0 },
    { num: '4', x: 0.615, y: 0.35 },
    { num: '5', x: 0.355, y: 0.60 },
    { num: '6', x: 0, y: 0.69 },
    { num: '7', x: -0.355, y: 0.60 },
    { num: '8', x: -0.615, y: 0.35 },
    { num: '9', x: -0.69, y: 0 },
    { num: '10', x: -0.615, y: -0.35 },
    { num: '11', x: -0.355, y: -0.60 },
  ];

  ctx.fillStyle = '#0a0a0c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 152px "Century Gothic", "Futura", "Jost", "Inter", sans-serif';

  numbers.forEach(({ num, x, y }) => {
    const posX = center + x * dialRadius;
    const posY = center + y * dialRadius;
    ctx.fillText(num, posX, posY);
  });

  // 5. Vintage Emblem under 12
  ctx.fillStyle = '#000000';
  const logoY = center - dialRadius * 0.38;
  ctx.fillRect(center - 24, logoY - 18, 14, 28);
  ctx.fillRect(center - 6, logoY - 8, 14, 18);
  ctx.fillRect(center + 12, logoY - 22, 14, 32);

  ctx.font = '700 24px "Inter", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('TIMEBLOCKS', center, logoY + 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// 2D Plane Sector Zone for Each Scheduled Study Block on the 3D Clock Dial (True Translucent Glowing Planes)
const TaskZonePlane: React.FC<{
  task: TaskBlock;
  radiusInner: number;
  radiusOuter: number;
  now: Date;
  index: number;
}> = ({ task, radiusInner, radiusOuter, now, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const status = getTaskTimeStatus(task, now);

  // When task is completed (past), remove block color completely from clock face
  if (status === 'past') {
    return null;
  }

  const { startH, endH, durationH } = useMemo(() => {
    let start = timeTo12Hours(task.startTime);
    let end = timeTo12Hours(task.endTime);
    if (end <= start) end += 12;
    const duration = end - start;
    return { startH: start, endH: end, durationH: duration };
  }, [task.startTime, task.endTime]);

  const { thetaStart, thetaLength, midAngle, startAngle, endAngle } = useMemo(() => {
    const sAngle = Math.PI / 2 - (startH / 12) * Math.PI * 2;
    const eAngle = Math.PI / 2 - (endH / 12) * Math.PI * 2;
    const safeDuration = Math.min(12, Math.max(0.1, durationH));
    const length = (safeDuration / 12) * Math.PI * 2;
    const mid = (sAngle + eAngle) / 2;
    return { thetaStart: eAngle, thetaLength: length, midAngle: mid, startAngle: sAngle, endAngle: eAngle };
  }, [startH, endH, durationH]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (status === 'active') {
      const pulse = 0.38 + Math.sin(clock.getElapsedTime() * 3.5) * 0.08;
      mat.opacity = pulse;
      mat.emissiveIntensity = 0.25 + Math.sin(clock.getElapsedTime() * 3.5) * 0.12;
    } else {
      mat.opacity = 0.28;
      mat.emissiveIntensity = 0.08;
    }
  });

  const baseColor = useMemo(() => new THREE.Color(task.color), [task.color]);
  const zoneZ = 0.015 + index * 0.002;

  const labelRadius = (radiusInner + radiusOuter) / 2;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelY = Math.sin(midAngle) * labelRadius;

  return (
    <group position={[0, 0, zoneZ]}>
      {/* 2D Plane Ring Sector with Semi-Transparency (Numbers Underneath Clearly Visible) */}
      <mesh ref={meshRef}>
        <ringGeometry args={[radiusInner, radiusOuter, 64, 1, thetaStart, thetaLength]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={status === 'active' ? 0.3 : 0.08}
          side={THREE.DoubleSide}
          transparent
          opacity={status === 'active' ? 0.40 : 0.28}
          roughness={0.3}
          metalness={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* Start Radial Border Line */}
      <mesh
        position={[
          (Math.cos(startAngle) * (radiusInner + radiusOuter)) / 2,
          (Math.sin(startAngle) * (radiusInner + radiusOuter)) / 2,
          0.001,
        ]}
        rotation={[0, 0, startAngle - Math.PI / 2]}
      >
        <planeGeometry args={[0.02, radiusOuter - radiusInner]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.6} />
      </mesh>

      {/* End Radial Border Line */}
      <mesh
        position={[
          (Math.cos(endAngle) * (radiusInner + radiusOuter)) / 2,
          (Math.sin(endAngle) * (radiusInner + radiusOuter)) / 2,
          0.001,
        ]}
        rotation={[0, 0, endAngle - Math.PI / 2]}
      >
        <planeGeometry args={[0.02, radiusOuter - radiusInner]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.6} />
      </mesh>

      {/* Zone Label - 100% Transparent Background with Glowing Cyber Text (No Black Box) */}
      {durationH >= 0.35 && (
        <Html
          position={[labelX, labelY, 0.005]}
          center
          distanceFactor={10}
          className="pointer-events-none select-none"
        >
          <div
            className="text-[10px] font-mono-cyber font-extrabold whitespace-nowrap tracking-wide select-none"
            style={{
              backgroundColor: 'transparent',
              color: task.color,
              textShadow: `0 0 5px ${task.color}, 0 0 10px ${task.color}80, 1px 1px 2px rgba(0,0,0,0.85)`,
            }}
          >
            {task.title.length > 14 ? `${task.title.slice(0, 14)}…` : task.title}
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Clock Body with 100% Solid Black Border & No White Gap
const ClockBody: React.FC<{ tasks: TaskBlock[]; now: Date; filterMode?: TaskFilterMode }> = ({
  tasks,
  now,
  filterMode = 'next12h',
}) => {
  const dialTexture = useMemo(() => createAuthenticSchoolhouseDialTexture(), []);

  // Filter tasks based on 24-hour mode & active state
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => isTaskVisibleOnClock(task, now, filterMode));
  }, [tasks, now, filterMode]);

  return (
    <group>
      {/* 1. Deep Solid Black Outer Casing (Z=-0.16) */}
      <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.58, 3.65, 0.22, 64]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Slim Elegant Solid Black Bezel Ring (Z=0.004) */}
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[3.45, 3.65, 64]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.35}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Main Luminous Ivory Dial Plate (Z=0.00) */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[3.50, 64]} />
        <meshBasicMaterial map={dialTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. 2D Scheduled Task Planes / Zones Layer (Z >= 0.015) - Radius neatly inside dial */}
      {visibleTasks.map((task, idx) => (
        <TaskZonePlane
          key={task.id}
          task={task}
          radiusInner={1.42}
          radiusOuter={3.28}
          now={now}
          index={idx}
        />
      ))}
    </group>
  );
};


// Exact Hands Matching the Reference Photo with Instant Real-Time Sync
const ClockHands: React.FC<{ now?: Date }> = ({ now }) => {
  const secondHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Read wall-clock time directly from Date object for zero-latency background recovery
    const live = now ?? new Date();
    const ms = live.getMilliseconds();
    const sec = live.getSeconds() + ms / 1000;
    const min = live.getMinutes() + sec / 60;
    const hr = (live.getHours() % 12) + min / 60;

    const secondAngle = -(sec / 60) * Math.PI * 2;
    const minuteAngle = -(min / 60) * Math.PI * 2;
    const hourAngle = -(hr / 12) * Math.PI * 2;

    if (secondHandRef.current) secondHandRef.current.rotation.z = secondAngle;
    if (minuteHandRef.current) minuteHandRef.current.rotation.z = minuteAngle;
    if (hourHandRef.current) hourHandRef.current.rotation.z = hourAngle;
  });

  return (
    <group position={[0, 0, 0.05]}>
      {/* 1. HOUR HAND: Broad, thick rectangular matte-black baton */}
      <group ref={hourHandRef} position={[0, 0, 0.03]}>
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[0.28, 1.76, 0.03]} />
          <meshStandardMaterial
            color="#0a0a0c"
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <boxGeometry args={[0.28, 0.84, 0.03]} />
          <meshStandardMaterial
            color="#0a0a0c"
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* 2. MINUTE HAND: Long tapered black pointer reaching minute track */}
      <group ref={minuteHandRef} position={[0, 0, 0.06]}>
        <mesh position={[0, 1.40, 0]}>
          <boxGeometry args={[0.16, 2.80, 0.025]} />
          <meshStandardMaterial
            color="#070709"
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <boxGeometry args={[0.16, 1.05, 0.025]} />
          <meshStandardMaterial
            color="#070709"
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* 3. SECOND HAND: Smooth continuous precision red needle */}
      <group ref={secondHandRef} position={[0, 0, 0.09]}>
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[0.025, 2.90, 0.015]} />
          <meshStandardMaterial
            color="#e11d48"
            emissive="#e11d48"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 2.90, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, -0.65, 0]}>
          <boxGeometry args={[0.035, 1.3, 0.015]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
        <mesh position={[0, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 32]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* 4. Center Black Pivot Cap */}
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.06, 32]} />
        <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 32]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
};

export interface Clock3DProps {
  tasks: TaskBlock[];
  simulatedTime?: Date | null;
  filterMode?: TaskFilterMode;
  showClock?: boolean;
}

// Main 3D Scene Assembly with Dynamic Rainy Street Environment
export const Clock3D: React.FC<Clock3DProps> = ({
  tasks,
  simulatedTime,
  filterMode = 'next12h',
  showClock = true,
}) => {
  const [liveDate, setLiveDate] = React.useState<Date>(new Date());

  useFrame(() => {
    if (simulatedTime) {
      setLiveDate(simulatedTime);
    } else {
      setLiveDate(new Date());
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Rain Video Environment Scene with Rain Particles & Atmospheric Lighting */}
      <RainEnvironmentScene />

      <ambientLight intensity={1.15} color="#ffffff" />
      <directionalLight position={[3, 6, 7]} intensity={1.2} color="#fffdfa" />
      <directionalLight position={[-5, -3, 5]} intensity={0.4} color="#f1f5f9" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#fffbf2" distance={10} />

      {showClock && (
        <group>
          <ClockBody tasks={tasks} now={liveDate} filterMode={filterMode} />
          <ClockHands now={liveDate} />
        </group>
      )}
    </group>
  );
};

// Camera & Orbit Controller with Position Locking and Reset
const CameraController: React.FC<{
  cameraPreset: 'front' | 'cyber' | 'top';
  isLocked: boolean;
  resetKey: number;
}> = ({ cameraPreset, isLocked, resetKey }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    let targetPos: [number, number, number] = [0.5, -0.8, 8.6];
    if (cameraPreset === 'front') targetPos = [0, 0, 9.0];
    else if (cameraPreset === 'top') targetPos = [0, 8.2, 3];

    camera.position.set(...targetPos);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraPreset, resetKey, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={!isLocked}
      enableZoom={!isLocked}
      enableRotate={!isLocked}
      minDistance={3.5}
      maxDistance={16}
      maxPolarAngle={Math.PI / 1.7}
      dampingFactor={0.05}
    />
  );
};

export interface Clock3DCanvasProps extends Clock3DProps {
  cameraPreset?: 'front' | 'cyber' | 'top';
  isLocked?: boolean;
  resetKey?: number;
  filterMode?: TaskFilterMode;
  showClock?: boolean;
}

// Canvas Wrapper with OrbitControls & Fix Position support
export const Clock3DCanvas: React.FC<Clock3DCanvasProps> = ({
  tasks,
  simulatedTime,
  cameraPreset = 'cyber',
  isLocked = false,
  resetKey = 0,
  filterMode = 'next12h',
  showClock = true,
}) => {
  return (
    <div
      className={`w-full h-full relative select-none ${
        isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
      style={{ minHeight: '100%', width: '100%', height: '100%' }}
    >
      <Canvas
        camera={{ position: [0.5, -0.8, 8.6], fov: 46 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Clock3D
            tasks={tasks}
            simulatedTime={simulatedTime}
            filterMode={filterMode}
            showClock={showClock}
          />
          <CameraController
            cameraPreset={cameraPreset}
            isLocked={isLocked}
            resetKey={resetKey}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

