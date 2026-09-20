import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from '../landing';
import { getChatGPTUser } from '../chatgpt-auth';
import { whopListingUrl } from '@/lib/secrets.ts';
import OperatorConsole from './operator-console';

export const dynamic = 'force-dynamic';

export default async function OperatorPage() {
  const user = await getChatGPTUser();
  return (
    <div className="operator-page">
      <header className="site-nav">
        <Brand />
        <nav>
          <Link href="/pricing">Pricing</Link>
          <Link href="/demo">Sample report</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <Link className="nav-login" href="/login">
          {user ? 'Account' : 'Log in'} <ArrowUpRight size={16} />
        </Link>
      </header>
      <main className="operator-shell" id="main-content" tabIndex={-1}>
        <span className="eyebrow">
          <span className="status-dot" /> Today
        </span>
        <h1>
          Who to email.
          <br />
          Who to stop.
          <br />
          Who to leave alone.
        </h1>
        <p className="lead">
          Daymark is a morning desk for payments and signups. Open it, do the
          next step, mark it done. Stripe or Zapier can fill the list later.
          This is not a live ad report and not a claim that a campaign worked.
        </p>
        <OperatorConsole signedIn={Boolean(user)} whopUrl={whopListingUrl()} />
      </main>
    </div>
  );
}
