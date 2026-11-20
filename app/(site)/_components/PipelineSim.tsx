"use client";

import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";

type Point = { x: number; y: number };
type Route = Point[][];

type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  tone?: "legacy" | "store" | "app" | "stream";
};

type Layout = {
  name: "wide" | "tall";
  width: number;
  height: number;
  boxes: Box[];
  consumers: Box[];
  lanes: { start: Point; end: Point; offsetLabel: Point; overflowLabel: Point }[];
  capture: Route;
  produce: Route[];
  apply: Route[];
  serve: Route;
  wires: Point[][];
};

type Op = "INSERT" | "UPDATE" | "DELETE";
type Phase = "capture" | "produce" | "queued" | "fetch" | "process" | "apply" | "serve";

type SimEvent = {
  key: number;
  table: string;
  op: Op;
  partition: number;
  offset: number;
  createdAt: number;
  phase: Phase;
  route: Route;
  leg: number;
  travelled: number;
  position: Point;
  laneProgress: number;
  queueIndex: number;
  doneAt: number;
  circle: number;
};

type LogEntry = {
  id: number;
  time: string;
  op: Op;
  table: string;
  key: number;
  partition: number;
  offset: number;
  latency: number;
};

type Stats = {
  produced: number;
  committed: number;
  lag: number;
  throughput: number;
  p50: number;
  p95: number;
};

const PARTITIONS = 3;
const SERVICE_RATE = 6;
const SPEED = 330;
const FETCH_SPEED = 1600;
const SLOT = 15;
const VISIBLE_QUEUE = 17;
const POOL_SIZE = 200;
const TABLES = ["appointments", "patients", "admissions", "billing", "lab_orders"];

function wideLayout(): Layout {
  const lanesY = [175, 225, 275];
  const laneStart = 452;
  const laneEnd = 716;

  return {
    name: "wide",
    width: 1200,
    height: 460,
    boxes: [
      { id: "oracle", x: 20, y: 175, w: 150, h: 100, title: "Oracle", sub: "legacy HIS", tone: "legacy" },
      { id: "cdc", x: 228, y: 199, w: 114, h: 52, title: "CDC", sub: "capture" },
      { id: "kafka", x: 400, y: 96, w: 340, h: 242, title: "Kafka", sub: "topic his.changes", tone: "stream" },
      { id: "postgres", x: 962, y: 175, w: 210, h: 100, title: "PostgreSQL", sub: "new platform", tone: "store" },
      { id: "api", x: 962, y: 382, w: 210, h: 60, title: "tRPC API", sub: "typed procedures" },
      { id: "web", x: 566, y: 382, w: 324, h: 60, title: "React apps", sub: "appointments · billing · ERP", tone: "app" },
    ],
    consumers: lanesY.map((y, p) => ({
      id: `sync-${p}`,
      x: 786,
      y: y - 18,
      w: 104,
      h: 36,
      title: `sync-${p}`,
    })),
    lanes: lanesY.map((y) => ({
      start: { x: laneStart, y },
      end: { x: laneEnd, y },
      offsetLabel: { x: laneEnd, y: y - 10 },
      overflowLabel: { x: laneStart, y: y - 10 },
    })),
    capture: [[{ x: 170, y: 225 }, { x: 228, y: 225 }]],
    produce: lanesY.map((y) => [
      [{ x: 342, y: 225 }, { x: 372, y: 225 }, { x: 372, y }, { x: laneStart, y }],
    ]),
    apply: lanesY.map((y) => [
      [{ x: 890, y }, { x: 926, y }, { x: 926, y: 225 }, { x: 962, y: 225 }],
    ]),
    serve: [
      [{ x: 1067, y: 275 }, { x: 1067, y: 382 }],
      [{ x: 962, y: 412 }, { x: 890, y: 412 }],
    ],
    wires: [
      [{ x: 170, y: 225 }, { x: 228, y: 225 }],
      ...lanesY.map((y) => [{ x: 342, y: 225 }, { x: 372, y: 225 }, { x: 372, y }, { x: laneStart, y }]),
      ...lanesY.map((y) => [{ x: laneEnd, y }, { x: 786, y }]),
      ...lanesY.map((y) => [{ x: 890, y }, { x: 926, y }, { x: 926, y: 225 }, { x: 962, y: 225 }]),
      [{ x: 1067, y: 275 }, { x: 1067, y: 382 }],
      [{ x: 962, y: 412 }, { x: 890, y: 412 }],
    ],
  };
}

function tallLayout(): Layout {
  const lanesX = [116, 200, 284];
  const laneStart = 284;
  const laneEnd = 440;

  return {
    name: "tall",
    width: 400,
    height: 880,
    boxes: [
      { id: "oracle", x: 110, y: 14, w: 180, h: 64, title: "Oracle", sub: "legacy HIS", tone: "legacy" },
      { id: "cdc", x: 142, y: 116, w: 116, h: 48, title: "CDC", sub: "capture" },
      { id: "kafka", x: 24, y: 200, w: 352, h: 276, title: "Kafka", sub: "topic his.changes", tone: "stream" },
      { id: "postgres", x: 100, y: 586, w: 200, h: 70, title: "PostgreSQL", sub: "new platform", tone: "store" },
      { id: "api", x: 100, y: 704, w: 200, h: 56, title: "tRPC API", sub: "typed procedures" },
      { id: "web", x: 60, y: 806, w: 280, h: 60, title: "React apps", sub: "appointments · billing", tone: "app" },
    ],
    consumers: lanesX.map((x, p) => ({
      id: `sync-${p}`,
      x: x - 38,
      y: 500,
      w: 76,
      h: 34,
      title: `sync-${p}`,
    })),
    lanes: lanesX.map((x) => ({
      start: { x, y: laneStart },
      end: { x, y: laneEnd },
      offsetLabel: { x, y: laneEnd + 24 },
      overflowLabel: { x, y: laneStart - 16 },
    })),
    capture: [[{ x: 200, y: 78 }, { x: 200, y: 116 }]],
    produce: lanesX.map((x) => [
      [{ x: 200, y: 164 }, { x: 200, y: 186 }, { x, y: 186 }, { x, y: laneStart }],
    ]),
    apply: lanesX.map((x) => [
      [{ x, y: 534 }, { x, y: 558 }, { x: 200, y: 558 }, { x: 200, y: 586 }],
    ]),
    serve: [
      [{ x: 200, y: 656 }, { x: 200, y: 704 }],
      [{ x: 200, y: 760 }, { x: 200, y: 806 }],
    ],
    wires: [
      [{ x: 200, y: 78 }, { x: 200, y: 116 }],
      ...lanesX.map((x) => [{ x: 200, y: 164 }, { x: 200, y: 186 }, { x, y: 186 }, { x, y: laneStart }]),
      ...lanesX.map((x) => [{ x, y: laneEnd }, { x, y: 500 }]),
      ...lanesX.map((x) => [{ x, y: 534 }, { x, y: 558 }, { x: 200, y: 558 }, { x: 200, y: 586 }]),
      [{ x: 200, y: 656 }, { x: 200, y: 704 }],
      [{ x: 200, y: 760 }, { x: 200, y: 806 }],
    ],
  };
}

const exponential = (rate: number) => -Math.log(1 - Math.random()) / rate;

function pickOp(): Op {
  const roll = Math.random();
  if (roll < 0.58) return "UPDATE";
  if (roll < 0.9) return "INSERT";
  return "DELETE";
}

function pointOnLine(line: Point[], distance: number): Point {
  let remaining = distance;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length) {
      const t = length === 0 ? 0 : remaining / length;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= length;
  }
  return line[line.length - 1];
}

function lineLength(line: Point[]) {
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    total += Math.hypot(line[i].x - line[i - 1].x, line[i].y - line[i - 1].y);
  }
  return total;
}

function travel(event: SimEvent, distance: number) {
  let left = distance;
  while (left > 0) {
    const line = event.route[event.leg];
    const remaining = lineLength(line) - event.travelled;
    if (left < remaining) {
      event.travelled += left;
      left = 0;
    } else {
      left -= remaining;
      event.leg++;
      event.travelled = 0;
      if (event.leg >= event.route.length) {
        const lastLine = event.route[event.route.length - 1];
        event.position = { ...lastLine[lastLine.length - 1] };
        return true;
      }
    }
  }
  event.position = pointOnLine(event.route[event.leg], event.travelled);
  return false;
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

const clockTime = () => {
  const now = new Date();
  const pad = (value: number, size = 2) => String(value).padStart(size, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
};

export default function PipelineSim() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const consumerRefs = useRef<(SVGGElement | null)[]>([]);
  const offsetRefs = useRef<(SVGTextElement | null)[]>([]);
  const overflowRefs = useRef<(SVGTextElement | null)[]>([]);
  const burstRef = useRef(0);

  const [layout, setLayout] = useState<Layout | null>(null);
  const [rate, setRate] = useState(8);
  const [consumersOn, setConsumersOn] = useState(true);
  const [running, setRunning] = useState(true);
  const [stats, setStats] = useState<Stats>({
    produced: 0,
    committed: 0,
    lag: 0,
    throughput: 0,
    p50: 0,
    p95: 0,
  });
  const [log, setLog] = useState<LogEntry[]>([]);

  const controls = useRef({ rate, consumersOn, running });
  controls.current = { rate, consumersOn, running };

  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setLayout(query.matches ? tallLayout() : wideLayout());
    update();
    query.addEventListener("change", update);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRunning(false);
    }

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!layout || !wrapperRef.current) return;

    const circles = circleRefs.current;
    const free: number[] = [];
    for (let i = POOL_SIZE - 1; i >= 0; i--) free.push(i);

    const events: SimEvent[] = [];
    const queues: SimEvent[][] = Array.from({ length: PARTITIONS }, () => []);
    const busy: (SimEvent | null)[] = Array(PARTITIONS).fill(null);
    const offsets = Array(PARTITIONS).fill(0);
    const latencies: number[] = [];
    const commits: number[] = [];
    const entries: LogEntry[] = [];
    let produced = 0;
    let committed = 0;
    let logId = 0;
    let clock = 0;
    let nextArrival = exponential(controls.current.rate);
    let lastRate = controls.current.rate;
    let pendingBurst = 0;
    let burstTimer = 0;

    const acquire = (event: SimEvent) => {
      if (event.circle >= 0) return;
      const index = free.pop();
      if (index === undefined) return;
      event.circle = index;
      const circle = circles[index];
      if (!circle) return;
      circle.setAttribute("class", `event event-${event.op.toLowerCase()}`);
      circle.style.display = "";
    };

    const release = (event: SimEvent) => {
      if (event.circle < 0) return;
      const circle = circles[event.circle];
      if (circle) circle.style.display = "none";
      free.push(event.circle);
      event.circle = -1;
    };

    const spawn = () => {
      const key = 10000 + Math.floor(Math.random() * 90000);
      const event: SimEvent = {
        key,
        table: TABLES[Math.floor(Math.random() * TABLES.length)],
        op: pickOp(),
        partition: key % PARTITIONS,
        offset: -1,
        createdAt: clock,
        phase: "capture",
        route: layout.capture,
        leg: 0,
        travelled: 0,
        position: { ...layout.capture[0][0] },
        laneProgress: 0,
        queueIndex: 0,
        doneAt: 0,
        circle: -1,
      };
      acquire(event);
      events.push(event);
    };

    const laneLength = lineLength([layout.lanes[0].start, layout.lanes[0].end]);

    const update = (dt: number) => {
      clock += dt;
      const { rate: currentRate, consumersOn: consuming } = controls.current;

      if (currentRate !== lastRate) {
        lastRate = currentRate;
        nextArrival = clock + exponential(currentRate);
      }
      while (clock >= nextArrival) {
        spawn();
        nextArrival += exponential(currentRate);
      }

      if (burstRef.current > 0) {
        pendingBurst += burstRef.current;
        burstRef.current = 0;
      }
      burstTimer -= dt;
      while (pendingBurst > 0 && burstTimer <= 0) {
        spawn();
        pendingBurst--;
        burstTimer += 0.03;
      }

      for (let p = 0; p < PARTITIONS; p++) {
        const head = queues[p][0];
        if (
          consuming &&
          !busy[p] &&
          head &&
          head.phase === "queued" &&
          head.laneProgress >= 0.999
        ) {
          queues[p].shift();
          busy[p] = head;
          const consumer = layout.consumers[p];
          head.phase = "fetch";
          head.doneAt = clock + exponential(SERVICE_RATE);
          head.route = [[layout.lanes[p].end, { x: consumer.x + 15, y: consumer.y + consumer.h / 2 }]];
          head.leg = 0;
          head.travelled = 0;
          acquire(head);
        }
      }

      for (const queue of queues) {
        queue.forEach((event, index) => {
          event.queueIndex = index;
        });
      }

      for (let i = events.length - 1; i >= 0; i--) {
        const event = events[i];
        const distance = SPEED * dt;

        if (event.phase === "queued") {
          const index = event.queueIndex;
          const target = Math.max(0, 1 - (index * SLOT) / laneLength);
          event.laneProgress = Math.min(target, event.laneProgress + distance / laneLength);
          const lane = layout.lanes[event.partition];
          event.position = {
            x: lane.start.x + (lane.end.x - lane.start.x) * event.laneProgress,
            y: lane.start.y + (lane.end.y - lane.start.y) * event.laneProgress,
          };
          if (index < VISIBLE_QUEUE) acquire(event);
          else release(event);
          continue;
        }

        if (event.phase === "process") {
          if (clock >= event.doneAt) {
            busy[event.partition] = null;
            event.phase = "apply";
            event.route = layout.apply[event.partition];
            event.leg = 0;
            event.travelled = 0;
          }
          continue;
        }

        if (!travel(event, event.phase === "fetch" ? FETCH_SPEED * dt : distance)) continue;

        if (event.phase === "capture") {
          event.phase = "produce";
          event.route = layout.produce[event.partition];
          event.offset = offsets[event.partition]++;
          queues[event.partition].push(event);
          produced++;
        } else if (event.phase === "produce") {
          event.phase = "queued";
          event.laneProgress = 0;
        } else if (event.phase === "fetch") {
          event.phase = "process";
        } else if (event.phase === "apply") {
          committed++;
          const latency = clock - event.createdAt;
          latencies.push(latency);
          if (latencies.length > 300) latencies.shift();
          commits.push(clock);
          entries.push({
            id: logId++,
            time: clockTime(),
            op: event.op,
            table: event.table,
            key: event.key,
            partition: event.partition,
            offset: event.offset,
            latency,
          });
          if (entries.length > 7) entries.shift();
          event.phase = "serve";
          event.route = layout.serve;
          if (event.circle >= 0) {
            circles[event.circle]?.setAttribute(
              "class",
              `event event-${event.op.toLowerCase()} event-served`,
            );
          }
        } else if (event.phase === "serve") {
          release(event);
          events.splice(i, 1);
          continue;
        }

        if (event.phase === "produce" || event.phase === "serve") {
          event.leg = 0;
          event.travelled = 0;
          event.position = { ...event.route[0][0] };
        }
      }
    };

    const render = () => {
      for (const event of events) {
        if (event.circle < 0) continue;
        const circle = circles[event.circle];
        if (!circle) continue;
        circle.setAttribute("cx", event.position.x.toFixed(1));
        circle.setAttribute("cy", event.position.y.toFixed(1));
      }
      busy.forEach((event, p) => {
        consumerRefs.current[p]?.setAttribute("data-busy", event ? "true" : "false");
      });
    };

    const flush = () => {
      while (commits.length && commits[0] < clock - 3) commits.shift();
      const sorted = [...latencies].sort((a, b) => a - b);
      setStats({
        produced,
        committed,
        lag: queues.reduce((total, queue) => total + queue.length, 0),
        throughput: commits.length / Math.min(3, Math.max(clock, 0.001)),
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
      });
      setLog([...entries].reverse());

      for (let p = 0; p < PARTITIONS; p++) {
        const offsetLabel = offsetRefs.current[p];
        if (offsetLabel) offsetLabel.textContent = `p${p} · ${layout.name === "wide" ? "offset " : ""}${offsets[p]}`;
        const overflow = overflowRefs.current[p];
        const hidden = queues[p].length - VISIBLE_QUEUE;
        if (overflow) overflow.textContent = hidden > 0 ? `+${hidden} waiting` : "";
      }
    };

    circles.forEach((circle) => {
      if (circle) circle.style.display = "none";
    });

    let frame = 0;
    let visible = false;
    let last = 0;
    let lastFlush = 0;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!controls.current.running) return;
      update(dt);
      render();

      if (now - lastFlush > 250) {
        lastFlush = now;
        flush();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    });
    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [layout]);

  const utilization = rate / (PARTITIONS * SERVICE_RATE);
  const health = !consumersOn
    ? "Consumers are stopped. Changes pile up until they start again."
    : utilization >= 1
      ? "More changes arrive than the consumers can handle. The line will keep growing."
      : utilization > 0.8
        ? "Almost at capacity. Waiting time rises quickly from here."
        : "Healthy. The consumers are keeping up.";

  return (
    <div className="pipeline" ref={wrapperRef}>
      <div className="pipeline-stage" data-layout={layout?.name}>
        {layout && (
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            role="img"
            aria-label="Diagram: changes flow from Oracle through change data capture into three Kafka partitions, are applied by sync consumers to PostgreSQL, and are served to React apps through a tRPC API."
          >
            <g className="wires">
              {layout.wires.map((wire, index) => (
                <polyline
                  key={index}
                  points={wire.map((point) => `${point.x},${point.y}`).join(" ")}
                />
              ))}
            </g>

            {layout.boxes.map((box) => (
              <g key={box.id} className={`box box-${box.tone ?? "service"}`}>
                <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
                <text className="box-title" x={box.x + 14} y={box.y + (box.h > 70 ? 30 : 23)}>
                  {box.title}
                </text>
                {box.sub && (
                  <text className="box-sub" x={box.x + 14} y={box.y + (box.h > 70 ? 50 : 40)}>
                    {box.sub}
                  </text>
                )}
              </g>
            ))}

            {layout.lanes.map((lane, p) => (
              <g key={p} className="lane">
                <line x1={lane.start.x} y1={lane.start.y} x2={lane.end.x} y2={lane.end.y} />
                <text
                  ref={(element) => {
                    offsetRefs.current[p] = element;
                  }}
                  className="lane-label"
                  x={lane.offsetLabel.x}
                  y={lane.offsetLabel.y}
                  textAnchor={layout.name === "wide" ? "end" : "middle"}
                >
                  p{p} · {layout.name === "wide" ? "offset " : ""}0
                </text>
                <text
                  ref={(element) => {
                    overflowRefs.current[p] = element;
                  }}
                  className="lane-overflow"
                  x={lane.overflowLabel.x}
                  y={lane.overflowLabel.y}
                  textAnchor={layout.name === "wide" ? "start" : "middle"}
                />
              </g>
            ))}

            {layout.consumers.map((consumer, p) => (
              <g
                key={consumer.id}
                ref={(element) => {
                  consumerRefs.current[p] = element;
                }}
                className="box box-consumer"
                data-paused={!consumersOn}
              >
                <rect x={consumer.x} y={consumer.y} width={consumer.w} height={consumer.h} rx={7} />
                <text
                  className="box-title"
                  x={consumer.x + consumer.w / 2 + 7}
                  y={consumer.y + consumer.h / 2 + 4.5}
                  textAnchor="middle"
                >
                  {consumer.title}
                </text>
              </g>
            ))}

            <g className="events">
              {Array.from({ length: POOL_SIZE }, (_, index) => (
                <circle
                  key={index}
                  ref={(element) => {
                    circleRefs.current[index] = element;
                  }}
                  r={layout.name === "wide" ? 4.4 : 4.6}
                  cx={-20}
                  cy={-20}
                />
              ))}
            </g>
          </svg>
        )}
      </div>

      <div className="pipeline-panel">
        <div className="pipeline-controls">
          <button
            type="button"
            className="button button-small"
            onClick={() => setRunning((value) => !value)}
            aria-pressed={!running}
          >
            {running ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
            {running ? "Pause" : "Run simulation"}
          </button>
          <button
            type="button"
            className="button button-small"
            onClick={() => setConsumersOn((value) => !value)}
            aria-pressed={!consumersOn}
            data-tone={consumersOn ? undefined : "alert"}
          >
            {consumersOn ? "Stop consumers" : "Start consumers"}
          </button>
          <button
            type="button"
            className="button button-small"
            onClick={() => {
              burstRef.current += 45;
              if (!running) setRunning(true);
            }}
          >
            Batch import +45
          </button>

          <label className="rate-control">
            <span>
              Changes per second (λ) <strong>{rate}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={26}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
            />
          </label>
        </div>

        <dl className="pipeline-metrics">
          <div data-tone={utilization >= 1 ? "alert" : undefined}>
            <dt>
              How busy <span className="symbol">ρ</span>
            </dt>
            <dd>{utilization.toFixed(2)}</dd>
          </div>
          <div data-tone={stats.lag > 40 ? "alert" : undefined}>
            <dt>Waiting in Kafka</dt>
            <dd>{stats.lag}</dd>
          </div>
          <div>
            <dt>Applied per second</dt>
            <dd>
              {stats.throughput.toFixed(1)}
              <small>/s</small>
            </dd>
          </div>
          <div>
            <dt>Delay, typical / slowest 5%</dt>
            <dd>
              {stats.p50.toFixed(2)}
              <small>s</small> / {stats.p95.toFixed(2)}
              <small>s</small>
            </dd>
          </div>
        </dl>

        <p className="pipeline-health" data-tone={utilization >= 1 || !consumersOn ? "alert" : undefined}>
          {health}
        </p>

        <div className="pipeline-log" aria-hidden>
          <p className="pipeline-log-title">
            Applied changes
            <span>
              <i className="legend legend-insert" /> insert
              <i className="legend legend-update" /> update
              <i className="legend legend-delete" /> delete
            </span>
          </p>
          <ol>
            {log.map((entry) => (
              <li key={entry.id}>
                <span className="log-time">{entry.time}</span>
                <span className={`log-op log-${entry.op.toLowerCase()}`}>{entry.op}</span>
                <span className="log-target">
                  {entry.table}#{entry.key}
                </span>
                <span className="log-offset">
                  p{entry.partition}@{entry.offset}
                </span>
                <span className="log-latency">{Math.round(entry.latency * 1000)}ms</span>
              </li>
            ))}
            {log.length === 0 && <li className="log-empty">Waiting for the first change…</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
