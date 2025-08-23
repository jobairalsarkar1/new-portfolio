"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface StarFieldProps {
  numStars?: number;
}

const StarField = ({ numStars = 500 }: StarFieldProps) => {
  const texture = useLoader(THREE.TextureLoader, "/texture/circle.png");

  const { positions, colors } = useMemo(() => {
    const verts: number[] = [];
    const colors: number[] = [];

    function randomSpherePoint() {
      const radius = Math.random() * 25 + 25;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }

    for (let i = 0; i < numStars; i++) {
      const pos = randomSpherePoint();
      const hue = 0.6;
      const col = new THREE.Color().setHSL(hue, 0.2, Math.random());
      verts.push(pos.x, pos.y, pos.z);
      colors.push(col.r, col.g, col.b);
    }

    return {
      positions: new Float32Array(verts),
      colors: new Float32Array(colors),
    };
  }, [numStars]);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime();
    const speed = 0.005;
    const positionsArray = ref.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positionsArray.length; i += 3) {
      positionsArray[i + 2] -= speed * Math.sin(time + i);
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      {/* OrbitControls to rotate the starfield */}
      <OrbitControls enableZoom={false} />
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          vertexColors
          map={texture}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export default StarField;
