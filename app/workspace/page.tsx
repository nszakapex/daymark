import Link from '@/components/site-link';
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
          <Link href="/demo">Sample report</Link>
          <a href={chatGPTSignOutPath('/')} target="_top">
            Sign out
          </a>
        </div>
      </header>
      <main className="profile-container" id="main-content" tabIndex={-1}>
        <section className="profile-intro">
          <span className="eyebrow">
            <span className="status-dot" /> Your early-access profile
          </span>
          <h1>Your early-access details.</h1>
          <p>
            Choose what you want to understand and the tools you use. You can
            update or delete these details here.
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
                <strong>Your business details</strong>
                <p>Save your preferences for early access.</p>
              </div>
            </div>
            <div>
              <span>3</span>
              <div>
                <strong>Try a sample report</strong>
                <p>
                  Work through a review while live connections are in
                  development.
                </p>
              </div>
            </div>
          </div>
          <Link href="/demo" className="text-link">
            Explore sample report <ArrowUpRight size={16} />
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
