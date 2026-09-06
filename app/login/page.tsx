import Link from '@/components/site-link';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  ScanLine,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Brand } from '../landing';
import { chatGPTSignInPath, getChatGPTUser } from '../chatgpt-auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getChatGPTUser();
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-content">
          <span className="eyebrow">
            <span className="status-dot" /> A little clarity goes a long way
          </span>
          <h1>
            Your next move,
            <br />
            <span>a little clearer.</span>
          </h1>
          <p>
            Make room for the part of marketing that matters: understanding what
            to do next.
          </p>
          <div className="auth-preview">
            <div>
              <ScanLine size={18} />
              <span>One useful recommendation</span>
            </div>
            <strong>
              See the change.
              <br />
              Understand the evidence.
              <br />
              Make your next decision.
            </strong>
            <p>A considered brief, built around your business.</p>
          </div>
        </div>
        <span className="auth-story-footnote">
          Less searching. More understanding.
        </span>
      </section>
      <section className="auth-form-side">
        <Link href="/" className="back-home">
          <ArrowLeft size={14} /> Back to Daymark
        </Link>
        <div className="auth-form">
          <span className="large-insight-icon">
            <ScanLine size={25} />
          </span>
          <h1 id="main-content" tabIndex={-1}>
            Get early access.
          </h1>
          <p>
            {user
              ? 'You’re signed in. Save your business details and tell us which tools you use.'
              : 'Sign in to save your business details and email preference. You can try the sample report without an account.'}
          </p>
          <a
            className="button-primary auth-primary"
            href={user ? '/workspace' : chatGPTSignInPath('/workspace')}
            target={user ? undefined : '_top'}
          >
            {user ? <Check size={18} /> : <ShieldCheck size={18} />}{' '}
            {user ? 'Open my early-access profile' : 'Continue with ChatGPT'}
            <ArrowRight size={17} />
          </a>
          <div className="auth-divider">just looking?</div>
          <Link href="/demo" className="auth-secondary">
            Explore sample report <ArrowUpRight size={16} />
          </Link>
          <div className="auth-disclosure">
            <ShieldCheck size={15} />
            <span>
              Live marketing connections are still being built. Signing in saves
              your early-access details; it does not create a report from your
              business data. No payment details needed.
            </span>
          </div>
          <div className="auth-link-row">
            <Link href="/privacy">How your data is handled</Link>
            <span>Early access preview</span>
          </div>
        </div>
      </section>
    </main>
  );
}
