import { markDispatch, type StoredDecision } from '@/db/operator.ts';
import type { OperatorDecision } from '@/lib/operator.ts';

export async function dispatchDecision(
  destinations: { url: string }[],
  decision: OperatorDecision,
  decisionId: string,
) {
  if (!decision.zapFilter.continue || destinations.length === 0) return;
  const body = JSON.stringify({
    mode: 'daymark-operator',
    action: decision.action,
    playbookId: decision.playbookId,
    reason: decision.reason,
    evidence: decision.evidence,
    nextStep: decision.nextStep,
    outbound: decision.outbound,
    zapFilter: decision.zapFilter,
  });
  for (const destination of destinations) {
    try {
      const response = await fetch(destination.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) {
        await markDispatch(decisionId, {
          ok: false,
          error: `Destination responded ${response.status}.`,
        });
        return;
      }
    } catch {
      await markDispatch(decisionId, {
        ok: false,
        error: 'The destination webhook could not be reached.',
      });
      return;
    }
  }
  await markDispatch(decisionId, { ok: true });
}

export function publicDecision(
  decision: OperatorDecision | StoredDecision,
  extra: Record<string, unknown> = {},
) {
  return {
    mode: 'daymark-operator',
    action: decision.action,
    playbookId: decision.playbookId,
    playbookTitle: decision.playbookTitle,
    reason: decision.reason,
    evidence: decision.evidence,
    nextStep: decision.nextStep,
    upgradeRequired: decision.upgradeRequired,
    outbound: decision.outbound,
    zapFilter: decision.zapFilter,
    ...extra,
  };
}
