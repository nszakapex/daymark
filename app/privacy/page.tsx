import Link from '@/components/site-link';
import { ArrowLeft } from 'lucide-react';
import { Brand } from '../landing';
export default function PrivacyPage() {
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>How your data is handled.</h1>
      <p>
        Daymark is an early product preview. The sample marketing workspace
        contains fictional business records. It does not connect to advertising,
        analytics, customer, or payment accounts.
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
      <h2>Before real business data</h2>
      <p>
        Any live pilot will need a clear agreement covering the data sources,
        permissions, retention, and delivery involved. This preview does not
        collect real customer records or billing details.
      </p>
      <Link className="text-link" href="/workspace">
        <ArrowLeft size={15} /> Back to early-access details
      </Link>
    </main>
  );
}
