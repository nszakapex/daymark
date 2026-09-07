'use client';
import { useSyncExternalStore } from 'react';
import {
  emptyReview,
  parseSampleReview,
  type SampleReview,
} from '@/lib/sample-review';

const key = 'daymark-sample-review-june-paper-v2';
const changeEvent = 'daymark-sample-review-change';
let visitOnly = JSON.stringify(emptyReview);
let writeFailed = false;

function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(changeEvent, notify);
  };
}
function snapshot() {
  if (writeFailed) return 'visit:' + visitOnly;
  try {
    return (
      'stored:' + (localStorage.getItem(key) || JSON.stringify(emptyReview))
    );
  } catch {
    return 'visit:' + visitOnly;
  }
}
function serverSnapshot() {
  return 'stored:' + JSON.stringify(emptyReview);
}

export function useSampleReview() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const storageAvailable = raw.startsWith('stored:');
  const review = parseSampleReview(raw.slice(storageAvailable ? 7 : 6));
  function setReview(
    update: SampleReview | ((previous: SampleReview) => SampleReview),
  ) {
    const current = snapshot();
    const previous = parseSampleReview(
      current.slice(current.startsWith('stored:') ? 7 : 6),
    );
    const next = typeof update === 'function' ? update(previous) : update;
    visitOnly = JSON.stringify(next);
    try {
      localStorage.setItem(key, visitOnly);
      writeFailed = false;
    } catch {
      writeFailed = true;
    }
    window.dispatchEvent(new Event(changeEvent));
  }
  return { review, setReview, storageAvailable };
}
