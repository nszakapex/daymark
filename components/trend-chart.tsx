/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG chart geometry requires an image role. */
import { money, type Report } from '@/lib/demo-data';
export default function TrendChart({
  report,
  baseline,
}: {
  report: Report;
  baseline: Report | null;
}) {
  const values = [...report.weeks, ...(baseline?.weeks ?? [])].map(
    (w) => w.cost ?? 0,
  );
  const maximum = Math.ceil(Math.max(10, ...values) / 10) * 10;
  const x = (i: number) => 60 + i * 180;
  const y = (cost: number | null) => 185 - ((cost ?? 0) / maximum) * 145;
  const points = (r: Report) =>
    r.weeks.map((w, i) => `${x(i)},${y(w.cost)}`).join(' ');
  // Inline SVG needs its own image role; an HTML img cannot contain chart geometry.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return (
    <svg
      className="trend-chart"
      viewBox="0 0 650 225"
      role="img"
      aria-label={
        'Weekly ad cost per linked customer: ' +
        report.weeks.map((w, i) => `week ${i + 1}: ${money(w.cost)}`).join(', ')
      }
    >
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1="45"
            x2="630"
            y1={40 + i * 48.33}
            y2={40 + i * 48.33}
            stroke="#e1e7f0"
            strokeDasharray="3 5"
          />
          <text x="0" y={44 + i * 48.33} fill="#61718a" fontSize="13">
            ${Math.round(maximum * (1 - i / 3))}
          </text>
        </g>
      ))}
      {baseline && (
        <polyline
          points={points(baseline)}
          fill="none"
          stroke="#95a5bd"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
      )}
      <polyline
        points={points(report)}
        fill="none"
        stroke="#2454ec"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {report.weeks.map((w, i) => (
        <g key={w.start}>
          <circle
            cx={x(i)}
            cy={y(w.cost)}
            r="5"
            fill="white"
            stroke="#2454ec"
            strokeWidth="2"
          />
          <text
            x={x(i)}
            y={y(w.cost) - 14}
            textAnchor="middle"
            fontSize="13"
            fill="#234ccc"
          >
            {money(w.cost)}
          </text>
          <text
            x={x(i)}
            y="216"
            textAnchor="middle"
            fontSize="13"
            fill="#61718a"
          >
            Week {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
