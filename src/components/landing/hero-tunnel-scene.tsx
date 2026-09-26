'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RING_COUNT = 28;
const RING_SPACING = 4.2;
const TUNNEL_LENGTH = RING_COUNT * RING_SPACING;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function TunnelRings({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ringsRef = useRef<THREE.Mesh[]>([]);

  const ringData = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, i) => ({
        z: -i * RING_SPACING,
        radius: 2.6 + (i % 3 === 0 ? 0.4 : 0),
        color: i % 2 === 0 ? '#8b5cf6' : '#22d3ee',
      })),
    []
  );

  useFrame((state) => {
    const p = progressRef.current; // 0..1, სქროლ-პროგრესი

    // კამერის დოლი: 0 -> 0.85 გადის ტუნელში, 0.85 -> 1 = პორტალის გარღვევა
    const travel = clamp(p / 0.85, 0, 1);
    const targetZ = 6 - travel * (TUNNEL_LENGTH + 6);
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;

    // მსუბუქი "სუნთქვის" რხევა კამერაზე
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    state.camera.lookAt(0, 0, state.camera.position.z - 10);

    ringsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.z = state.clock.elapsedTime * 0.15 * (i % 2 === 0 ? 1 : -1);
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.03;
      mesh.scale.setScalar(pulse);
    });
  });

  return (
    <group>
      {ringData.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ringsRef.current[i] = el;
          }}
          position={[0, 0, r.z]}
        >
          <torusGeometry args={[r.radius, 0.045, 8, 48]} />
          <meshBasicMaterial color={r.color} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PortalGate({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = progressRef.current;
    const reveal = clamp((p - 0.6) / 0.4, 0, 1); // 0.6 -> 1.0 ვლინდება
    meshRef.current.scale.setScalar(1 + reveal * 3.2);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + reveal * 0.75;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -TUNNEL_LENGTH - 2]}>
      <ringGeometry args={[2.2, 2.6, 64]} />
      <meshBasicMaterial color="#c4b5fd" transparent opacity={0.25} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SpeedLines({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const count = 140;
  const positionsRef = useRef<Float32Array | null>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 1.8;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = -Math.random() * TUNNEL_LENGTH;
    }
    positionsRef.current = arr;
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;
    const p = progressRef.current;
    const speed = 0.3 + p * 1.6; // ტუნელში სიღრმისკენ უფრო სწრაფად მოძრაობს
    const arr = positionsRef.current;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += speed;
      if (arr[i * 3 + 2] > state.camera.position.z + 6) {
        arr[i * 3 + 2] = state.camera.position.z - TUNNEL_LENGTH;
      }
    }
    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#e0e7ff" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function HeroTunnelScene({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      camera={{ fov: 60, position: [0, 0, 6] }}
    >
      <ambientLight intensity={0.3} />
      <fog attach="fog" args={['#08070c', 4, 22]} />
      <TunnelRings progressRef={progressRef} />
      <SpeedLines progressRef={progressRef} />
      <PortalGate progressRef={progressRef} />
    </Canvas>
  );
}