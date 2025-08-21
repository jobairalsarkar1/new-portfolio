"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type EarthProps = {
  scale?: number;
  rotationSpeed?: number;
};

const Earth = ({ scale = 1.5, rotationSpeed = 0.001 }: EarthProps) => {
  const earthGroupRef = useRef<THREE.Group>(null);

  // Load textures
  const [earthMap, bumpMap, cloudMap, cityLightMap] = useTexture([
    "/earth/earthmap.jpg",
    "/earth/earthbump.jpg",
    "/earth/earthcloudmap.jpg",
    "/earth/earthlights.jpg",
  ]);

  // Rotate the entire Earth model group
  useFrame(() => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += rotationSpeed; // Rotate around Y axis for proper earth rotation
    }
  });

  return (
    <group ref={earthGroupRef} scale={scale}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* City Lights (Night Side) */}
      <mesh rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial
          map={cityLightMap}
          blending={THREE.AdditiveBlending} // Blend for lights effect
          side={THREE.BackSide} // Show only on the dark side of Earth
          // transparent={true}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh>
        <sphereGeometry args={[1.51, 64, 64]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent={true}
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Earth;
