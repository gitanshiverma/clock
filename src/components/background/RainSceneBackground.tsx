import React, { useRef, useEffect } from 'react';
import { BackgroundVideoOption } from '../../types';

export function getVideoSrcFromOption(opt: BackgroundVideoOption = 'rain'): string {
  switch (opt) {
    case 'study_01':
      return '/study_01.mp4';
    case 'study_02':
      return '/study_02.mp4';
    case 'study_03':
      return '/study_03.mp4';
    case 'study_04':
      return '/study_04.mp4';
    case 'coding':
      return '/coding.mp4';
    case 'dark':
      return '/dark.mp4';
    case 'music':
      return '/music.mp4';
    case 'spring':
      return '/spring.mp4';
    case 'wheel':
      return '/wheel.mp4';
    case 'rain':
    default:
      return '/rain.mp4';
  }
}

// 100% Upright, Proper, Full-Screen Video Background Component (Outside R3F Canvas)
export const RainSceneBackground: React.FC<{
  videoSrc?: string;
  videoOption?: BackgroundVideoOption;
}> = ({ videoSrc, videoOption = 'rain' }) => {
  const actualSrc = videoSrc || getVideoSrcFromOption(videoOption);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = actualSrc;
      videoRef.current.play().catch(() => {
        const unlock = () => {
          videoRef.current?.play().catch(() => {});
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    }
  }, [actualSrc]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black" style={{ minHeight: '100vh', width: '100vw' }}>
      {/* Hardware Accelerated Flat Video Background - Always Straight, Proper & Clear */}
      <video
        ref={videoRef}
        key={actualSrc}
        src={actualSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-center pointer-events-none"
        style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
};

export const WheelSceneBackground = RainSceneBackground;
export const SpringSceneBackground = RainSceneBackground;

// Safe Null Stubs for R3F Canvas Compatibility
export const RainEnvironmentScene: React.FC<any> = () => null;
export const WheelEnvironmentScene: React.FC<any> = () => null;
export const SpringEnvironmentScene: React.FC<any> = () => null;
export const RainVideoPlane: React.FC<any> = () => null;
export const BackgroundCameraController: React.FC<any> = () => null;
