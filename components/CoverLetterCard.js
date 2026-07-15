import { useState } from "react";
import Icon from "@/components/Icons";

/**
 * Cover Letter card — editable text (dashboard_content.cover_letter).
 * Default template follows global professional standards.
 */
export default function CoverLetterCard({ coverLetter, authed, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const text = String(coverLetter || "");
  const preview = text.split("\n").slice(0, 8).join("\n");

  return (
    <section className="card" id="cover-letter">
      <div className="card-head">
        <h2>
          <Icon.Mail size={18} className="inline-ico" /> Cover Letter
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <pre className="cv-text">{expanded ? text : preview}</pre>
      {text.split("\n").length > 8 && (
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
              Read full letter <Icon.ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </section>
  );
}
