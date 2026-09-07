import { checkOffer, getOffer, type Setup } from '@/lib/offer-checks';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const raw = await request.text();
    if (raw.length > 1000)
      return Response.json(
        { error: 'Request too large.' },
        { status: 413, headers },
      );
    const input = JSON.parse(raw);
    if (
      !input ||
      typeof input !== 'object' ||
      typeof input.offerId !== 'string' ||
      !getOffer(input.offerId) ||
      !['current', 'corrected', 'unavailable'].includes(input.setup) ||
      (input.marketConfirmed !== undefined &&
        typeof input.marketConfirmed !== 'boolean')
    ) {
      return Response.json(
        { error: 'Choose a sample offer and setup.' },
        { status: 400, headers },
      );
    }
    const offer = getOffer(input.offerId)!;
    return Response.json(
      checkOffer(
        offer.id,
        input.setup as Setup,
        input.marketConfirmed === true,
      ),
      { headers },
    );
  } catch {
    return Response.json(
      { error: 'The sample check could not be read. Try again.' },
      { status: 400, headers },
    );
  }
}
