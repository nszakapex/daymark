import Link from '@/components/site-link';
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
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> A clearer view of your marketing
            </span>
            <h1>
              More understanding.
              <br />
              <span>Less wondering.</span>
            </h1>
            <p>
              Your marketing tells a story. Daymark brings the numbers together,
              finds what matters, and helps you make your next move.
            </p>
            <div className="hero-actions">
              <Link href="/demo" className="button-primary">
                Step inside the demo <ArrowUpRight size={19} />
              </Link>
              <span>Sample data. Zero setup.</span>
            </div>
            <div className="hero-footnote">
              <Check size={15} /> A minute to understand. A reason to act.
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
                The next move
                <br />
                is getting clearer.
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
                  <span>Paid customer cost</span>
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
                    be matched to Meta.
                  </p>
                  <Link href="/demo">
                    See the full picture <ArrowRight size={16} />
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
          <span>Built around the tools you already use</span>
          <div>
            <b>∞ Meta</b>
            <b>
              <span className="google-g">G</span> Google Ads
            </b>
            <b>Analytics</b>
            <b>Shopify</b>
            <b>stripe</b>
          </div>
          <small>Planned connections · this preview uses sample data</small>
        </div>
        <section className="how-section" id="how-it-works">
          <div>
            <span className="eyebrow">A little clarity goes a long way</span>
            <h2>
              From scattered numbers
              <br />
              to a considered next step.
            </h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>Bring your tools together.</h3>
              <p>
                Connect the marketing and sales accounts you already use. Keep
                your existing workflow.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Understand what changed.</h3>
              <p>
                See important shifts, with clear calculations and an honest view
                of missing data.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Know what to review next.</h3>
              <p>
                One specific recommendation. The evidence behind it. Room to
                make your own decision.
              </p>
            </article>
          </div>
        </section>
        <section className="access-section" id="early-access">
          <div>
            <span className="eyebrow">Taking shape, with purpose</span>
            <h2>Make your next move a clearer one.</h2>
            <p>
              Like what you see? Save a pilot profile and tell us which tools
              you use. Live connections are still in development.
            </p>
          </div>
          <Link href="/login" className="button-primary">
            Create your pilot profile <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <span>Know what matters. Make your next move.</span>
        <Link href="/login">
          Your workspace <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
