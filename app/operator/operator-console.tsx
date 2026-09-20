'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from '@/components/site-link';
import { ArrowRight, Check, Copy, ShieldCheck } from 'lucide-react';
import {
  deskCounts,
  presentDeskItem,
  sampleDesk,
  type DeskBucket,
  type DeskItem,
} from '@/lib/desk.ts';
import { sampleOperatorCases } from '@/lib/operator-sample.ts';

type ApiDecision = {
  id?: string;
  action: DeskItem['action'];
  playbookId?: string | null;
  playbookTitle?: string | null;
  reason: string;
  evidence?: string[];
  nextStep?: string;
  upgradeRequired?: boolean;
  email?: string | null;
  amountCents?: number | null;
  outbound?: { productName?: string | null } | null;
  error?: string;
};

const TOKEN_KEY = 'daymark-operator-token';
const TOKEN_EVENT = 'daymark-operator-token-change';
const DONE_KEY = 'daymark-desk-done';
const DONE_EVENT = 'daymark-desk-done-change';
let tokenWriteFailed = false;
let tokenFallback = '';
let doneFallback = '[]';
let doneWriteFailed = false;

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

function subscribeDone(notify: () => void) {
  window.addEventListener(DONE_EVENT, notify);
  return () => window.removeEventListener(DONE_EVENT, notify);
}

function doneSnapshot() {
  try {
    if (!doneWriteFailed) return sessionStorage.getItem(DONE_KEY) ?? '[]';
  } catch {
    /* Browser may block session storage. */
  }
  return doneFallback;
}

function writeDone(ids: string[]) {
  const raw = JSON.stringify(ids.slice(0, 80));
  doneFallback = raw;
  try {
    sessionStorage.setItem(DONE_KEY, raw);
  } catch {
    doneWriteFailed = true;
  }
  window.dispatchEvent(new Event(DONE_EVENT));
}

function parseDone(raw: string): string[] {
  try {
    const rows: unknown = JSON.parse(raw);
    return Array.isArray(rows)
      ? rows.filter((row): row is string => typeof row === 'string')
      : [];
  } catch {
    return [];
  }
}

export default function OperatorConsole({
  signedIn,
  whopUrl,
}: {
  signedIn: boolean;
  whopUrl: string | null;
}) {
  const token = useSyncExternalStore(subscribeToken, tokenSnapshot, () => '');
  const doneIds = parseDone(
    useSyncExternalStore(subscribeDone, doneSnapshot, () => '[]'),
  );
  const [mine, setMine] = useState<DeskItem[] | null>(null);
  const [filter, setFilter] = useState<DeskBucket | 'all'>('all');
  const [selectedId, setSelectedId] = useState(sampleDesk()[0]?.id ?? '');
  const [setupOpen, setSetupOpen] = useState(false);
  const [license, setLicense] = useState('');
  const [destination, setDestination] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const items = mine ?? sampleDesk();
  const usingSample = mine === null;
  const counts = deskCounts(items);
  const visible = items.filter(
    (item) => filter === 'all' || item.bucket === filter,
  );
  const selected =
    visible.find((item) => item.id === selectedId) ?? visible[0] ?? items[0];

  async function readError(response: Response) {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error || 'Daymark could not complete that request.';
    } catch {
      return 'Daymark could not complete that request.';
    }
  }

  function ingestUrl() {
    return `${window.location.origin}/api/operator/ingest`;
  }

  function copy(value: string) {
    void navigator.clipboard.writeText(value);
    setNotice('Copied.');
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
          ? 'A replacement key was issued. Copy it now.'
          : 'A 14-day trial key was issued. Copy it, then point Stripe or Zapier at the URL in setup.',
      );
      setSetupOpen(true);
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
        'License redeemed. Copy the workspace key once, then load your desk.',
      );
      setSetupOpen(true);
    } catch {
      setError('The license could not be redeemed.');
    } finally {
      setBusy(false);
    }
  }

  async function loadMine() {
    if (!token) {
      setError('Redeem a license or start a trial before loading your desk.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/operator/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await response.json()) as {
        decisions?: ApiDecision[];
        error?: string;
      };
      if (!response.ok) {
        setError(body.error || (await readError(response)));
        return;
      }
      const next = (body.decisions ?? []).map((row, index) =>
        presentDeskItem({
          id: row.id ?? `live-${index}`,
          email: row.email,
          amountCents: row.amountCents,
          productName: row.outbound?.productName ?? null,
          decision: {
            action: row.action,
            playbookId: (row.playbookId ?? null) as never,
            playbookTitle: row.playbookTitle ?? null,
            reason: row.reason,
            evidence: row.evidence ?? [],
            nextStep: row.nextStep ?? '',
            upgradeRequired: row.upgradeRequired === true,
            fingerprint: '',
            outbound: row.outbound ?? null,
            zapFilter: {
              action: row.action,
              continue: row.action === 'fire' || row.action === 'escalate',
              path: 'none',
            },
          },
          sample: false,
        }),
      );
      setMine(next);
      if (next[0]) setSelectedId(next[0].id);
      setNotice(
        next.length
          ? 'This is your desk, not the sample.'
          : 'Your workspace is empty. Point Stripe or Zapier at the setup URL, or drop a sample person below.',
      );
    } catch {
      setError('Your desk could not be loaded.');
    } finally {
      setBusy(false);
    }
  }

  async function dropSamplePerson() {
    if (!token) {
      setSelectedId('sample-charge-failed-1');
      setFilter('do');
      setNotice(
        'Sam is on the sample desk. Copy the next step. He is not a real buyer.',
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/operator/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sampleOperatorCases[0].body),
      });
      const body = (await response.json()) as ApiDecision;
      if (!response.ok) {
        setError(body.error || 'Sam could not be added to your desk.');
        return;
      }
      await loadMine();
      setNotice(
        body.action === 'suppress'
          ? 'Sam was already on your desk this hour. Daymark will not ask you to email him twice.'
          : 'Sam is a labeled sample person on your workspace, not a live customer.',
      );
    } catch {
      setError('Sam could not be added to your desk.');
    } finally {
      setBusy(false);
    }
  }

  async function addDestination() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/operator/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: destination, label: 'Follow-up webhook' }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error || 'The destination was not saved.');
        return;
      }
      setDestination('');
      setNotice(
        'Saved. Daymark will notify that URL when someone needs a message or a person.',
      );
    } catch {
      setError('The destination could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="desk">
      <div className="desk-counts" aria-label="Desk counts">
        {(
          [
            ['all', items.length, 'Everyone'],
            ['do', counts.do, 'Do now'],
            ['wait', counts.wait, 'Wait'],
            ['skip', counts.skip, 'Leave alone'],
            ['fix', counts.fix, 'Fix record'],
          ] as const
        ).map(([key, count, label]) => (
          <button
            key={key}
            type="button"
            className={filter === key ? 'desk-chip active' : 'desk-chip'}
            onClick={() => {
              setFilter(key);
              const next =
                key === 'all'
                  ? items[0]
                  : items.find((item) => item.bucket === key);
              if (next) setSelectedId(next.id);
            }}
          >
            <strong>{count}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
      {usingSample && (
        <p className="desk-sample-note">
          This list is a labeled June Paper Co. sample. Work it like a real
          morning: pick a person, copy the next step, mark it done. Your buyers
          replace this list after you load a workspace.
        </p>
      )}
      <div className="operator-grid desk-grid">
        <section className="operator-card desk-list" aria-label="People">
          {visible.length === 0 ? (
            <p>No one in this view.</p>
          ) : (
            visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  selected?.id === item.id ? 'desk-row selected' : 'desk-row'
                }
                onClick={() => setSelectedId(item.id)}
              >
                <span className={`operator-status ${item.bucket}`}>
                  {item.label}
                </span>
                {doneIds.includes(item.id) && (
                  <span className="operator-status skip">Done in this tab</span>
                )}
                <strong>{item.headline}</strong>
                <small>
                  {item.email ?? 'No email'}
                  {item.amountLabel ? ` · ${item.amountLabel}` : ''}
                  {item.sample ? ' · Sample' : ''}
                </small>
              </button>
            ))
          )}
        </section>
        {selected && (
          <section className="operator-card" aria-label="Next step">
            <span className={`operator-status ${selected.bucket}`}>
              {selected.label}
            </span>
            <h2 style={{ marginTop: 12 }}>{selected.headline}</h2>
            <p>{selected.detail}</p>
            <div className="operator-field">
              <label htmlFor="desk-script">What to do</label>
              <textarea id="desk-script" readOnly value={selected.script} />
            </div>
            <div className="operator-actions">
              <button
                className="button-primary"
                type="button"
                onClick={() => copy(selected.script)}
              >
                <Copy size={15} /> Copy the next step
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() =>
                  writeDone(
                    doneIds.includes(selected.id)
                      ? doneIds.filter((id) => id !== selected.id)
                      : [...doneIds, selected.id],
                  )
                }
              >
                <Check size={15} />
                {doneIds.includes(selected.id)
                  ? 'Undo done'
                  : 'Mark done in this tab'}
              </button>
            </div>
          </section>
        )}
      </div>
      <div className="operator-actions">
        <button
          className="button-secondary"
          type="button"
          onClick={dropSamplePerson}
          disabled={busy}
        >
          Drop Sam on the desk
        </button>
        {token ? (
          <button
            className="button-primary"
            type="button"
            onClick={loadMine}
            disabled={busy}
          >
            Load my people <ArrowRight size={16} />
          </button>
        ) : signedIn ? (
          <button
            className="button-primary"
            type="button"
            onClick={startTrial}
            disabled={busy}
          >
            Start a trial desk
          </button>
        ) : (
          <Link href="/login" className="button-secondary">
            Sign in for a trial desk
          </Link>
        )}
        {whopUrl ? (
          <a href={whopUrl} className="button-primary">
            Buy on Whop
          </a>
        ) : (
          <Link href="/pricing" className="button-secondary">
            Pricing
          </Link>
        )}
        <button
          className="button-secondary"
          type="button"
          onClick={() => setSetupOpen((open) => !open)}
        >
          {setupOpen ? 'Hide setup' : 'Bring payments in'}
        </button>
      </div>
      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice error">{error}</div>}
      {setupOpen && (
        <section className="operator-card" style={{ marginTop: 22 }}>
          <h2>Bring payments in</h2>
          <p>
            Daymark is the desk. Stripe can POST here directly. Zapier is
            optional if you already use it. You do not need a Zap Filter to use
            the list above.
          </p>
          <div className="operator-field">
            <label htmlFor="ingest-url">URL for Stripe or Zapier</label>
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
          <div className="operator-field">
            <label htmlFor="license-key">License key from Whop</label>
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
              Optional: ping another URL when someone needs a message
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
              Save follow-up URL
            </button>
          </div>
        </section>
      )}
      <section className="operator-card" style={{ marginTop: 22 }}>
        <ShieldCheck size={18} />
        <p style={{ marginTop: 10 }}>
          <Check size={14} /> Done marks stay in this browser. They are not a
          team audit trail. Sample people are fiction. Daymark does not read ad
          accounts or log into Stripe for you.
        </p>
      </section>
    </div>
  );
}
