import Link from '@/components/site-link';
import Platform from '@/components/platform-logo';
import { periods, money, change } from '@/lib/demo-data';
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
              Know what needs attention.
              <br />
              <span>Before the next click.</span>
            </h1>
            <p>
              Check your advertised offers, understand your marketing results,
              and see the evidence behind your next move.
            </p>
            <div className="hero-actions">
              <Link href="/demo" className="button-primary">
                Explore the sample workspace <ArrowUpRight size={19} />
              </Link>
              <span>No account or setup needed.</span>
            </div>
            <div className="hero-footnote">
              <Check size={15} /> Test an offer. Review the numbers. Follow the
              evidence.
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
                  <span>Ad spend</span>
                  <strong>
                    {money(periods.current.spend, 0)}
                    <span> →</span>
                  </strong>
                  <small>
                    {change(periods.current.spend, periods.previous.spend)} from
                    earlier dates
                  </small>
                </div>
                <div>
                  <span>Ad cost per customer</span>
                  <strong>
                    {money(periods.current.cost)}
                    <span className="orange"> ↗</span>
                  </strong>
                  <small>Previously {money(periods.previous.cost)}</small>
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
                    Does your advertised offer
                    <br />
                    work in the customer’s cart?
                  </h3>
                  <p>
                    Try a sample promotion, inspect a failed discount, and check
                    the corrected setup.
                  </p>
                  <Link href="/demo">
                    Try the offer check <ArrowRight size={16} />
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
            <h2>From the promise to the purchase.</h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>Check the offer</h3>
              <p>
                Run a sample check of a discount or free gift. See the basket
                and conditions behind the result.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Understand performance</h3>
              <p>
                Compare ad spend with first-time customers. Open the sales
                records and keep missing information visible.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Verify the next step</h3>
              <p>
                Try a corrected offer and run a new check. Use the report’s
                review checklist before making a budget decision.
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
