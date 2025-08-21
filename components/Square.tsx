"use client";

import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";
import Loader from "./Loader";

interface SquareProps {
  imgUrl: string;
}

const Square = ({ imgUrl }: SquareProps) => {
  const texture = useLoader(THREE.TextureLoader, imgUrl);

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      <meshStandardMaterial map={texture} color="white" />
    </mesh>
  );
};

interface SquareCanvasProps {
  icon: string;
}

const SquareCanvas: React.FC<SquareCanvasProps> = ({ icon }) => {
  return (
    <Canvas camera={{ position: [2, 2, 3], fov: 75 }} shadows>
      {/* Lights */}
      <ambientLight intensity={0.7} color="white" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        color="white"
        castShadow
      />
      <pointLight position={[2, 3, 2]} intensity={2} color="white" castShadow />
      <spotLight
        position={[0, 5, 5]}
        intensity={2}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="white"
        castShadow
      />

      {/* Suspense for lazy loading */}
      <Suspense fallback={<Loader />}>
        <OrbitControls enableZoom={false} />
        <Square imgUrl={icon} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default SquareCanvas;
