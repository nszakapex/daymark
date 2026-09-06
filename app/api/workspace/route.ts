import { getChatGPTUser } from '@/app/chatgpt-auth';
import { deleteProfile, readProfile, saveProfile } from '@/db/profiles';
import { validateProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';
const response = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return response({ error: 'Please sign in to access your workspace.' }, 401);
  try {
    return response({ profile: await readProfile(user.userId) });
  } catch {
    return response(
      { error: 'Your profile is temporarily unavailable. Please try again.' },
      503,
    );
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return response({ error: 'Please sign in to save your workspace.' }, 401);
  if (!sameOrigin(request))
    return response({ error: 'Please save from the Daymark website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return response({ error: 'A JSON form submission is required.' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 4000)
    return response({ error: 'The submitted profile is too large.' }, 413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 4000)
      return response({ error: 'The submitted profile is too large.' }, 413);
    input = validateProfile(JSON.parse(raw));
  } catch (error) {
    return response(
      {
        error:
          error instanceof SyntaxError
            ? 'Please submit a valid profile.'
            : error instanceof Error
              ? error.message
              : 'Please check your profile details.',
      },
      400,
    );
  }
  try {
    return response({
      profile: await saveProfile(user.userId, user.email, input),
    });
  } catch {
    return response(
      { error: 'Your profile could not be saved. Please try again.' },
      503,
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return response({ error: 'Please sign in to remove your profile.' }, 401);
  if (!sameOrigin(request))
    return response({ error: 'Please make this request from Daymark.' }, 403);
  try {
    await deleteProfile(user.userId);
    return response({ deleted: true });
  } catch {
    return response(
      { error: 'Your profile could not be removed. Please try again.' },
      503,
    );
  }
}
