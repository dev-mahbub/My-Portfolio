"use client";

import { useState } from "react";
import Icon from "@/components/Icons";

export default function ProjectsCard({ projects = [], authed, onEdit }) {
  const [open, setOpen] = useState({});

  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <section className="card" id="projects">
      <div className="card-head">
        <h2>
          <Icon.Briefcase size={18} className="inline-ico" /> Projects
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>

      <div className="project-list">
        {projects.map((p) => (
          <div key={p.id} className="project-card">
            {p.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover} alt={p.title} className="project-cover" />
            ) : (
              <div className="project-cover project-cover-empty">
                <Icon.Briefcase size={36} />
              </div>
            )}
            <div className="project-body">
              <div className="project-title">{p.title}</div>
              <div className="project-meta">{p.meta}</div>
              <p className="project-desc">{p.short}</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => toggle(p.id)}
              >
                {open[p.id] ? (
                  <>
                    Hide details <Icon.ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Details <Icon.ChevronRight size={14} />
                  </>
                )}
              </button>
              {open[p.id] && (
                <div className="project-extra">
                  <p>{p.long}</p>
                  {p.tech && p.tech.length > 0 && (
                    <div className="project-tech">
                      {p.tech.map((t, i) => (
                        <span key={i} className="tech-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="muted">No projects yet.</p>}
      </div>
    </section>
  );
}
