import Icon from "@/components/Icons";

export default function EducationCard({ education = [], authed, onEdit }) {
  return (
    <section className="card" id="education">
      <div className="card-head">
        <h2>
          <Icon.Award size={18} className="inline-ico" /> Education
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <div className="timeline">
        {education.map((ed) => (
          <div key={ed.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-role">{ed.degree}</div>
              <div className="timeline-company">{ed.school}</div>
              <div className="timeline-period">{ed.period}</div>
              {ed.desc && <p className="timeline-desc">{ed.desc}</p>}
            </div>
          </div>
        ))}
        {education.length === 0 && (
          <p className="muted">No education added yet.</p>
        )}
      </div>
    </section>
  );
}