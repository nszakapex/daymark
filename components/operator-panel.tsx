import { ArrowRight } from 'lucide-react';
import Link from '@/components/site-link';
import { sampleOperatorDecisions } from '@/lib/operator-sample.ts';
import { formatCents } from '@/lib/operator.ts';

export default function OperatorPanel() {
  const rows = sampleOperatorDecisions();
  return (
    <section className="decisions-section">
      <div className="connections-intro">
        <div>
          <strong>Fictional operator tape.</strong>
          <p>
            These decisions are computed from labeled sample events for June
            Paper Co. They are not live Zapier traffic and not proof that a
            promotion worked.
          </p>
        </div>
      </div>
      <div className="decision-list">
        {rows.map(({ event, decision }) => (
          <article className="decision-row" key={event.idempotencyKey ?? event.type}>
            <span
              className={
                decision.action === 'fire' || decision.action === 'escalate'
                  ? 'status-healthy'
                  : decision.action === 'inconclusive'
                    ? 'status-review'
                    : 'offer-status'
              }
            >
              {decision.action}
            </span>
            <h3>{decision.playbookTitle ?? 'Unknown event'}</h3>
            <p>{decision.reason}</p>
            <p>
              {event.email ?? 'No email'} ·{' '}
              {event.amountCents == null
                ? 'Amount unknown'
                : formatCents(event.amountCents)}
            </p>
          </article>
        ))}
      </div>
      <Link className="button-primary" href="/operator">
        Open the live operator <ArrowRight size={16} />
      </Link>
    </section>
  );
}
