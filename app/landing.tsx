import Link from '@/components/site-link';
import Platform from '@/components/platform-logo';
import {
  ArrowUpRight,
  ArrowRight,
  ScanLine,
  Check,
  Activity,
} from 'lucide-react';

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Daymark home">
      <span className="brand-symbol">
        <i />
        <i />
        <i />
      </span>
      daymark<span className="brand-dot">.</span>
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="site-nav">
        <Brand />
        <nav>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/operator">Operator</Link>
        </nav>
        <Link className="nav-login" href="/login">
          Log in <ArrowUpRight size={16} />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> Zapier decides nothing. Daymark
              does.
            </span>
            <h1>
              Stop the wrong Zap.
              <br />
              <span>Release the right one.</span>
            </h1>
            <p>
              Daymark sits in front of Zapier and decides whether an event
              should fire, wait, or stay unknown. You get a reason, not another
              filter you have to babysit.
            </p>
            <div className="hero-actions">
              <Link href="/operator" className="button-primary">
                Open the operator <ArrowUpRight size={19} />
              </Link>
              <Link href="/demo" className="button-secondary">
                Sample report
              </Link>
            </div>
            <div className="hero-footnote">
              <Check size={15} /> $49 once or $19 a month. Works with Zapier
              Webhooks the same day.
            </div>
          </div>
          <div className="hero-product">
            <div className="preview-top">
              <span>
                <span className="small-mark">d.</span> Operator decision
              </span>
              <span className="label-pill">Live webhook, not a cart guess</span>
            </div>
            <div className="preview-inner">
              <span className="eyebrow">
                Failed payment · Stripe via Zapier
              </span>
              <h2>
                Fire recovery.
                <br />
                Once.
              </h2>
              <div className="preview-stats">
                <div>
                  <span>Action</span>
                  <strong>
                    fire
                    <span> →</span>
                  </strong>
                  <small>Continue the Zap only on fire or escalate</small>
                </div>
                <div>
                  <span>Same event, same hour</span>
                  <strong>
                    suppress
                    <span className="orange"> ↗</span>
                  </strong>
                  <small>Duplicates do not get a second email</small>
                </div>
              </div>
              <div className="preview-insight">
                <span className="insight-symbol">
                  <ScanLine size={19} />
                </span>
                <div>
                  <span className="eyebrow">One useful next step</span>
                  <h3>
                    Missing email or amount
                    <br />
                    stays inconclusive
                  </h3>
                  <p>
                    Daymark will not invent a buyer, a product, or a reason the
                    ads worked. Incomplete events do not start automations.
                  </p>
                  <Link href="/operator">
                    Send a sample event <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="preview-bottom">
                <span>
                  <Activity size={14} /> Decision in the Zap response
                </span>
                <span>01 / 01</span>
              </div>
            </div>
          </div>
        </section>
        <div className="ecosystem-strip">
          <span>Events Daymark already reads</span>
          <div className="ecosystem-logos">
            {[
              { name: 'Stripe', label: 'Stripe' },
              { name: 'Shopify', label: 'Shopify' },
            ].map((platform) => (
              <span key={platform.label}>
                <Platform name={platform.name} />
                <b>{platform.label}</b>
              </span>
            ))}
            <span>
              <b>Zapier</b>
            </span>
            <span>
              <b>Whop</b>
            </span>
            <span>
              <b>Your stack</b>
            </span>
          </div>
          <small>
            Zapier and Whop are named as tools, not as partners. No unofficial
            marks were added.
          </small>
        </div>
        <section className="how-section" id="how-it-works">
          <div>
            <span className="eyebrow">How the operator works</span>
            <h2>From the event to the next Zap.</h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>Catch the event</h3>
              <p>
                Stripe, Whop, Shopify, or a form posts into Zapier. Zapier POSTs
                that payload to Daymark. Raw Stripe events are fine.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Get a decision</h3>
              <p>
                Fire, hold, suppress, escalate, or inconclusive. The reason and
                evidence come back in the same request so Zapier can filter.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Release one action</h3>
              <p>
                Continue only when the action is fire or escalate. High-value
                failures and chargebacks go to a person, not a dunning sequence.
              </p>
            </article>
          </div>
        </section>
        <section className="how-section" id="pricing">
          <div>
            <span className="eyebrow">Pricing</span>
            <h2>Built to ship on Whop.</h2>
          </div>
        </section>
        <div className="price-grid">
          <article className="price-card">
            <span className="eyebrow">One-time</span>
            <h2>Starter</h2>
            <div className="price">
              $49 <span>once</span>
            </div>
            <p>
              Failed-payment and new-buyer playbooks. The decision comes back
              inside the Zap. No monthly fee, no outbound fan-out.
            </p>
            <ul>
              <li>
                <Check size={16} /> 1,000 events each UTC month
              </li>
              <li>
                <Check size={16} /> Dedup and inconclusive holds
              </li>
              <li>
                <Check size={16} /> Zapier recipes you can copy today
              </li>
            </ul>
            <Link href="/pricing" className="button-secondary">
              Starter details <ArrowRight size={16} />
            </Link>
          </article>
          <article className="price-card featured">
            <span className="eyebrow">Monthly</span>
            <h2>Operator</h2>
            <div className="price">
              $19 <span>/ month</span>
            </div>
            <p>
              Refunds, chargebacks, churn, and stale leads. Optional outbound
              webhooks if you want a second Zap to catch the decision.
            </p>
            <ul>
              <li>
                <Check size={16} /> 20,000 events each UTC month
              </li>
              <li>
                <Check size={16} /> Up to three Zapier destinations
              </li>
              <li>
                <Check size={16} /> The playbooks Starter only names
              </li>
            </ul>
            <Link href="/pricing" className="button-primary">
              Operator details <ArrowUpRight size={16} />
            </Link>
          </article>
        </div>
        <p className="honest-note">
          This is not a claim that automations make money, or that ads caused a
          sale. The sample marketing workspace is still fictional and labeled. A
          webhook is not a store pilot. Buy this if you want fewer reckless
          Zaps, not if you want proof that a promotion worked.
        </p>
        <section className="access-section" id="early-access">
          <div>
            <span className="eyebrow">Your account</span>
            <h2>Trial from sign-in. License from Whop.</h2>
            <p>
              Sign in to start a 14-day, 75-event trial. A Whop license upgrades
              the same workspace. Live ad-account connections are still not
              implemented; the operator does not need them.
            </p>
          </div>
          <Link href="/login" className="button-primary">
            Sign in <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <span>A reason before the next Zap.</span>
        <Link href="/operator">
          Open the operator <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
