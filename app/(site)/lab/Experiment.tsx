"use client";

import { useEffect, useRef } from "react";
import { createSetup } from "../_components/margins/canvas";
import { startInk } from "../_components/margins/ink";
import { startPond } from "../_components/margins/pond";
import { startThreads } from "../_components/margins/threads";

const experiments = { ink: startInk, pond: startPond, threads: startThreads };

export type ExperimentId = keyof typeof experiments;

export default function Experiment({ id }: { id: ExperimentId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return experiments[id](createSetup(canvas));
  }, [id]);

  return <canvas ref={canvasRef} className="lab-canvas" />;
}
