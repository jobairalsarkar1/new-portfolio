"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SolarSystemProps {
  modelPath: string;
}

const SolarSystem = ({ modelPath }: SolarSystemProps) => {
  const group = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.2);

  // Load the GLTF model and animations
  const { scene, animations } = useGLTF(modelPath) as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };

  const { actions, mixer } = useAnimations(animations, group);

  // Dynamically adjust scale based on screen size
  useEffect(() => {
    const updateScale = () => {
      setScale(window.innerWidth < 768 ? 0.15 : 0.2);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Start animations
  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
          action.timeScale = 0.5;
          action.play();
        }
      });
    }
  }, [actions]);

  // Rotate group and update mixer
  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={group} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};

export default SolarSystem;
