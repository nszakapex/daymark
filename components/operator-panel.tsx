import { ArrowRight } from 'lucide-react';
import Link from '@/components/site-link';
import { sampleDesk } from '@/lib/desk.ts';

export default function OperatorPanel() {
  const rows = sampleDesk();
  return (
    <section className="decisions-section">
      <div className="connections-intro">
        <div>
          <strong>Fictional morning desk.</strong>
          <p>
            These people are labeled June Paper Co. samples. They are not live
            buyers and not proof that a promotion worked.
          </p>
        </div>
      </div>
      <div className="decision-list">
        {rows.map((item) => (
          <article className="decision-row" key={item.id}>
            <span
              className={
                item.bucket === 'do'
                  ? 'status-healthy'
                  : item.bucket === 'fix'
                    ? 'status-review'
                    : 'offer-status'
              }
            >
              {item.label}
            </span>
            <h3>{item.headline}</h3>
            <p>{item.script}</p>
          </article>
        ))}
      </div>
      <Link className="button-primary" href="/operator">
        Work today’s desk <ArrowRight size={16} />
      </Link>
    </section>
  );
}
