import Icon from "@/components/Icons";

/**
 * Editable Online CV TEXT card.
 * This is the DB-stored text (dashboard_content.cv_text), shown on the
 * public page. It is COMPLETELY SEPARATE from the downloadable PDF.
 */
export default function OnlineCvCard({ cvText, authed, onEdit }) {
  const text = String(cvText || "");
  return (
    <section className="card" id="cv">
      <div className="card-head">
        <h2>
          <Icon.FileText size={18} className="inline-ico" /> Online CV
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <pre className="cv-text">{text}</pre>
      <p className="muted" style={{ fontSize: "0.72rem", marginTop: "0.4rem" }}>
        This is the live online CV. The downloadable PDF is a separate file.
      </p>
    </section>
  );
}
