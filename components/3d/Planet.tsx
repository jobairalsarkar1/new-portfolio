"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlanetProps {
  texture: THREE.Texture;
  bumpMap?: THREE.Texture;
  size: number;
  distance?: number;
  speed?: number;
}

const Planet = ({
  texture,
  bumpMap,
  size,
  distance = 5,
  speed = 0.01,
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // useFrame to update position and rotation
  useFrame(() => {
    if (meshRef.current) {
      const time = Date.now() * 0.001 * speed;

      // Orbit calculation
      const x = Math.cos(time) * distance;
      const z = Math.sin(time) * distance;

      meshRef.current.position.set(x, 0, z);

      // Planet rotation on its own axis
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        bumpMap={bumpMap}
        bumpScale={bumpMap ? 0.05 : 0}
      />
    </mesh>
  );
};

export default Planet;
