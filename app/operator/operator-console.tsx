'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from '@/components/site-link';
import { ArrowRight, Check, Copy, ShieldCheck } from 'lucide-react';
import { SAMPLE_INGEST_TOKEN } from '@/lib/operator.ts';
import { zapRecipes } from '@/lib/zap-recipes.ts';
import { sampleOperatorCases } from '@/lib/operator-sample.ts';

type Decision = {
  action: string;
  playbookTitle?: string | null;
  reason: string;
  evidence?: string[];
  nextStep?: string;
  upgradeRequired?: boolean;
  sample?: boolean;
  error?: string;
};

const TOKEN_KEY = 'daymark-operator-token';
const TOKEN_EVENT = 'daymark-operator-token-change';
let tokenWriteFailed = false;
let tokenFallback = '';

function subscribeToken(notify: () => void) {
  window.addEventListener(TOKEN_EVENT, notify);
  return () => window.removeEventListener(TOKEN_EVENT, notify);
}

function tokenSnapshot() {
  try {
    if (!tokenWriteFailed) return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    /* Browser may block session storage. */
  }
  return tokenFallback;
}

function writeToken(value: string) {
  tokenFallback = value;
  try {
    sessionStorage.setItem(TOKEN_KEY, value);
  } catch {
    tokenWriteFailed = true;
  }
  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export default function OperatorConsole({
  signedIn,
  whopUrl,
}: {
  signedIn: boolean;
  whopUrl: string | null;
}) {
  const token = useSyncExternalStore(subscribeToken, tokenSnapshot, () => '');
  const [license, setLicense] = useState('');
  const [destination, setDestination] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [history, setHistory] = useState<Decision[]>([]);
  const [caseId, setCaseId] = useState(sampleOperatorCases[0].id);
  const [customBody, setCustomBody] = useState(
    JSON.stringify(sampleOperatorCases[0].body, null, 2),
  );

  function selectCase(id: string) {
    setCaseId(id);
    const selected = sampleOperatorCases.find((item) => item.id === id);
    if (selected) setCustomBody(JSON.stringify(selected.body, null, 2));
  }

  function ingestUrl() {
    return `${window.location.origin}/api/operator/ingest`;
  }

  async function readError(response: Response) {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error || 'The operator could not complete that request.';
    } catch {
      return 'The operator could not complete that request.';
    }
  }

  async function startTrial() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/operator/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const body = (await response.json()) as {
        token?: string;
        error?: string;
        rotated?: boolean;
      };
      if (!response.ok) {
        setError(body.error || (await readError(response)));
        return;
      }
      if (body.token) writeToken(body.token);
      setNotice(
        body.rotated
          ? 'A replacement key was issued. Copy it now; Daymark does not show it again.'
          : 'A 14-day trial key was issued. Copy it now. This is not a paid license.',
      );
    } catch {
      setError('The trial could not be started.');
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/operator/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: license }),
      });
      const body = (await response.json()) as {
        token?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(body.error || 'That license could not be redeemed.');
        return;
      }
      if (body.token) writeToken(body.token);
      setNotice(
        'License redeemed. Copy the Daymark key now. It is shown once.',
      );
    } catch {
      setError('The license could not be redeemed.');
    } finally {
      setBusy(false);
    }
  }

  async function sendEvent(sample: boolean) {
    setBusy(true);
    setError('');
    setNotice('');
    let payload: unknown;
    try {
      payload = JSON.parse(customBody);
    } catch {
      setBusy(false);
      setError('The event body must be valid JSON.');
      return;
    }
    try {
      const response = await fetch('/api/operator/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sample ? SAMPLE_INGEST_TOKEN : token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as Decision;
      if (!response.ok) {
        setError(body.error || 'The event was not accepted.');
        return;
      }
      setDecision(body);
      setHistory((current) => [body, ...current].slice(0, 8));
      setNotice(
        sample
          ? 'Sample decision only. Nothing was stored.'
          : 'Decision recorded for this workspace.',
      );
    } catch {
      setError('The event could not be sent.');
    } finally {
      setBusy(false);
    }
  }

  async function addDestination() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/operator/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: destination, label: 'Zapier catch hook' }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error || 'The destination was not saved.');
        return;
      }
      setDestination('');
      setNotice(
        'Destination saved. Daymark will POST fire and escalate decisions there.',
      );
    } catch {
      setError('The destination could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  function copy(value: string) {
    void navigator.clipboard.writeText(value);
    setNotice('Copied.');
  }

  return (
    <div className="operator-grid">
      <section className="operator-card">
        <h2>1. Your ingest URL</h2>
        <p>
          In Zapier, use Webhooks by Zapier → POST. Header{' '}
          <code>Authorization: Bearer YOUR_KEY</code>. For a setup test, the key{' '}
          <code>{SAMPLE_INGEST_TOKEN}</code> returns a decision and stores
          nothing. Copy URL uses this host.
        </p>
        <div className="operator-field">
          <label htmlFor="ingest-url">POST URL</label>
          <div className="operator-key" id="ingest-url">
            /api/operator/ingest
          </div>
        </div>
        <div className="operator-actions">
          <button
            className="button-secondary"
            type="button"
            onClick={() => copy(ingestUrl())}
          >
            <Copy size={15} /> Copy URL
          </button>
        </div>
        {token && (
          <>
            <div className="operator-field">
              <label htmlFor="workspace-key">Workspace key</label>
              <div className="operator-key" id="workspace-key">
                {token}
              </div>
            </div>
            <div className="operator-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => copy(token)}
              >
                <Copy size={15} /> Copy key
              </button>
            </div>
          </>
        )}
        <h2 style={{ marginTop: 28 }}>2. Unlock a workspace</h2>
        <p>
          A signed-in trial is 75 events for 14 days. A Whop license is the
          product you can sell. Do not invent a live listing URL.
        </p>
        <div className="operator-actions">
          {signedIn ? (
            <button
              className="button-primary"
              type="button"
              onClick={startTrial}
              disabled={busy}
            >
              {token ? 'Rotate trial key' : 'Start a trial key'}{' '}
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link href="/login" className="button-secondary">
              Sign in for a trial
            </Link>
          )}
          {whopUrl ? (
            <a href={whopUrl} className="button-primary">
              Buy on Whop <ArrowRight size={16} />
            </a>
          ) : (
            <Link href="/pricing" className="button-secondary">
              How to list this on Whop
            </Link>
          )}
        </div>
        <div className="operator-field">
          <label htmlFor="license-key">Whop license key</label>
          <input
            id="license-key"
            value={license}
            onChange={(event) => setLicense(event.target.value)}
            placeholder="dm1.starter.0...."
            autoComplete="off"
          />
        </div>
        <div className="operator-actions">
          <button
            className="button-secondary"
            type="button"
            onClick={redeem}
            disabled={busy || !license.trim()}
          >
            Redeem license
          </button>
        </div>
        <div className="operator-field">
          <label htmlFor="destination-url">
            Optional Operator destination (Zapier Catch Hook)
          </label>
          <input
            id="destination-url"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/…"
          />
        </div>
        <div className="operator-actions">
          <button
            className="button-secondary"
            type="button"
            onClick={addDestination}
            disabled={busy || !token || !destination.trim()}
          >
            Save destination
          </button>
        </div>
        {notice && <div className="notice">{notice}</div>}
        {error && <div className="notice error">{error}</div>}
      </section>
      <section className="operator-card">
        <h2>3. Prove the decision</h2>
        <p>
          These payloads are labeled fictional. They use June Paper Co. example
          addresses. Send them with the sample key, then paste the same JSON
          into Zapier.
        </p>
        <div className="operator-field">
          <label htmlFor="sample-case">Sample event</label>
          <select
            id="sample-case"
            value={caseId}
            onChange={(event) => selectCase(event.target.value)}
          >
            {sampleOperatorCases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="operator-field">
          <label htmlFor="event-body">JSON body</label>
          <textarea
            id="event-body"
            value={customBody}
            onChange={(event) => setCustomBody(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="operator-actions">
          <button
            className="button-primary"
            type="button"
            onClick={() => sendEvent(true)}
            disabled={busy}
          >
            Decide with sample key
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => sendEvent(false)}
            disabled={busy || !token}
          >
            Decide with my key
          </button>
        </div>
        {decision && (
          <article className="decision-item" style={{ marginTop: 18 }}>
            <span className={`operator-status ${decision.action}`}>
              {decision.action}
            </span>
            <h3>{decision.playbookTitle || 'No playbook'}</h3>
            <p>{decision.reason}</p>
            {decision.nextStep && <p>{decision.nextStep}</p>}
          </article>
        )}
      </section>
      <section className="operator-card" style={{ gridColumn: '1 / -1' }}>
        <h2>Zapier recipes</h2>
        <p>
          Each recipe is one Zap plus a Filter. Operator plan recipes still work
          as a preview on the sample key; a Starter license will hold them with
          an upgrade note instead of firing.
        </p>
        <div className="recipe-grid">
          {zapRecipes.map((recipe) => (
            <article key={recipe.id} className="decision-item">
              <span className="eyebrow">{recipe.zapierCost}</span>
              <h3>{recipe.title}</h3>
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
      {history.length > 0 && (
        <section className="operator-card" style={{ gridColumn: '1 / -1' }}>
          <h2>This browser session</h2>
          <p>
            Session decisions are a convenience in this tab. They are not a
            server audit trail unless you used your workspace key.
          </p>
          <div className="decision-list">
            {history.map((item, index) => (
              <article
                className="decision-item"
                key={`${item.action}-${index}`}
              >
                <span className={`operator-status ${item.action}`}>
                  {item.action}
                </span>
                <h3>{item.playbookTitle || 'No playbook'}</h3>
                <p>{item.reason}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="operator-card" style={{ gridColumn: '1 / -1' }}>
        <ShieldCheck size={18} />
        <p style={{ marginTop: 10 }}>
          <Check size={14} /> Daymark does not connect your Zapier account, does
          not submit payment, and does not read ad accounts. A successful sample
          decision is not evidence from a customer store.
        </p>
      </section>
    </div>
  );
}
