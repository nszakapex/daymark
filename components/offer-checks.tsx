'use client';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CircleHelp,
  Clipboard,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Platform from '@/components/platform-logo';
import { Checkbox } from '@/components/ui/checkbox';
import Link from '@/components/site-link';
import {
  offers,
  offerConditions,
  spendForOffer,
  type OfferId,
  type OfferResult,
  type Setup,
} from '@/lib/offer-checks';
import { useOfferHistory } from '@/components/use-offer-history';
import { money } from '@/lib/demo-data';

const statusLabel = {
  passed: 'Offer verified',
  failed: 'Needs attention',
  inconclusive: 'Needs more information',
};
export default function OfferChecks() {
  const [selected, setSelected] = useState<OfferId>('planner');
  const [setup, setSetup] = useState<Setup>('current');
  const [marketConfirmed, setMarketConfirmed] = useState(false);
  const { results, setResults, storageAvailable } = useOfferHistory();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const offer = offers.find((o) => o.id === selected)!;
  const result = results.find(
    (r) =>
      r.offerId === selected &&
      r.setup === setup &&
      (selected !== 'shipping' || r.marketConfirmed === marketConfirmed),
  );
  async function runCheck() {
    setRunning(true);
    setError('');
    setCopied(false);
    try {
      const response = await fetch('/api/sample-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: selected, setup, marketConfirmed }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw Error('The check could not finish. Try again.');
      const next: OfferResult = await response.json();
      setResults((previous) => [next, ...previous].slice(0, 20));
    } catch {
      setError(
        'The check could not finish. Your last result is unchanged. Please try again.',
      );
    } finally {
      setRunning(false);
    }
  }
  async function copyFix() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        `Daymark sample check: ${offer.title}\n${result.title}\n${result.nextStep}\n${result.scope}`,
      );
      setCopied(true);
    } catch {
      setError(
        'Copy is unavailable. You can select and copy the next step below.',
      );
    }
  }
  return (
    <div className="offer-workspace">
      <div className="offer-intro">
        <span className="offer-symbol">
          <ScanLine size={26} />
        </span>
        <div>
          <span className="eyebrow">FROM THE AD TO THE CART</span>
          <h2>Does the offer work for your customer?</h2>
          <p>Choose a promotion. Check its promise. See the evidence.</p>
        </div>
        <span className="label-pill">Interactive sample</span>
      </div>
      <div className="offer-cards" aria-label="Choose an offer">
        {offers.map((o) => {
          const last = results.find(
            (r) =>
              r.offerId === o.id &&
              r.setup === setup &&
              (o.id !== 'shipping' || r.marketConfirmed === marketConfirmed),
          );
          return (
            <button
              disabled={running}
              className={'offer-pick ' + (selected === o.id ? 'selected' : '')}
              aria-pressed={selected === o.id}
              key={o.id}
              onClick={() => {
                setSelected(o.id);
                setCopied(false);
                setError('');
              }}
            >
              <div>
                <Platform name={o.platform} />
                <span className={'offer-status ' + (last?.status ?? '')}>
                  {last ? statusLabel[last.status] : 'Ready to check'}
                </span>
              </div>
              <h3>{o.title}</h3>
              <p>{o.product}</p>
              <span className="offer-spend">
                {money(spendForOffer(o))} campaign spend · Sep 3
              </span>
              <span className="offer-selected">
                {selected === o.id ? 'Selected' : 'Check this offer'}{' '}
                <ArrowRight size={16} />
              </span>
            </button>
          );
        })}
      </div>
      <section className="offer-detail" aria-labelledby="offer-title">
        <div className="offer-detail-top">
          <div>
            <span className="eyebrow">Confirmed sample offer</span>
            <h2 id="offer-title">{offer.title}</h2>
            <p>{offerConditions(offer, marketConfirmed)}</p>
          </div>
          <code>{offer.code}</code>
        </div>
        <div className="offer-controls">
          <div>
            <label id="sample-setup-label" htmlFor="sample-setup">
              Sample store setup
            </label>
            <Select
              value={setup}
              disabled={running}
              onValueChange={(v) => {
                if (
                  v === 'current' ||
                  v === 'corrected' ||
                  v === 'unavailable'
                ) {
                  setSetup(v);
                  setError('');
                  setCopied(false);
                }
              }}
            >
              <SelectTrigger
                id="sample-setup"
                aria-labelledby="sample-setup-label"
              >
                <SelectValue>
                  {setup === 'current'
                    ? 'Original promotion rules'
                    : setup === 'corrected'
                      ? 'Planner eligibility corrected'
                      : 'Checkout unavailable'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  Original promotion rules
                </SelectItem>
                <SelectItem value="corrected">
                  Planner eligibility corrected
                </SelectItem>
                <SelectItem value="unavailable">
                  Checkout unavailable
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={running} onClick={runCheck}>
            <ScanLine size={18} />
            {running
              ? 'Checking sample cart…'
              : result
                ? 'Run check again'
                : 'Run sample check'}
          </Button>
          <Link
            className="text-link"
            href={`/sample-store?offer=${selected}&setup=${setup}&market=${marketConfirmed ? 'US' : 'unknown'}`}
          >
            Open sample cart <ArrowRight size={16} />
          </Link>
        </div>
        {offer.needsMarket && (
          <label className="offer-market" htmlFor="sample-market">
            <Checkbox
              id="sample-market"
              disabled={running}
              checked={marketConfirmed}
              onCheckedChange={(v) => setMarketConfirmed(v === true)}
            />
            <span>
              Confirm the sample offer applies to US shipping addresses.
            </span>
          </label>
        )}
        <p className="sample-check-disclosure">
          This checks the fictional store’s cart rules. Live website, device,
          and payment testing are not connected. Changes here affect only this
          sample.
        </p>
        {error && (
          <p role="alert" className="offer-error">
            {error}
          </p>
        )}
        <div aria-live="polite" aria-atomic="true">
          {result ? (
            <div className={'offer-result ' + result.status}>
              <div className="offer-result-heading">
                {result.status === 'passed' ? (
                  <ShieldCheck size={25} />
                ) : result.status === 'failed' ? (
                  <AlertTriangle size={25} />
                ) : (
                  <CircleHelp size={25} />
                )}
                <div>
                  <span>{statusLabel[result.status]}</span>
                  <h3>{result.title}</h3>
                </div>
              </div>
              <p>{result.nextStep}</p>
              {result.status === 'failed' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSetup('corrected');
                    setCopied(false);
                  }}
                >
                  Try the corrected sample setup <ArrowRight size={16} />
                </Button>
              )}
            </div>
          ) : (
            <div className="offer-ready">
              <ShieldCheck size={22} />
              <p>
                Run the check to compare the advertised benefit with the sample
                cart. A corrected setup needs a new check before it can be
                marked verified.
              </p>
            </div>
          )}
        </div>
        {result && (
          <>
            <ol className="offer-steps">
              {result.steps.map((step, i) => (
                <li key={step.label}>
                  <span className={'step-result ' + step.result}>
                    {step.result === 'passed' ? <Check size={18} /> : i + 1}
                  </span>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="cart-proof">
              <div>
                <span className="eyebrow">Evidence from this check</span>
                <h3>{offer.product}</h3>
                <p>
                  {result.cart?.message ?? 'No cart response was available.'}
                </p>
              </div>
              <dl>
                <div>
                  <dt>Basket before discounts</dt>
                  <dd>{money(offer.priceCents / 100)}</dd>
                </div>
                <div>
                  <dt>Promised discount</dt>
                  <dd>{money(result.expectedDiscountCents / 100)}</dd>
                </div>
                <div>
                  <dt>Applied discount</dt>
                  <dd>
                    {result.cart
                      ? money(result.cart.discountCents / 100)
                      : 'Not checked'}
                  </dd>
                </div>
                {offer.gift && (
                  <div>
                    <dt>Free pen set</dt>
                    <dd>
                      {result.cart
                        ? result.cart.giftAdded
                          ? 'Included'
                          : 'Missing'
                        : 'Not checked'}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Shipping</dt>
                  <dd>
                    {result.cart?.shippingCents === null || !result.cart
                      ? 'Not confirmed'
                      : money(result.cart.shippingCents / 100)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="offer-next">
              <Button variant="outline" onClick={copyFix}>
                <Clipboard size={16} />
                {copied ? 'Copied' : 'Copy next step'}
              </Button>
              <small>
                Checked{' '}
                {new Date(result.observedAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                · sample cart only
              </small>
            </div>
          </>
        )}
      </section>
      {results.length > 0 && (
        <section className="offer-history">
          <div className="card-heading">
            <div>
              <h2>Your check history</h2>
              <p>
                {storageAvailable
                  ? 'Saved in this tab for this browser session · latest six checks shown.'
                  : 'Browser storage is unavailable · results last until you leave or reload.'}
              </p>
            </div>
            <Button
              variant="ghost"
              disabled={running}
              onClick={() => {
                setResults([]);
                setError('');
              }}
            >
              <RotateCcw size={16} />
              Clear sample history
            </Button>
          </div>
          {results.slice(0, 6).map((r, i) => (
            <div className="offer-history-row" key={r.observedAt + i}>
              <div>
                <strong>{offers.find((o) => o.id === r.offerId)?.title}</strong>
                <span>
                  {[
                    r.setup === 'corrected'
                      ? 'Corrected setup'
                      : r.setup === 'unavailable'
                        ? 'Unavailable checkout'
                        : 'Original setup',
                    ...(r.offerId === 'shipping' && r.marketConfirmed
                      ? ['US shipping confirmed']
                      : []),
                  ].join(' · ')}
                </span>
              </div>
              <span className={'offer-status ' + r.status}>
                {statusLabel[r.status]}
              </span>
            </div>
          ))}
        </section>
      )}
      <div className="offer-boundary">
        <CircleHelp size={19} />
        <p>
          Campaign spend helps prioritize a problem. It is not measured lost
          revenue or money saved. A passing sample checks only the listed basket
          and conditions.
        </p>
      </div>
    </div>
  );
}
