"use client";

import { useState } from "react";
import Icon from "@/components/Icons";

export default function SkillsCard({ skills = [], authed, onEdit }) {
  const [active, setActive] = useState(null);

  const skill = skills.find((s) => s.id === active);

  return (
    <section className="card card-overflow" id="skills">
      <div className="card-head ">
        <h2>
          <Icon.Brain size={18} className="inline-ico" /> Skills
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>

      <div className="skill-tags">
        {skills.map((s) => (
          <button
            key={s.id}
            className={`skill-tag ${active === s.id ? "active" : ""}`}
            onClick={() => setActive(active === s.id ? null : s.id)}
          >
            {s.name}
          </button>
        ))}
        {skills.length === 0 && <p className="muted">No skills yet.</p>}
      </div>

      {skill && (
        <div className="skill-detail">
          <h3>{skill.name}</h3>
          <div className="skill-bar-wrap">
            <div className="skill-bar">
              <div
                className="skill-fill"
                style={{ width: `${skill.level}%` }}
              />
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--li-green)",
                minWidth: 36,
                textAlign: "right",
              }}
            >
              {skill.level}%
            </span>
          </div>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            {skill.desc}
          </p>
          {skill.projects?.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div
                style={{ fontSize: "0.78rem", color: "var(--li-text-soft)" }}
              >
                Used in:
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  marginTop: "0.3rem",
                }}
              >
                {skill.projects.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.72rem",
                      background: "#fff",
                      border: "1px solid var(--li-border)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      color: "var(--li-text-soft)",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
