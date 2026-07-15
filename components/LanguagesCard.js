import Icon from "@/components/Icons";

export default function LanguagesCard({ languages = [], authed, onEdit }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>
          <Icon.Globe size={18} className="inline-ico" /> Languages
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <ul className="lang-list">
        {languages.map((l, i) => (
          <li key={i}>
            {l.name} <span>{l.level}</span>
          </li>
        ))}
        {languages.length === 0 && <li className="muted">No languages yet.</li>}
      </ul>
    </section>
  );
}
