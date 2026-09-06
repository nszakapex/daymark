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
          <a href="#early-access">Early access</a>
        </nav>
        <Link className="nav-login" href="/login">
          Log in <ArrowUpRight size={16} />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> A clearer view of your marketing
            </span>
            <h1>
              Know your next move.
              <br />
              <span>Before you spend more.</span>
            </h1>
            <p>
              See what you spent on ads, how many new customers were linked to
              them, and what to check before you spend more.
            </p>
            <div className="hero-actions">
              <Link href="/demo" className="button-primary">
                Explore sample report <ArrowUpRight size={19} />
              </Link>
              <span>No account or setup needed.</span>
            </div>
            <div className="hero-footnote">
              <Check size={15} /> Try the review checklist with a sample
              business.
            </div>
          </div>
          <div className="hero-product">
            <div className="preview-top">
              <span>
                <span className="small-mark">d.</span> June Paper Co.
              </span>
              <span className="label-pill">Sample workspace</span>
            </div>
            <div className="preview-inner">
              <span className="eyebrow">Your marketing, understood</span>
              <h2>
                One change.
                <br />
                Your next move.
              </h2>
              <div className="preview-stats">
                <div>
                  <span>Marketing spend</span>
                  <strong>
                    $2,400<span> →</span>
                  </strong>
                  <small>Unchanged from last period</small>
                </div>
                <div>
                  <span>Ad cost per customer</span>
                  <strong>
                    $50<span className="orange"> ↗</span>
                  </strong>
                  <small>Up 25% from $40</small>
                </div>
              </div>
              <div className="preview-insight">
                <span className="insight-symbol">
                  <ScanLine size={19} />
                </span>
                <div>
                  <span className="eyebrow">
                    One thing worth your attention
                  </span>
                  <h3>
                    Take a closer look at Meta
                    <br />
                    before increasing your budget.
                  </h3>
                  <p>
                    Your spending held steady. Fewer new paying customers could
                    be linked to Meta.
                  </p>
                  <Link href="/demo">
                    Open this sample report <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="preview-bottom">
                <span>
                  <Activity size={14} /> Two completed 28-day periods
                </span>
                <span>01 / 01</span>
              </div>
            </div>
          </div>
        </section>
        <div className="ecosystem-strip">
          <span>Connections we are building</span>
          <div className="ecosystem-logos">
            {[
              { name: 'Meta', label: 'Meta' },
              { name: 'Google', label: 'Google Ads' },
              { name: 'Analytics', label: 'Analytics' },
              { name: 'Shopify', label: 'Shopify' },
              { name: 'Stripe', label: 'Stripe' },
            ].map((platform) => (
              <span key={platform.name}>
                <Platform name={platform.name} />
                <b>{platform.label}</b>
              </span>
            ))}
          </div>
          <small>Planned connections · this preview uses sample data</small>
        </div>
        <section className="how-section" id="how-it-works">
          <div>
            <span className="eyebrow">How to use the sample</span>
            <h2>Three steps to a clearer decision.</h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>See what changed.</h3>
              <p>
                Compare ad spending with new customers over two complete
                periods. See the change that deserves attention.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Understand the numbers.</h3>
              <p>
                Open the calculation. See which customers are included and what
                information is missing.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Work through the next step.</h3>
              <p>
                Follow a short checklist, save your sample review, and leave
                knowing what you would check in your business.
              </p>
            </article>
          </div>
        </section>
        <section className="access-section" id="early-access">
          <div>
            <span className="eyebrow">Early access</span>
            <h2>Want to use your own numbers?</h2>
            <p>
              Save your business details and tell us which tools you use. Live
              connections are in development. You can choose whether to receive
              email about early access.
            </p>
          </div>
          <Link href="/login" className="button-primary">
            Get early access <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <span>Clear numbers. Your decision.</span>
        <Link href="/login">
          Early-access profile <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
