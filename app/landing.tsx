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
          <Link href="/operator">Today’s desk</Link>
        </nav>
        <Link className="nav-login" href="/login">
          Log in <ArrowUpRight size={16} />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> A desk you can finish
            </span>
            <h1>
              Who to email.
              <br />
              <span>Who to leave alone.</span>
            </h1>
            <p>
              Daymark turns failed payments, new buyers, and refunds into a
              short list: email once, stop access, or do nothing. You work the
              list. Tools can fill it. You do not live inside Zapier.
            </p>
            <div className="hero-actions">
              <Link href="/operator" className="button-primary">
                Work today’s desk <ArrowUpRight size={19} />
              </Link>
              <Link href="/demo" className="button-secondary">
                Sample report
              </Link>
            </div>
            <div className="hero-footnote">
              <Check size={15} /> $49 once or $19 a month. The sample desk is
              ready now.
            </div>
          </div>
          <div className="hero-product">
            <div className="preview-top">
              <span>
                <span className="small-mark">d.</span> Today
              </span>
              <span className="label-pill">Labeled sample</span>
            </div>
            <div className="preview-inner">
              <span className="eyebrow">Sam · $38 planner</span>
              <h2>
                Email once.
                <br />
                Then stop.
              </h2>
              <div className="preview-stats">
                <div>
                  <span>Do now</span>
                  <strong>
                    2<span> →</span>
                  </strong>
                  <small>One recovery, one welcome</small>
                </div>
                <div>
                  <span>Leave alone</span>
                  <strong>
                    1<span className="orange"> ↗</span>
                  </strong>
                  <small>Same failure, same hour</small>
                </div>
              </div>
              <div className="preview-insight">
                <span className="insight-symbol">
                  <ScanLine size={19} />
                </span>
                <div>
                  <span className="eyebrow">One useful next step</span>
                  <h3>
                    Copy the note.
                    <br />
                    Mark it done.
                  </h3>
                  <p>
                    If the email or amount is missing, Daymark will not invent a
                    message. You fix the record instead of guessing.
                  </p>
                  <Link href="/operator">
                    Open the desk <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="preview-bottom">
                <span>
                  <Activity size={14} /> Five sample people
                </span>
                <span>01 / 01</span>
              </div>
            </div>
          </div>
        </section>
        <div className="ecosystem-strip">
          <span>Payments Daymark already reads</span>
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
              <b>Whop</b>
            </span>
            <span>
              <b>Zapier</b>
            </span>
          </div>
          <small>
            Stripe can post here directly. Zapier is optional. Marks are not a
            partnership claim.
          </small>
        </div>
        <section className="how-section" id="how-it-works">
          <div>
            <span className="eyebrow">How to use it</span>
            <h2>Open the list. Do the next thing.</h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>See the person</h3>
              <p>
                Failed payment, new purchase, refund, or a record that is not
                ready. Each row is someone, not a JSON action name.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Do one step</h3>
              <p>
                Copy the note, stop access, or write them yourself. Duplicates
                stay off the “do now” list.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Let money arrive</h3>
              <p>
                Point Stripe or Zapier at Daymark when you want your buyers
                instead of the sample. The desk does not change.
              </p>
            </article>
          </div>
        </section>
        <section className="how-section" id="pricing">
          <div>
            <span className="eyebrow">Pricing</span>
            <h2>A desk, not a filter pack.</h2>
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
              Failed payments and new buyers on your desk. One thousand people
              per UTC month. You work the list in Daymark.
            </p>
            <ul>
              <li>
                <Check size={16} /> Email once, or leave them alone
              </li>
              <li>
                <Check size={16} /> Incomplete records stay unsent
              </li>
              <li>
                <Check size={16} /> Sample desk you can finish today
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
              Refunds, chargebacks, cancels, and stale leads join the same list.
              Optional ping when someone needs a message.
            </p>
            <ul>
              <li>
                <Check size={16} /> 20,000 people each UTC month
              </li>
              <li>
                <Check size={16} /> Stop access after a refund
              </li>
              <li>
                <Check size={16} /> High-value failures go to you
              </li>
            </ul>
            <Link href="/pricing" className="button-primary">
              Operator details <ArrowUpRight size={16} />
            </Link>
          </article>
        </div>
        <p className="honest-note">
          The sample marketing report is still fiction. Daymark does not prove
          ads caused a sale. Buy this if you will open a list of people. Do not
          buy it if you wanted a Zapier tutorial or a live ad dashboard.
        </p>
        <section className="access-section" id="early-access">
          <div>
            <span className="eyebrow">Your account</span>
            <h2>Try the desk. License it when it is yours.</h2>
            <p>
              Sign in for a 14-day trial with your own rows. A Whop license
              keeps the same desk. Live ad connections are still not built.
            </p>
          </div>
          <Link href="/login" className="button-primary">
            Sign in <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <span>A list you can finish.</span>
        <Link href="/operator">
          Today’s desk <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
