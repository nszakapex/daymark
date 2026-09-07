'use client';
import { useSyncExternalStore } from 'react';
import {
  checkOffer,
  getOffer,
  type OfferResult,
  type Setup,
} from '@/lib/offer-checks';
import { sampleBusiness } from '@/lib/synthetic-data';
const key = 'daymark-offer-history-' + sampleBusiness.version;
const event = 'daymark-offer-history-change';
let fallback = '[]';
let writeFailed = false;
function subscribe(notify: () => void) {
  window.addEventListener(event, notify);
  return () => window.removeEventListener(event, notify);
}
function snapshot() {
  try {
    if (!writeFailed) return 'stored:' + (sessionStorage.getItem(key) ?? '[]');
  } catch {
    /* Browser may block session storage. */
  }
  return 'visit:' + fallback;
}
function parse(raw: string): OfferResult[] {
  try {
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows)) return [];
    return rows.slice(0, 20).flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const offer =
        typeof row.offerId === 'string' ? getOffer(row.offerId) : undefined;
      if (
        !offer ||
        !['current', 'corrected', 'unavailable'].includes(row.setup) ||
        typeof row.marketConfirmed !== 'boolean' ||
        typeof row.observedAt !== 'string' ||
        !Number.isFinite(Date.parse(row.observedAt))
      )
        return [];
      // Persist only fictional check inputs and the original observation time.
      return [
        {
          ...checkOffer(offer.id, row.setup as Setup, row.marketConfirmed),
          observedAt: row.observedAt,
        },
      ];
    });
  } catch {
    return [];
  }
}
export function useOfferHistory() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => 'stored:[]');
  const storageAvailable = raw.startsWith('stored:');
  const results = parse(raw.slice(storageAvailable ? 7 : 6));
  function setResults(
    update: OfferResult[] | ((previous: OfferResult[]) => OfferResult[]),
  ) {
    const previous = snapshot();
    const rows = parse(previous.slice(previous.startsWith('stored:') ? 7 : 6));
    const next = typeof update === 'function' ? update(rows) : update;
    fallback = JSON.stringify(
      next
        .slice(0, 20)
        .map(({ offerId, setup, marketConfirmed, observedAt }) => ({
          offerId,
          setup,
          marketConfirmed,
          observedAt,
        })),
    );
    try {
      sessionStorage.setItem(key, fallback);
      writeFailed = false;
    } catch {
      writeFailed = true;
    }
    window.dispatchEvent(new Event(event));
  }
  return { results, setResults, storageAvailable };
}
