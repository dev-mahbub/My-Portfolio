import { useEffect, useState } from "react";
import Icon from "@/components/Icons";

/**
 * Admin-only analytics card. Fetches /api/analytics and shows:
 *   - total visits, unique ref sources
 *   - device breakdown
 *   - top ref sources (?ref=google etc.)
 *   - recent visits
 */
export default function AnalyticsCard({ authed, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!authed) return;
    if (!open) return;
    setLoading(true);
    fetch("/api/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authed, open]);

  if (!authed) return null;

  return (
    <section className="card analytics-card">
      <div className="card-head">
        <h2>
          <Icon.Globe size={18} className="inline-ico" /> Visitor Analytics
        </h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <>
              Hide <Icon.ChevronUp size={14} />
            </>
          ) : (
            <>
              View <Icon.ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {!open ? (
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          See who viewed your profile (HR, recruiters, companies via ref links).
        </p>
      ) : loading ? (
        <p className="muted">Loading analytics…</p>
      ) : !data ? (
        <p className="muted">Failed to load analytics.</p>
      ) : data.enabled === false ? (
        <p className="muted">
          Analytics requires a configured PostgreSQL database. Tracking is
          currently disabled.
        </p>
      ) : (
        <div className="analytics-body">
          <div className="analytics-stats">
            <div className="stat-box">
              <strong>{data.total ?? 0}</strong>
              <span>Total Visits</span>
            </div>
            <div className="stat-box">
              <strong>{data.uniqueRefs ?? 0}</strong>
              <span>Unique Refs</span>
            </div>
            <div className="stat-box">
              <strong>{data.byDevice?.desktop ?? 0}</strong>
              <span>Desktop</span>
            </div>
            <div className="stat-box">
              <strong>{data.byDevice?.mobile ?? 0}</strong>
              <span>Mobile</span>
            </div>
          </div>

          <div className="analytics-section">
            <h4>Top Referral Sources</h4>
            <RefList items={data.byRef} emptyLabel="No ref links yet" />
          </div>

          <div className="analytics-section">
            <h4>Recent Visits</h4>
            <div className="analytics-recent">
              {(data.recent || []).slice(0, 12).map((r) => (
                <div key={r.id} className="analytics-visit">
                  <span className="av-ref">
                    {r.ref_source ? `ref=${r.ref_source}` : "direct"}
                  </span>
                  <span className="av-path">{r.path || "/"}</span>
                  <span className="av-time">
                    {new Date(r.visited_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {(data.recent || []).length === 0 && (
                <p className="muted">No visits recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RefList({ items, emptyLabel }) {
  if (!items || items.length === 0)
    return <p className="muted">{emptyLabel}</p>;
  const max = Math.max(...items.map((i) => i.visits), 1);
  return (
    <div className="ref-list">
      {items.map((it, i) => (
        <div key={i} className="ref-row">
          <span className="ref-name">{it.ref}</span>
          <div className="ref-bar-wrap">
            <div
              className="ref-bar"
              style={{ width: `${(it.visits / max) * 100}%` }}
            />
          </div>
          <span className="ref-count">{it.visits}</span>
        </div>
      ))}
    </div>
  );
}
