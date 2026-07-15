"use client";

import { useState } from "react";
import Icon from "@/components/Icons";

export default function AboutCard({ profile, authed, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="card" id="about">
      <div className="card-head">
        <h2>
          <Icon.User size={18} className="inline-ico" /> About
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <p style={{ fontSize: "0.9rem" }}>{profile?.about}</p>
      {profile?.aboutExtra && (
        <>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.3rem 0" }}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <>
                Show less <Icon.ChevronUp size={14} />
              </>
            ) : (
              <>
                Read more <Icon.ChevronDown size={14} />
              </>
            )}
          </button>
          {expanded && (
            <p
              className="muted"
              style={{
                fontSize: "0.85rem",
                background: "rgba(112,181,249,0.1)",
                padding: "0.5rem",
                borderRadius: 6,
              }}
            >
              {profile.aboutExtra}
            </p>
          )}
        </>
      )}
    </section>
  );
}
