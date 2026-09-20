import Link from '@/components/site-link';
import { ArrowLeft } from 'lucide-react';
import { Brand } from '../landing';
export default function PrivacyPage() {
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>How your data is handled.</h1>
      <p>
        Daymark is an early product. The sample marketing workspace contains
        fictional business records. It does not connect to advertising,
        analytics, customer, or payment accounts. The operator accepts events
        you send through Zapier or the sample key.
      </p>
      <h2>When you sign in</h2>
      <p>
        This preview uses Sign in with ChatGPT. Daymark receives an account
        identifier, email address, and an available display name to recognize
        your account. It does not receive your password or conversation history
        through this sign-in.
      </p>
      <h2>When you save early-access details</h2>
      <p>
        We store the business name, optional website, selected goal, tools,
        email address, contact preference, and save dates. These records belong
        to your account. The operator of this Daymark preview can access stored
        profiles to manage early access. Selecting a marketing tool does not
        authorize access to it.
      </p>
      <h2>Your choice</h2>
      <p>
        Pilot contact is optional. You can update your preference or delete your
        business profile from your workspace. Deleting the profile removes it
        from the active application database; it does not delete your ChatGPT
        account or immediately purge infrastructure backups and operational
        logs.
      </p>
      <h2>Your sample review</h2>
      <p>
        The sample checklist saves progress in this browser, separately from
        your account. It contains only the steps you checked, not real business
        records. Use “Start this sample review over” on the review page to clear
        your progress. If browser storage is unavailable, progress lasts only
        for that visit.
      </p>
      <h2>Your sample offer checks</h2>
      <p>
        Sample offer checks retain fictional check inputs and timestamps in this
        tab’s browser session so you can return from the sample cart without
        losing the history. Use “Clear sample history” to remove them. If
        session storage is unavailable, results last until you leave or reload
        the page. This sample history is not saved to your account.
      </p>
      <h2>Operator events</h2>
      <p>
        Operator events you send with a workspace key are stored with the
        decision, including email, amount, source, type, and the JSON you
        posted. The sample key does not store events. License keys are hashed.
        Workspace tokens are shown once and stored as hashes. Daymark does not
        receive your Zapier password.
      </p>
      <h2>Buying on Whop</h2>
      <p>
        Payment is handled by Whop when you publish a listing. This application
        does not take cards. A Whop webhook is only verified if you configure a
        signing secret; it does not invent a membership.
      </p>
      <h2>Connecting a real business</h2>
      <p>
        Live advertising imports and real browser offer checks are still
        unimplemented. Do not describe them as shipping. The operator does not
        need those connections. Any later import will need a clear agreement
        covering sources, permissions, and retention.
      </p>
      <Link className="text-link" href="/operator">
        <ArrowLeft size={15} /> Back to the operator
      </Link>
    </main>
  );
}
