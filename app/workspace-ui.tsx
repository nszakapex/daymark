'use client';
import Link from '@/components/site-link';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ChartNoAxesCombined,
  ScanLine,
  Plug,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  ShieldCheck,
  CircleDashed,
  Lightbulb,
  Target,
  Info,
  Clock3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Brand } from './landing';
import { reportFor, demoFinding, type Period } from '@/lib/demo-data';

const sections = [
  { id: 'overview', label: 'Your brief', icon: LayoutDashboard },
  { id: 'channels', label: 'Channels', icon: ChartNoAxesCombined },
  { id: 'decisions', label: 'Decisions', icon: CheckCheck },
  { id: 'connections', label: 'Connections', icon: Plug },
] as const;
type Section = (typeof sections)[number]['id'];
type Context = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options?: { signal: AbortSignal },
  ) => void | Promise<void>;
};
function Platform({ name }: { name: string }) {
  return (
    <span className={'platform-icon ' + name.toLowerCase()}>
      {name === 'Meta'
        ? '∞'
        : name === 'Google'
          ? 'G'
          : name === 'Sales'
            ? 'J'
            : name.charAt(0)}
    </span>
  );
}
function MiniBars({ values }: { values: readonly number[] }) {
  return (
    <div className="mini-bars" aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} style={{ height: Math.max(v * 2, 8) }} />
      ))}
    </div>
  );
}

export default function Workspace() {
  const [section, setSection] = useState<Section>('overview');
  const [period, setPeriod] = useState<Period>('current');
  const [panel, setPanel] = useState<
    'evidence' | 'coverage' | 'connection' | 'help' | null
  >(null);
  const [reviewed, setReviewed] = useState(false);
  const [connection, setConnection] = useState('Meta');
  const report = reportFor(period);
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const tool = {
      name: 'read_daymark_sample_report',
      description:
        'Read the fictional Daymark marketing report for a completed period. This never accesses live business accounts.',
      inputSchema: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['current', 'previous'] },
        },
        required: ['period'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: (input: unknown) => {
        const p = (input as { period?: unknown })?.period;
        if (p !== 'current' && p !== 'previous')
          throw Error('period must be current or previous');
        return {
          mode: 'fictional-demo',
          ...reportFor(p),
          recommendation: p === 'current' ? demoFinding : null,
        };
      },
    };
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: controller.signal }),
      ).catch(() => {});
    } catch {}
    return () => controller.abort();
  }, []);
  function openConnection(name: string) {
    setConnection(name);
    setPanel('connection');
  }
  return (
    <SidebarProvider
      className="workspace"
      style={{ '--sidebar-width': '238px' } as React.CSSProperties}
    >
      <Sidebar className="daymark-sidebar">
        <SidebarHeader className="app-brand">
          <Brand />
        </SidebarHeader>
        <SidebarContent>
          <div className="business-card">
            <span className="business-avatar">J</span>
            <div>
              <strong>June Paper Co.</strong>
              <span>Sample business</span>
            </div>
            <span className="demo-dot" />
          </div>
          <div className="sidebar-label">Workspace</div>
          <SidebarMenu className="app-menu">
            {sections.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className="app-nav-item"
                  isActive={section === item.id}
                  onClick={() => setSection(item.id)}
                  aria-current={section === item.id ? 'page' : undefined}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'overview' && (
                    <span className="nav-count">1</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="sidebar-note">
            <div>
              <span className="status-dot" /> A little clarity, every week.
            </div>
            <p>The useful part of your marketing data, brought into focus.</p>
          </div>
        </SidebarContent>
        <SidebarFooter className="app-sidebar-footer">
          <button onClick={() => setPanel('help')}>
            <CircleHelp size={17} /> How to read your brief
          </button>
          <Link href="/login" className="profile-link">
            <span className="profile-avatar">D</span>
            <span>
              <strong>Demo explorer</strong>
              <small>Open your own workspace</small>
            </span>
            <ArrowUpRight size={16} />
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="workspace-inset">
        <header className="app-topbar">
          <div>
            <SidebarTrigger className="mobile-menu" />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{sections.find((s) => s.id === section)?.label}</strong>
          </div>
          <div>
            <span className="sample-tag">
              <CircleDashed size={13} /> Demo · fictional data
            </span>
            <Link href="/" aria-label="Back to website">
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </header>
        <main className="app-main">
          <div className="brief-heading">
            <div>
              <span className="eyebrow">
                June Paper Co. / Marketing intelligence
              </span>
              <h1>
                {section === 'overview'
                  ? 'Your marketing, understood.'
                  : section === 'channels'
                    ? 'The story behind each channel.'
                    : section === 'decisions'
                      ? 'Good decisions deserve a memory.'
                      : 'Everything in its place.'}
              </h1>
              <p>
                {section === 'overview'
                  ? 'The important changes. The evidence. Your next move.'
                  : section === 'channels'
                    ? 'Comparable periods, consistent definitions, a clearer picture.'
                    : section === 'decisions'
                      ? 'Keep the context behind the choices you make.'
                      : 'A clear view of what contributes to your brief.'}
              </p>
            </div>
            {(section === 'overview' || section === 'channels') && (
              <Select
                value={period}
                onValueChange={(value) => {
                  if (value === 'current' || value === 'previous')
                    setPeriod(value);
                }}
              >
                <SelectTrigger
                  className="period-select"
                  aria-label="Reporting period"
                >
                  <Clock3 size={15} />
                  <SelectValue>{report.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Aug 7 – Sep 3, 2026</SelectItem>
                  <SelectItem value="previous">Jul 10 – Aug 6, 2026</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {(section === 'overview' || section === 'channels') && (
            <>
              <div className="metrics-grid">
                <article className="metric-card">
                  <span>
                    Total advertising spend{' '}
                    <span className="metric-number">01</span>
                  </span>
                  <div>
                    <strong>$2,400</strong>
                    <MiniBars values={[8, 10, 10, 12, 10, 11, 10, 12]} />
                  </div>
                  <p>
                    <span className="neutral-pill">— Same spend</span>
                    <span>across both periods</span>
                  </p>
                </article>
                <article className="metric-card">
                  <span>
                    Matched new paid customers{' '}
                    <span className="metric-number">02</span>
                  </span>
                  <div>
                    <strong>{report.paidCustomers}</strong>
                    <MiniBars
                      values={
                        period === 'current'
                          ? [15, 14, 13, 12, 11, 10, 10, 9]
                          : [12, 13, 14, 15, 14, 15, 16, 15]
                      }
                    />
                  </div>
                  <p>
                    {period === 'current' ? (
                      <>
                        <span className="change-pill">↘ 20%</span>
                        <span>60 in the previous period</span>
                      </>
                    ) : (
                      <span>60 customers with a paid source match</span>
                    )}
                  </p>
                </article>
                <article className="metric-card">
                  <span>
                    Cost per matched customer{' '}
                    <span className="metric-number">03</span>
                  </span>
                  <div>
                    <strong>${report.cost}</strong>
                    <MiniBars
                      values={
                        period === 'current'
                          ? [8, 10, 9, 12, 12, 14, 16, 18]
                          : [10, 10, 10, 10, 10, 10, 10, 10]
                      }
                    />
                  </div>
                  <p>
                    {period === 'current' ? (
                      <>
                        <span className="change-pill">↗ 25%</span>
                        <span>$40 in the previous period</span>
                      </>
                    ) : (
                      <span>Advertising spend ÷ matched customers</span>
                    )}
                  </p>
                </article>
              </div>
              {section === 'overview' && (
                <div
                  className={
                    'main-insight ' +
                    (period === 'previous' ? 'steady-insight' : '')
                  }
                >
                  <div className="insight-leading">
                    <span className="large-insight-icon">
                      <ScanLine size={24} />
                    </span>
                    <span className="eyebrow">
                      {period === 'current'
                        ? 'One thing worth your attention'
                        : 'Your previous baseline'}
                    </span>
                    <span className="attention-pill">
                      {period === 'current'
                        ? 'Worth a review'
                        : 'Within target'}
                    </span>
                  </div>
                  <div className="insight-body">
                    <div>
                      <h2>
                        {period === 'current' ? (
                          <>
                            Same spend.
                            <br />
                            Fewer new customers.
                          </>
                        ) : (
                          <>
                            A useful baseline.
                            <br />
                            Both channels at $40.
                          </>
                        )}
                      </h2>
                      <p>
                        {period === 'current'
                          ? 'Acquiring a new paying customer cost 25% more this period. The change is concentrated in Meta; Google held steady.'
                          : 'Both paid channels recorded a $40 cost per matched new customer, below the sample owner’s $60 target.'}
                      </p>
                      <button
                        className="text-link"
                        onClick={() => setPanel('evidence')}
                      >
                        Follow the evidence <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="recommendation">
                      <span className="eyebrow">
                        <Lightbulb size={15} /> Your next move
                      </span>
                      <h3>
                        {period === 'current'
                          ? demoFinding.title
                          : 'Keep this as your comparison point.'}
                      </h3>
                      <p>
                        {period === 'current'
                          ? 'Check the campaign’s customer outcomes and missing source data before committing more spend.'
                          : 'Use completed periods and the same matching rules when reviewing future performance.'}
                      </p>
                      <div className="recommendation-bottom">
                        <span>
                          <Target size={14} /> Target: $60 per customer
                        </span>
                        {period === 'current' && (
                          <Button
                            className={
                              'review-button ' + (reviewed ? 'reviewed' : '')
                            }
                            variant="outline"
                            onClick={() => setReviewed((v) => !v)}
                          >
                            {reviewed ? (
                              <CheckCheck size={15} />
                            ) : (
                              <Check size={15} />
                            )}{' '}
                            {reviewed ? 'Reviewed' : 'Mark reviewed'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="insight-disclaimer">
                    <Info size={13} /> Based on matched records. Missing sources
                    and small samples can affect this assessment.
                  </div>
                </div>
              )}
              <div className="detail-grid">
                <section className="chart-card">
                  <div className="card-heading">
                    <div>
                      <h2>What changed over time</h2>
                      <p>Cost per matched new customer · four sample weeks</p>
                    </div>
                    <span className="chart-unit">USD</span>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i /> Selected period
                    </span>
                    <span>
                      <i /> Previous baseline
                    </span>
                  </div>
                  <svg
                    className="trend-chart"
                    viewBox="0 0 650 225"
                    aria-label={
                      period === 'current'
                        ? 'Weekly acquisition costs rose from $42.86 to $60. Previous baseline was $40.'
                        : 'Weekly acquisition cost was $40 throughout the previous period.'
                    }
                  >
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1649e8"
                          stopOpacity=".12"
                        />
                        <stop
                          offset="100%"
                          stopColor="#1649e8"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {[40, 80, 120, 160].map((y, i) => (
                      <g key={y}>
                        <line
                          x1="45"
                          x2="635"
                          y1={y}
                          y2={y}
                          stroke="#e7ecf3"
                          strokeDasharray="3 5"
                        />
                        <text x="7" y={y + 4} fill="#8491a3" fontSize="12">
                          ${70 - i * 10}
                        </text>
                      </g>
                    ))}
                    <line
                      x1="52"
                      y1="160"
                      x2="626"
                      y2="160"
                      stroke="#a9b6cc"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                    {period === 'current' ? (
                      <>
                        <path
                          d="M52 149 L243 135 L434 102 L626 80 L626 190 L52 190 Z"
                          fill="url(#chartFill)"
                        />
                        <path
                          d="M52 149 L243 135 L434 102 L626 80"
                          fill="none"
                          stroke="#1649e8"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                        {[
                          [52, 149],
                          [243, 135],
                          [434, 102],
                          [626, 80],
                        ].map(([x, y], i) => (
                          <g key={x}>
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="white"
                              stroke="#1649e8"
                              strokeWidth="2"
                            />
                            <text
                              x={x}
                              y={y - 13}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#1649e8"
                            >
                              ${(600 / report.weeklyCustomers[i]).toFixed(2)}
                            </text>
                          </g>
                        ))}
                      </>
                    ) : (
                      <path
                        d="M52 160 L626 160"
                        stroke="#1649e8"
                        strokeWidth="3"
                      />
                    )}
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((s, i) => (
                      <text
                        key={s}
                        x={52 + i * 191}
                        y="217"
                        textAnchor="middle"
                        fill="#8491a3"
                        fontSize="12"
                      >
                        {s}
                      </text>
                    ))}
                  </svg>
                </section>
                <section className="coverage-card">
                  <div className="card-heading">
                    <h2>How clear is the picture?</h2>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="coverage-value">
                    <strong>{report.coverage}%</strong>
                    <span>
                      of new customers have
                      <br />a recorded source
                    </span>
                  </div>
                  <div className="coverage-track" aria-hidden="true">
                    <span style={{ width: report.coverage + '%' }} />
                  </div>
                  <p>
                    {report.totalCustomers - report.unknownCustomers} of{' '}
                    {report.totalCustomers} new customers have a source match.{' '}
                    {report.unknownCustomers} remain unassigned.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setPanel('coverage')}
                  >
                    What’s included <ArrowRight size={15} />
                  </button>
                  <div className="coverage-note">
                    <Info size={14} /> Unknown never means zero.
                  </div>
                </section>
              </div>
              <section className="channels-card">
                <div className="card-heading">
                  <div>
                    <h2>Your channels, side by side</h2>
                    <p>Completed period · {report.label}</p>
                  </div>
                  {section === 'overview' && (
                    <button
                      className="text-link"
                      onClick={() => setSection('channels')}
                    >
                      Explore channels <ArrowRight size={15} />
                    </button>
                  )}
                </div>
                <Table className="channel-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead>Spend</TableHead>
                      <TableHead>Matched new customers</TableHead>
                      <TableHead>Cost / customer</TableHead>
                      <TableHead>Against $60 target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        name: 'Google',
                        label: 'Google Ads',
                        spend: 1440,
                        customers: report.googleCustomers,
                        cost: report.googleCost,
                      },
                      {
                        name: 'Meta',
                        label: 'Meta Ads',
                        spend: 960,
                        customers: report.metaCustomers,
                        cost: report.metaCost,
                      },
                    ].map((c) => (
                      <TableRow key={c.name}>
                        <TableCell>
                          <span className="channel-name">
                            <Platform name={c.name} />
                            <strong>{c.label}</strong>
                          </span>
                        </TableCell>
                        <TableCell>
                          ${c.spend.toLocaleString('en-US')}
                        </TableCell>
                        <TableCell>{c.customers}</TableCell>
                        <TableCell>${c.cost}</TableCell>
                        <TableCell>
                          <span
                            className={
                              c.cost > 60 ? 'status-review' : 'status-healthy'
                            }
                          >
                            {c.cost > 60 ? 'Review suggested' : 'Within target'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="table-footnote">
                  Each new customer is assigned to at most one source. Revenue
                  and profit are not inferred from these counts.
                </div>
              </section>
            </>
          )}
          {section === 'decisions' && (
            <section className="decisions-section">
              <div className="decision-heading">
                <span className="large-insight-icon">
                  <CheckCheck size={24} />
                </span>
                <div>
                  <h2>
                    {reviewed
                      ? 'One finding reviewed.'
                      : 'Your next decision starts here.'}
                  </h2>
                  <p>
                    Demo actions last for this visit and do not change any ad
                    accounts.
                  </p>
                </div>
              </div>
              <article className="decision-row">
                <span className={reviewed ? 'status-healthy' : 'status-review'}>
                  {reviewed ? 'Reviewed' : 'Awaiting review'}
                </span>
                <h3>{demoFinding.title}</h3>
                <p>{demoFinding.finding}</p>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setPanel('evidence')}
                  >
                    Review evidence <ArrowUpRight size={15} />
                  </Button>
                  <Button onClick={() => setReviewed((v) => !v)}>
                    {reviewed ? 'Mark as unreviewed' : 'Mark reviewed'}
                    <Check size={15} />
                  </Button>
                </div>
              </article>
              <p className="muted-note">
                A review records your attention. It does not mean the
                recommendation was implemented or produced a result.
              </p>
            </section>
          )}
          {section === 'connections' && (
            <>
              <div className="connections-intro">
                <ShieldCheck size={20} />
                <div>
                  <strong>Your tools stay yours.</strong>
                  <p>
                    This workspace uses fictional records. No live accounts are
                    connected, and no account access is requested in the demo.
                  </p>
                </div>
              </div>
              <div className="connections-grid">
                {[
                  {
                    name: 'Meta',
                    desc: 'Advertising spend, campaign performance, and supported Instagram insights.',
                    role: 'Sample advertising records',
                  },
                  {
                    name: 'Google',
                    desc: 'Advertising spend and campaign performance from Google Ads.',
                    role: 'Sample advertising records',
                  },
                  {
                    name: 'Sales',
                    desc: 'New paying customers, source matches, and payment confirmations.',
                    role: 'Sample sales records',
                  },
                  {
                    name: 'Analytics',
                    desc: 'Website journeys and configured conversion events from Google Analytics.',
                    role: 'Planned connection',
                  },
                  {
                    name: 'Shopify',
                    desc: 'Orders, refunds, and supported customer journey information.',
                    role: 'Planned connection',
                  },
                  {
                    name: 'Stripe',
                    desc: 'Confirmed payment outcomes and refunds from your payment account.',
                    role: 'Planned connection',
                  },
                ].map((c) => (
                  <article className="connection-card" key={c.name}>
                    <div>
                      <Platform name={c.name} />
                      <span className="label-pill">
                        {c.role.startsWith('Sample')
                          ? 'Demo source'
                          : 'Planned'}
                      </span>
                    </div>
                    <h2>
                      {c.name === 'Google'
                        ? 'Google Ads'
                        : c.name === 'Sales'
                          ? 'Sales records'
                          : c.name === 'Analytics'
                            ? 'Google Analytics'
                            : c.name}
                    </h2>
                    <p>{c.desc}</p>
                    <button
                      className="text-link"
                      onClick={() => openConnection(c.name)}
                    >
                      View connection details <ArrowUpRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          <footer className="app-footer">
            <span>
              <span className="status-dot" /> A considered next step, backed by
              evidence.
            </span>
            <span>Sample snapshot · Sep 4, 2026</span>
          </footer>
        </main>
      </SidebarInset>
      <Sheet
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent className="evidence-sheet">
          <SheetHeader>
            <span className="eyebrow">The details behind the decision</span>
            <SheetTitle>
              {panel === 'evidence'
                ? 'Follow the evidence.'
                : panel === 'coverage'
                  ? 'An honest view of your data.'
                  : panel === 'connection'
                    ? `${connection} connection`
                    : 'A brief, worth your time.'}
            </SheetTitle>
            <SheetDescription>
              {panel === 'connection'
                ? 'What this connection will contribute.'
                : panel === 'help'
                  ? 'Start with what changed. Look closer only when you need to.'
                  : 'All records in this workspace are fictional. Figures are reproducible from the sample totals.'}
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body">
            {panel === 'evidence' ? (
              <>
                <span className="label-pill">{report.label}</span>
                <h3>The calculation</h3>
                <div className="calculation">
                  $2,400 <span>÷</span> {report.paidCustomers} <span>=</span>{' '}
                  <strong>${report.cost}</strong>
                </div>
                <p>
                  Advertising spend divided by new paying customers matched to a
                  paid source.
                </p>
                <div className="evidence-row">
                  <span>Google Ads</span>
                  <strong>
                    $1,440 ÷ {report.googleCustomers} = ${report.googleCost}
                  </strong>
                </div>
                <div className="evidence-row">
                  <span>Meta Ads</span>
                  <strong>
                    $960 ÷ {report.metaCustomers} = ${report.metaCost}
                  </strong>
                </div>
                <h3>How records are matched</h3>
                <p>
                  The sample assumes one last-click source within 28 days before
                  a first confirmed purchase. Each new customer counts once.
                  Both periods contain 28 completed days.
                </p>
                <h3>What we can conclude</h3>
                <p>
                  {period === 'current'
                    ? demoFinding.basis
                    : 'Both channels were below the sample owner’s $60 acquisition target. No earlier period is included.'}
                </p>
                <h3>What we cannot conclude</h3>
                <p>{demoFinding.limits}</p>
                <div className="sheet-callout">
                  <Info size={18} />
                  <span>
                    Matched sales do not establish causal impact. No revenue or
                    profit estimate is made here.
                  </span>
                </div>
              </>
            ) : panel === 'coverage' ? (
              <>
                <div className="coverage-value">
                  <strong>{report.coverage}%</strong>
                </div>
                <p>
                  Source coverage measures how many new customers have any
                  recorded source, including non-paid sources.
                </p>
                {[
                  ['Matched to paid marketing', report.paidCustomers],
                  ['Matched to other sources', report.otherCustomers],
                  ['Unknown source', report.unknownCustomers],
                  ['Total new customers', report.totalCustomers],
                ].map(([label, value]) => (
                  <div className="evidence-row" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
                <h3>Unknown stays unknown.</h3>
                <p>
                  We do not distribute unmatched customers across advertising
                  channels or treat an absent value as zero. Missing source
                  records may change the interpretation.
                </p>
              </>
            ) : panel === 'connection' ? (
              <>
                <span className="status-review">
                  Live connection not available in this preview
                </span>
                <h3>What happens during the pilot</h3>
                <p>
                  You will authorize access through the supported provider.
                  Daymark will request the data needed to produce your brief,
                  and show when it last updated.
                </p>
                <h3>No credentials needed here</h3>
                <p>
                  This demo does not collect passwords, access tokens, or real
                  customer records.
                </p>
                <Link className="button-primary" href="/login">
                  Create your pilot profile <ArrowUpRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <h3>1. See the change.</h3>
                <p>
                  Your brief compares consistent reporting periods and
                  highlights the change most worth reviewing.
                </p>
                <h3>2. Follow the evidence.</h3>
                <p>
                  Open the calculation, source coverage, and limitations behind
                  the recommendation.
                </p>
                <h3>3. Make your decision.</h3>
                <p>
                  Review the recommendation and decide whether to act. The demo
                  does not change budgets or publish content.
                </p>
                <Link className="text-link" href="/">
                  Back to Daymark <ArrowLeft size={16} />
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
