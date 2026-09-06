'use client';

import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function ReviewGuide({
  checks,
  onCheck,
  onDetails,
  onFinish,
  storageAvailable,
}: {
  checks: boolean[];
  onCheck: (index: number, checked: boolean) => void;
  onDetails: (panel: 'evidence' | 'coverage') => void;
  onFinish: () => void;
  storageAvailable: boolean;
}) {
  const completed = checks.filter(Boolean).length;
  const steps = [
    {
      title: 'Compare customers, not just clicks.',
      text: 'Meta spent $960 in each period. The number of new customers linked to its ads fell from 24 to 12. That raised the cost from $40 to $80 per customer. Google stayed at $40.',
      label: 'I understand what changed',
      link: 'See the calculation',
      panel: 'evidence' as const,
    },
    {
      title: 'Check the missing information.',
      text: '12 new customers have no marketing source recorded. In a real review, open your sales records, check their first-purchase dates and source fields, and confirm that recent sales have been included. Do not guess where they came from.',
      label: 'I know which records to check',
      link: 'See which customers are included',
      panel: 'coverage' as const,
    },
    {
      title: 'Review before you increase spending.',
      text: 'Use the corrected records to compare Meta again. If its cost is still above your target, ask whoever manages your ads to explain the change before raising the budget. This report alone cannot tell you which individual ad to pause.',
      label: 'I know my next step',
    },
  ];
  return (
    <div className="review-guide">
      <output className="review-progress" aria-live="polite">
        <strong>{completed} of 3 steps reviewed</strong>
        <span>
          This checklist records your review. It does not change your ads.
        </span>
      </output>
      {steps.map((step, index) => (
        <section
          className={'review-step ' + (checks[index] ? 'is-checked' : '')}
          key={step.title}
        >
          <div className="review-step-title">
            <span>{checks[index] ? <Check size={18} /> : index + 1}</span>
            <h3>{step.title}</h3>
          </div>
          <p>{step.text}</p>
          {step.panel && (
            <button
              className="text-link"
              onClick={() => onDetails(step.panel!)}
            >
              {step.link} <ArrowRight size={16} />
            </button>
          )}
          <label className="review-check">
            <Checkbox
              checked={checks[index]}
              onCheckedChange={(value) => onCheck(index, value === true)}
            />
            <span>{step.label}</span>
          </label>
        </section>
      ))}
      <div className="review-finish">
        <Button disabled={completed !== 3} onClick={onFinish}>
          Finish review <Check size={17} />
        </Button>
        <p>
          {completed !== 3
            ? 'Check each step above when you have read it.'
            : 'Ready. You can return to this review at any time.'}
        </p>
        <small>
          {storageAvailable
            ? 'Sample progress is saved only in this browser.'
            : 'Browser storage is unavailable. Progress lasts until you leave or reload this page.'}
        </small>
      </div>
    </div>
  );
}
