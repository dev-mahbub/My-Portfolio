import Icon from "@/components/Icons";

export default function HighlightsCard({ highlights = [], authed, onEdit }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>
          <Icon.Award size={18} className="inline-ico" /> Highlights
        </h2>
        {authed && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <Icon.Edit size={14} /> Edit
          </button>
        )}
      </div>
      <ul className="highlights">
        {highlights.map((h, i) => (
          <li key={i}>
            <Icon.Check size={14} className="inline-ico muted" />
            {h}
          </li>
        ))}
        {highlights.length === 0 && (
          <li className="muted">No highlights yet.</li>
        )}
      </ul>
    </section>
  );
}
