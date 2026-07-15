import Icon from "@/components/Icons";

export default function ExperienceCard({ experience = [], authed, onEdit }) {
  return (
    <section className="card" id="experience">
      <div className="card-head">
        <h2>
          <Icon.Briefcase size={18} className="inline-ico" /> Experience
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <div className="timeline">
        {experience.map((exp) => (
          <div key={exp.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-role">{exp.role}</div>
              <div className="timeline-company">
                {exp.company}
                {exp.location ? " - " + exp.location : ""}
              </div>
              <div className="timeline-period">{exp.period}</div>
              <p className="timeline-desc">{exp.desc}</p>
            </div>
          </div>
        ))}
        {experience.length === 0 && (
          <p className="muted">No experience added yet.</p>
        )}
      </div>
    </section>
  );
}