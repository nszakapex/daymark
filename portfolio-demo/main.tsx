import { createRoot } from 'react-dom/client';
import Workspace from '../app/workspace-ui';
import SampleStore from '../app/sample-store/page';
import { Brand } from '../app/landing';
import Link from '../components/site-link';
import '../app/globals.css';
import '../app/daymark.css';
import '../app/product-polish.css';
import '../app/product-responsive.css';
import '../app/customer-experience.css';
import '../app/campaign-checks.css';
import './preview.css';

function SamplePrivacy() {
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>About this sample.</h1>
      <p>
        This public Daymark preview uses fictional June Paper Co. records. It
        has no sign-in, saved business profiles, live account connections, or
        payments.
      </p>
      <h2>Offer checks and review progress</h2>
      <p>
        Offer checks compare sample terms against a fictional basket. They do
        not visit a real store. The latest twenty check inputs and timestamps
        stay in this tab’s session storage; the latest six appear in the
        interface. The review checklist stays in this browser’s local storage. A
        sidebar preference may also be saved in a browser cookie. Both histories
        have reset controls and fall back to temporary memory when browser
        storage is unavailable.
      </p>
      <h2>Hosting</h2>
      <p>
        Vercel hosts this preview and processes normal web requests, including
        the sample scenario submitted when you run a check. No advertising,
        customer, billing, or account credentials are requested. Sample history
        is not a server audit trail.
      </p>
      <Link className="text-link" href="/demo">
        ← Back to the sample
      </Link>
    </main>
  );
}

async function start() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const content =
    path === '/sample-store' ? (
      await SampleStore({
        searchParams: Promise.resolve(
          Object.fromEntries(new URLSearchParams(window.location.search)),
        ),
      })
    ) : path === '/privacy' ? (
      <SamplePrivacy />
    ) : path === '/' || path === '/demo' ? (
      <Workspace publicPreview />
    ) : (
      <main id="main-content" className="privacy-page">
        <h1>Page unavailable</h1>
        <Link href="/demo">Explore the sample</Link>
      </main>
    );
  createRoot(document.getElementById('root')!).render(content);
}

void start();
