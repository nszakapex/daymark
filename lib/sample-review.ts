export type SampleReview = { checks: boolean[]; completed: boolean };
export const emptyReview: SampleReview = {
  checks: [false, false, false],
  completed: false,
};

export function parseSampleReview(raw: string | null): SampleReview {
  try {
    const saved: unknown = JSON.parse(raw || 'null');
    if (!saved || typeof saved !== 'object') return emptyReview;
    const value = saved as Record<string, unknown>;
    if (
      !Array.isArray(value.checks) ||
      value.checks.length !== 3 ||
      !value.checks.every((item) => typeof item === 'boolean')
    )
      return emptyReview;
    return {
      checks: value.checks,
      completed: value.completed === true && value.checks.every(Boolean),
    };
  } catch {
    return emptyReview;
  }
}
