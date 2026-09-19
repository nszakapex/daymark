import Link from '@/components/site-link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Brand } from '../landing';
import { whopListingUrl } from '@/lib/secrets.ts';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const listing = whopListingUrl();
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>What people can actually buy.</h1>
      <p>
        Daymark sells a decision layer for Zapier, not a promise that deals or
        ads worked. The prices stay in a range a Whop buyer will pay without a
        sales call: $49 once, or $19 each month.
      </p>
      <h2>Starter · $49 once</h2>
      <p>
        Failed-payment recovery and new-buyer routing. 1,000 events per UTC
        month. The Zap reads the JSON response and filters on{' '}
        <code>action</code>. There is no outbound webhook. This is the SKU you
        can fulfill with a lifetime license key on Whop.
      </p>
      <h2>Operator · $19 / month</h2>
      <p>
        Adds refund watch, chargebacks, membership churn, and stale-lead
        follow-up. 20,000 events per UTC month and up to three Zapier catch
        hooks. This is the SKU you fulfill as a recurring Whop membership. Issue
        a new 35-day license when they renew, or they redeem again.
      </p>
      <h2>What is included in both</h2>
      <p>
        Dedup in a one-hour window, inconclusive holds when email, amount, or
        product is missing, Stripe/Whop/Shopify payload reading, and the recipes
        on the operator page. An optional model can be added later behind the
        same decision object. The default is a coded operator, not a chatbot.
      </p>
      <h2>What is not included</h2>
      <p>
        Live ad accounts, Shopify cart browser checks, proof that a campaign
        caused a sale, and a hosted Whop checkout inside this app. Those are
        still unbuilt or deliberately out of scope. Do not sell them.
      </p>
      <h2>How you ship this on Whop</h2>
      <p>
        Create two products. Put generated Daymark license keys in Whop’s
        license-key fulfillment. The buyer opens /operator and redeems. Set{' '}
        <code>DAYMARK_LICENSE_SECRET</code> on the host before issuing keys. Set{' '}
        <code>DAYMARK_WHOP_URL</code> to the public listing when it exists. Read
        the ship notes in the repository before you take money.
      </p>
      <div className="operator-actions" style={{ marginTop: 28 }}>
        {listing ? (
          <a className="button-primary" href={listing}>
            Buy on Whop <ArrowUpRight size={16} />
          </a>
        ) : (
          <span className="notice">
            No Whop listing URL is configured on this host yet. That is
            intentional until you publish one.
          </span>
        )}
        <Link className="button-secondary" href="/operator">
          Open the operator <Check size={16} />
        </Link>
      </div>
      <Link className="text-link" href="/">
        <ArrowLeft size={15} /> Back to Daymark
      </Link>
    </main>
  );
}
