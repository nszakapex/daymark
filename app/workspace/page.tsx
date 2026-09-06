import Link from 'next/link';
import { ArrowUpRight, Check, CircleDashed } from 'lucide-react';
import { Brand } from '../landing';
import { chatGPTSignOutPath, requireChatGPTUser } from '../chatgpt-auth';
import { readProfile } from '@/db/profiles';
import ProfileForm from './profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireChatGPTUser('/workspace');
  let profile = null;
  let unavailable = false;
  try {
    profile = await readProfile(user.userId);
  } catch {
    unavailable = true;
  }
  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <Brand />
        <div>
          <span className="sample-tag">
            <CircleDashed size={13} /> Early access
          </span>
          <Link href="/demo">Explore demo</Link>
          <a href={chatGPTSignOutPath('/')} target="_top">
            Sign out
          </a>
        </div>
      </header>
      <main className="profile-container">
        <section className="profile-intro">
          <span className="eyebrow">
            <span className="status-dot" /> Your Daymark workspace
          </span>
          <h1>
            A little about you.
            <br />A lot more clarity.
          </h1>
          <p>
            Tell us what you want to understand and where your marketing
            happens. Your profile helps shape a useful first pilot.
          </p>
          <div className="profile-steps">
            <div>
              <span>
                <Check size={12} />
              </span>
              <div>
                <strong>Your account is ready</strong>
                <p>You’re signed in securely.</p>
              </div>
            </div>
            <div>
              <span>2</span>
              <div>
                <strong>Make this workspace yours</strong>
                <p>Save your business details and contact preference.</p>
              </div>
            </div>
            <div>
              <span>3</span>
              <div>
                <strong>See what your brief could look like</strong>
                <p>Explore the sample. Live connections come later.</p>
              </div>
            </div>
          </div>
          <Link href="/demo" className="text-link">
            Take a look inside the sample workspace <ArrowUpRight size={16} />
          </Link>
        </section>
        <ProfileForm
          initialProfile={profile}
          email={user.email}
          unavailable={unavailable}
        />
      </main>
    </div>
  );
}
