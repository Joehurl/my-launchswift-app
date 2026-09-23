import React from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface LaunchSwiftIconProps {
  size?: number;
}

export function LaunchSwiftIcon({ size = 120 }: LaunchSwiftIconProps) {
  const s = size;
  const r = s * 0.22; // corner radius

  return (
    <Svg width={s} height={s} viewBox="0 0 120 120">
      <Defs>
        {/* Background gradient */}
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#161B22" />
          <Stop offset="1" stopColor="#0D1117" />
        </LinearGradient>

        {/* Blue glow behind rocket */}
        <RadialGradient id="glowGrad" cx="55%" cy="45%" r="40%">
          <Stop offset="0" stopColor="#2F81F7" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#2F81F7" stopOpacity="0" />
        </RadialGradient>

        {/* Flame gradient */}
        <LinearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FCD34D" />
          <Stop offset="0.5" stopColor="#F97316" />
          <Stop offset="1" stopColor="#EF4444" stopOpacity="0" />
        </LinearGradient>

        {/* Rocket body gradient */}
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E6EDF3" />
          <Stop offset="1" stopColor="#C9D1D9" />
        </LinearGradient>
      </Defs>

      {/* Background rounded square */}
      <Rect x="0" y="0" width="120" height="120" rx={r} ry={r} fill="url(#bgGrad)" />

      {/* Blue glow aura */}
      <Rect x="0" y="0" width="120" height="120" rx={r} ry={r} fill="url(#glowGrad)" />

      {/* Rocket group — rotated 45° pointing up-right, centered */}
      <G
        transform="translate(60, 60) rotate(-45) translate(-22, -28)"
      >
        {/* Flame / exhaust */}
        <Path
          d="M16 58 Q22 72 28 58"
          fill="url(#flameGrad)"
          opacity="0.95"
        />
        <Path
          d="M18 56 Q22 66 26 56"
          fill="#FCD34D"
          opacity="0.8"
        />

        {/* Left fin */}
        <Path
          d="M10 46 L16 36 L16 50 Z"
          fill="#8B949E"
        />

        {/* Right fin */}
        <Path
          d="M34 46 L28 36 L28 50 Z"
          fill="#8B949E"
        />

        {/* Rocket body */}
        <Path
          d="M16 50 L16 28 Q22 10 28 28 L28 50 Z"
          fill="url(#bodyGrad)"
        />

        {/* Rocket nose cone */}
        <Path
          d="M16 28 Q22 10 28 28 Z"
          fill="#E6EDF3"
        />

        {/* Window */}
        <Circle cx="22" cy="36" r="5" fill="#2F81F7" />
        <Circle cx="22" cy="36" r="3" fill="#58A6FF" opacity="0.7" />
        <Circle cx="20.5" cy="34.5" r="1.2" fill="#FFFFFF" opacity="0.6" />
      </G>

      {/* Subtle star dots */}
      <Circle cx="20" cy="22" r="1" fill="#E6EDF3" opacity="0.4" />
      <Circle cx="95" cy="35" r="1.2" fill="#E6EDF3" opacity="0.3" />
      <Circle cx="88" cy="88" r="0.8" fill="#E6EDF3" opacity="0.25" />
      <Circle cx="30" cy="92" r="1" fill="#E6EDF3" opacity="0.3" />
      <Circle cx="100" cy="70" r="0.7" fill="#2F81F7" opacity="0.5" />
      <Circle cx="15" cy="60" r="0.8" fill="#2F81F7" opacity="0.4" />
    </Svg>
  );
}
