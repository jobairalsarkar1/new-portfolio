"use client";

import { useState, MouseEvent } from "react";

interface Box {
  id: number;
  parentId: number | null;
  position: { top: number; left: number };
  counter: number;
}

interface Offset { x: number; y: number }

const BlockGraph = () => {
  const [boxes, setBoxes] = useState<Box[]>(() => {
    if (typeof window === "undefined") return []; // SSR: empty array
    return [
      {
        id: 0,
        parentId: null,
        position: {
          top: Math.random() * (window.innerHeight - 120),
          left: Math.random() * (window.innerWidth - 150),
        },
        counter: 0,
      },
    ];
  });

  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDraggingId(id);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingId === null) return;

    const newTop = e.clientY - offset.y;
    const newLeft = e.clientX - offset.x;

    setBoxes((prev) =>
      prev.map((box) =>
        box.id === draggingId
          ? { ...box, position: { top: newTop, left: newLeft } }
          : box
      )
    );
  };

  const handleMouseUp = () => setDraggingId(null);

  const handleButtonClick = (parentId: number) => {
    if (typeof window === "undefined") return;

    const randomTop = Math.random() * (window.innerHeight - 120);
    const randomLeft = Math.random() * (window.innerWidth - 150);

    setBoxes((prev) => [
      ...prev,
      { id: prev.length, parentId, position: { top: randomTop, left: randomLeft }, counter: 0 },
    ]);

    setBoxes((prev) =>
      prev.map((box) => (box.id === parentId ? { ...box, counter: box.counter + 1 } : box))
    );
  };

  return (
    <div
      className="relative w-screen h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {boxes.map((box) => (
        <div
          key={box.id}
          className="absolute bg-pink-500 w-36 p-4 flex flex-col items-center justify-center cursor-grab"
          style={{ top: box.position.top, left: box.position.left }}
          onMouseDown={(e) => handleMouseDown(e, box.id)}
        >
          <span className="text-white text-lg font-semibold">{box.counter}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(box.id);
            }}
            className="px-12 py-1 mt-5 flex items-center justify-center text-pink-600 text-lg bg-slate-300"
          >
            +
          </button>
        </div>
      ))}

      <svg className="top-0 left-0 w-full h-full pointer-events-none">
        {boxes.map((box) => {
          if (box.parentId === null) return null;
          const parent = boxes.find((p) => p.id === box.parentId);
          if (!parent) return null;

          const parentCenterX = parent.position.left + 70;
          const parentCenterY = parent.position.top + 70;
          const childCenterX = box.position.left + 70;
          const childCenterY = box.position.top + 70;
          const midX = childCenterX;
          const midY = parentCenterY;

          return (
            <path
              key={box.id}
              d={`M ${parentCenterX} ${parentCenterY} V ${midY} H ${midX} V ${childCenterY}`}
              stroke="black"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="transparent"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default BlockGraph;
