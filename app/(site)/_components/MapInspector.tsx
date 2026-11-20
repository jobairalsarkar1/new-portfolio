"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import type { Graph, GraphNode } from "../_lib/graph";
import { profile } from "../_lib/content";

type MapInspectorProps = {
  graph: Graph;
  neighbors: Set<number>[];
  byId: Map<string, number>;
  selected: string;
  onSelect: (id: string) => void;
};

const TYPE_LABEL: Record<GraphNode["type"], string> = {
  me: "Start here",
  role: "Role",
  project: "Project",
  skill: "Skill",
  note: "Writing",
};

function Chips({
  nodes,
  onSelect,
}: {
  nodes: GraphNode[];
  onSelect: (id: string) => void;
}) {
  if (nodes.length === 0) return null;
  return (
    <ul className="inspector-chips">
      {nodes.map((node) => (
        <li key={node.id}>
          <button type="button" data-type={node.type} onClick={() => onSelect(node.id)}>
            {node.type === "note" ? node.short : node.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function MapInspector({
  graph,
  neighbors,
  byId,
  selected,
  onSelect,
}: MapInspectorProps) {
  const index = byId.get(selected) ?? 0;
  const node = graph.nodes[index];
  const related = [...neighbors[index]].map((i) => graph.nodes[i]);
  const ofType = (type: GraphNode["type"]) => related.filter((item) => item.type === type);

  return (
    <aside className="inspector" aria-live="polite" aria-label="Details">
      <div className="inspector-body" key={node.id}>
        <p className="inspector-type" data-type={node.type}>
          <i /> {TYPE_LABEL[node.type]}
        </p>

        {node.type === "me" && (
          <>
            <h3>{node.label}</h3>
            <p className="inspector-sub">
              {node.role} at {profile.company} · {node.location}
            </p>
            <p>
              This map shows how my work fits together. Roles sit closest to
              me, projects around them, and the skills they used on the outside.
              A bigger skill dot means I used it in more places.
            </p>
            <p className="inspector-label">Pick a role to start</p>
            <Chips nodes={ofType("role")} onSelect={onSelect} />
          </>
        )}

        {node.type === "role" && (
          <>
            <h3>{node.label}</h3>
            <p className="inspector-sub">
              {node.role} · {node.duration}
            </p>
            <p>{node.summary}</p>
            {node.deepDive && (
              <Link href={node.deepDive} className="inspector-cta">
                Read the deep dive <FiArrowRight aria-hidden />
              </Link>
            )}
            <p className="inspector-label">Skills used here</p>
            <Chips nodes={ofType("skill")} onSelect={onSelect} />
            <a href="#experience" className="inspector-link">
              Full story in Experience <FiArrowRight aria-hidden />
            </a>
          </>
        )}

        {node.type === "project" && (
          <>
            <div className="inspector-cover">
              <Image src={node.coverImage} alt="" fill sizes="340px" />
            </div>
            <h3>{node.label}</h3>
            <p>{node.excerpt}</p>
            <Link href={`/work/${node.slug}`} className="inspector-cta">
              Open the case study <FiArrowUpRight aria-hidden />
            </Link>
            <p className="inspector-label">Built with</p>
            <Chips nodes={ofType("skill")} onSelect={onSelect} />
          </>
        )}

        {node.type === "skill" && (
          <>
            <h3>{node.label}</h3>
            <p className="inspector-sub">
              Used in {related.length} {related.length === 1 ? "place" : "places"}
              {node.primary ? " · one of my daily tools" : ""}
            </p>
            {ofType("role").length > 0 && (
              <>
                <p className="inspector-label">At work</p>
                <Chips nodes={ofType("role")} onSelect={onSelect} />
              </>
            )}
            {ofType("project").length > 0 && (
              <>
                <p className="inspector-label">In projects</p>
                <Chips nodes={ofType("project")} onSelect={onSelect} />
              </>
            )}
            {ofType("note").length > 0 && (
              <>
                <p className="inspector-label">Written about</p>
                <Chips nodes={ofType("note")} onSelect={onSelect} />
              </>
            )}
          </>
        )}

        {node.type === "note" && (
          <>
            <h3>{node.label}</h3>
            <p>{node.summary}</p>
            <Link href={node.href} className="inspector-cta">
              Read it <FiArrowRight aria-hidden />
            </Link>
            <p className="inspector-label">Connected to</p>
            <Chips nodes={related} onSelect={onSelect} />
          </>
        )}
      </div>

      {node.type !== "me" && (
        <button type="button" className="inspector-reset" onClick={() => onSelect("me")}>
          Back to overview
        </button>
      )}
    </aside>
  );
}
