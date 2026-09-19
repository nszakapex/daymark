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
          <Link href="/demo">Sample</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <Link className="nav-login" href="/login">
          {user ? 'Account' : 'Log in'} <ArrowUpRight size={16} />
        </Link>
      </header>
      <main className="operator-shell" id="main-content" tabIndex={-1}>
        <span className="eyebrow">
          <span className="status-dot" /> Operator
        </span>
        <h1>
          Connect Zapier.
          <br />
          Keep the reason.
        </h1>
        <p className="lead">
          POST events to Daymark. Filter your Zap on the action that comes back.
          Incomplete events stay inconclusive. Duplicates do not get a second
          send. This is not a live store check and not a claim that a campaign
          worked.
        </p>
        <OperatorConsole signedIn={Boolean(user)} whopUrl={whopListingUrl()} />
      </main>
    </div>
  );
}
