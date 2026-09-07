'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { money, type Report } from '@/lib/demo-data';
const filterLabels: Record<string, string> = {
  all: 'All records',
  missing: 'Missing sources',
  repeat: 'Repeat purchases',
  refund: 'Refunded orders',
  excluded: 'Canceled / failed',
};
export default function SalesActivity({ report }: { report: Report }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const rows = report.rows.filter(
    (r) =>
      filter === 'all' ||
      (filter === 'missing' && r.isNew && !r.source) ||
      (filter === 'repeat' && r.status === 'paid' && !r.isNew) ||
      (filter === 'refund' && r.refundCents > 0) ||
      (filter === 'excluded' && r.status !== 'paid'),
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / 8));
  return (
    <section className="sales-activity">
      <div className="sales-summary">
        {[
          ['Net product sales', money(report.netSalesCents / 100)],
          ['Paid orders', report.paidOrders],
          ['Repeat orders', report.repeatOrders],
          ['Refunds on these orders', money(report.refundCents / 100)],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="metric-definition">
        <ReceiptText size={18} />
        <span>
          {report.paidOrders} paid orders → {report.totalCustomers} first-time
          customers → {report.paidCustomers} linked to advertising.{' '}
          {report.excludedOrders} canceled or failed orders are excluded.
        </span>
      </p>
      <div className="sales-records">
        <div className="card-heading">
          <div>
            <h2>The records behind your report</h2>
            <p>Fictional orders · {report.label}</p>
          </div>
          <Select
            value={filter}
            onValueChange={(v) => {
              if (v) {
                setFilter(v);
                setPage(0);
              }
            }}
          >
            <SelectTrigger aria-label="Filter sales records">
              <SelectValue>{filterLabels[filter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All records</SelectItem>
              <SelectItem value="missing">Missing sources</SelectItem>
              <SelectItem value="repeat">Repeat purchases</SelectItem>
              <SelectItem value="refund">Refunded orders</SelectItem>
              <SelectItem value="excluded">Canceled / failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sales-list">
          {rows.slice(page * 8, page * 8 + 8).map((r) => (
            <details className="sale-row" key={r.id}>
              <summary>
                <div>
                  <strong>{r.id}</strong>
                  <span>
                    {r.placedAt.slice(0, 10)} · {r.product}
                  </span>
                </div>
                <span
                  className={
                    'offer-status ' +
                    (r.isNew && !r.source ? 'inconclusive' : '')
                  }
                >
                  {r.status !== 'paid'
                    ? r.status === 'canceled'
                      ? 'Canceled'
                      : 'Payment failed'
                    : r.refundCents === r.salesCents
                      ? 'Fully refunded'
                      : r.refundCents > 0
                        ? 'Partially refunded'
                        : r.isNew
                          ? 'First purchase'
                          : 'Repeat purchase'}
                </span>
                <strong>{money(r.netCents / 100)}</strong>
              </summary>
              <div className="sale-details">
                <dl>
                  <div>
                    <dt>Customer</dt>
                    <dd>{r.customerId}</dd>
                  </div>
                  <div>
                    <dt>Last eligible source</dt>
                    <dd>{r.source ?? r.missingReason}</dd>
                  </div>
                  <div>
                    <dt>New customer linked to ads?</dt>
                    <dd>
                      {r.isNew && (r.source === 'Meta' || r.source === 'Google')
                        ? 'Yes'
                        : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt>Product sales after discounts</dt>
                    <dd>{money(r.salesCents / 100)}</dd>
                  </div>
                  <div>
                    <dt>Refunds recorded by Sep 6</dt>
                    <dd>{money(r.refundCents / 100)}</dd>
                  </div>
                  <div>
                    <dt>Record updated (UTC)</dt>
                    <dd>{r.updatedAt.replace('T', ' ').slice(0, 16)}</dd>
                  </div>
                </dl>
                {r.refunds.map((refund) => (
                  <p key={refund.id}>
                    {refund.reason} · {refund.at.slice(0, 10)} ·{' '}
                    {money(refund.amountCents / 100)}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
        {rows.length === 0 && (
          <p className="muted-note">No records match this filter.</p>
        )}
        <div className="sales-pagination">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          <span aria-live="polite">
            {rows.length} records · Page {page + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      <p className="sample-check-disclosure">
        Net product sales exclude tax and shipping. Refunds include later
        returns recorded by Sep 6 against orders in these dates. A refunded
        first purchase still counts as a first-time purchaser; this is not
        retained-customer or profit reporting.
      </p>
    </section>
  );
}
