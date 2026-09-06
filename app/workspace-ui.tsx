'use client';
import Link from '@/components/site-link';
import { useEffect, useRef, useState } from 'react';
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
  useSidebar,
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
import Platform from '@/components/platform-logo';
import ReviewGuide from '@/components/review-guide';
import { useSampleReview } from '@/components/use-sample-review';
import { reportFor, demoFinding, type Period } from '@/lib/demo-data';

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'channels', label: 'Compare ads', icon: ChartNoAxesCombined },
  { id: 'decisions', label: 'Your review', icon: CheckCheck },
  { id: 'connections', label: 'Data sources', icon: Plug },
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
function WorkspaceMenuButton(
  props: React.ComponentProps<typeof SidebarMenuButton>,
) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuButton
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        setOpenMobile(false);
      }}
    />
  );
}

export default function Workspace() {
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);
  const sheetHeadingRef = useRef<HTMLHeadingElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<Section>('overview');
  const [period, setPeriod] = useState<Period>('current');
  const [panel, setPanel] = useState<
    'evidence' | 'coverage' | 'connection' | 'help' | 'review' | null
  >(null);
  const { review, setReview, storageAvailable } = useSampleReview();
  const reviewed = review.completed;
  useEffect(() => {
    if (panel) {
      sheetRef.current?.scrollTo({ top: 0 });
      sheetHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [panel]);
  useEffect(() => {
    mainHeadingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [section]);
  function openReview() {
    setPeriod('current');
    setPanel('review');
  }
  function resetReview() {
    setReview({ checks: [false, false, false], completed: false });
  }
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
      style={{ '--sidebar-width': '254px' } as React.CSSProperties}
    >
      <Sidebar className="daymark-sidebar" variant="floating">
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
                <WorkspaceMenuButton
                  className="app-nav-item"
                  isActive={section === item.id}
                  onClick={() => setSection(item.id)}
                  aria-current={section === item.id ? 'page' : undefined}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'overview' && (
                    <span className="nav-count">{reviewed ? '✓' : '1'}</span>
                  )}
                </WorkspaceMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="sidebar-note">
            <div>
              <span className="status-dot" /> Understand the change.
            </div>
            <p>
              See the numbers, work through the checklist, and decide what to
              check next.
            </p>
          </div>
        </SidebarContent>
        <SidebarFooter className="app-sidebar-footer">
          <button onClick={() => setPanel('help')}>
            <CircleHelp size={17} /> How Daymark works
          </button>
          <Link href="/login" className="profile-link">
            <span className="profile-avatar">D</span>
            <span>
              <strong>Early access</strong>
              <small>Save early-access details</small>
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
              <CircleDashed size={13} /> Sample report
            </span>
            <Link href="/" aria-label="Daymark home">
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </header>
        <div className="app-main" id="main-content" tabIndex={-1}>
          <div className="brief-heading">
            <div>
              <span className="eyebrow">June Paper Co. · Sample business</span>
              <h1 ref={mainHeadingRef} tabIndex={-1}>
                {section === 'overview'
                  ? 'Your marketing, explained.'
                  : section === 'channels'
                    ? 'Compare your advertising.'
                    : section === 'decisions'
                      ? 'Your review checklist.'
                      : 'Where the numbers come from.'}
              </h1>
              <p>
                {section === 'overview'
                  ? 'See what changed, why it matters, and what to check next.'
                  : section === 'channels'
                    ? 'Compare what you spent with the new customers linked to each ad platform.'
                    : section === 'decisions'
                      ? 'A short checklist to help you decide what to do about Meta.'
                      : 'See what is included in this sample and which connections are still being built.'}
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
                  aria-label="Dates to review"
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
            <div className="signal-bubbles" aria-label="Report shortcuts">
              <button
                className="signal-bubble"
                onClick={() => setPanel('evidence')}
              >
                <Platform name="Meta" />
                <span>
                  Meta{' '}
                  <strong>
                    {period === 'current' ? 'Needs a look' : 'Within target'}
                  </strong>
                </span>
                <span
                  className={
                    period === 'current'
                      ? 'bubble-dot amber'
                      : 'bubble-dot mint'
                  }
                />
              </button>
              <button
                className="signal-bubble"
                onClick={() => setSection('channels')}
              >
                <Platform name="Google" />
                <span>
                  Google Ads <strong>Within target</strong>
                </span>
                <span className="bubble-dot mint" />
              </button>
              <button
                className="signal-bubble coverage-bubble"
                onClick={() => setPanel('coverage')}
              >
                <ShieldCheck size={19} />
                <span>
                  <strong>{report.unknownCustomers} missing sources</strong>
                  Customers to check
                </span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          )}
          {(section === 'overview' || section === 'channels') && (
            <>
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
                        ? 'Your priority'
                        : 'Earlier period'}
                    </span>
                    <span className="attention-pill">
                      {period === 'current'
                        ? reviewed
                          ? 'Reviewed'
                          : '1 to review'
                        : 'Within target'}
                    </span>
                  </div>
                  <div className="insight-body">
                    <div>
                      <h2>
                        {period === 'current' ? (
                          <>
                            Meta cost more. <br />
                            Here’s what to check.
                          </>
                        ) : (
                          <>
                            Your earlier results. <br />
                            Both platforms at $40.
                          </>
                        )}
                      </h2>
                      <p>
                        {period === 'current'
                          ? 'Meta’s ad cost per new customer rose from $40 to $80. Google stayed at $40. Check the missing customer information before spending more.'
                          : 'Google and Meta each spent $40 per new customer linked to their ads. That is below this sample business’s $60 target.'}
                      </p>
                      {period === 'current' && (
                        <Button
                          className="compact-review-action"
                          onClick={openReview}
                        >
                          {reviewed
                            ? 'View your review'
                            : review.checks.some(Boolean)
                              ? 'Continue review'
                              : 'Start review'}{' '}
                          <ArrowRight size={17} />
                        </Button>
                      )}
                      <button
                        className="text-link"
                        onClick={() => setPanel('evidence')}
                      >
                        See how we worked this out <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="recommendation">
                      <div className="recommendation-brand">
                        <Platform name="Meta" />
                        {period === 'previous' && <Platform name="Google" />}
                        <span>
                          {period === 'current' ? 'META ADS' : 'PAID CHANNELS'}
                        </span>
                        <ArrowUpRight size={18} />
                      </div>
                      <span className="eyebrow">
                        <Lightbulb size={15} /> Recommended next step
                      </span>
                      <h3>
                        {period === 'current'
                          ? demoFinding.title
                          : 'Keep this as your comparison point.'}
                      </h3>
                      <p>
                        {period === 'current'
                          ? 'Start with the 12 new customers who have no marketing source recorded. The checklist explains what to look for.'
                          : 'Compare the same number of days and count customers in the same way. Use the date menu to return to the latest sample.'}
                      </p>
                      <div className="recommendation-bottom">
                        <span>
                          <Target size={14} /> Sample target: $60 per customer
                        </span>
                        {period === 'current' && (
                          <Button
                            className={
                              'review-button ' + (reviewed ? 'reviewed' : '')
                            }
                            variant="outline"
                            onClick={openReview}
                          >
                            {reviewed ? (
                              <CheckCheck size={15} />
                            ) : (
                              <Check size={15} />
                            )}{' '}
                            {reviewed ? 'View your review' : 'Start review'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="insight-disclaimer">
                    <Info size={13} /> Sample figures, not your business data.
                    The report links recorded ad clicks to first purchases; it
                    does not prove the ads caused them.
                  </div>
                </div>
              )}
              <div className="metrics-grid">
                <article className="metric-card">
                  <span>
                    Ad spend{' '}
                    <span className="metric-orb metric-orb-blue">
                      <ChartNoAxesCombined size={19} />
                    </span>
                  </span>
                  <div>
                    <strong>$2,400</strong>
                  </div>
                  <p>
                    <span className="neutral-pill">— Same spend</span>
                    <span>across both periods</span>
                  </p>
                </article>
                <article className="metric-card">
                  <span>
                    New customers linked to ads{' '}
                    <span className="metric-orb metric-orb-mint">
                      <CheckCheck size={19} />
                    </span>
                  </span>
                  <div>
                    <strong>{report.paidCustomers}</strong>
                  </div>
                  <p>
                    {period === 'current' ? (
                      <>
                        <span className="change-pill">↘ 20%</span>
                        <span>60 in the earlier period</span>
                      </>
                    ) : (
                      <span>60 first-time customers linked to ads</span>
                    )}
                  </p>
                </article>
                <article className="metric-card">
                  <span>
                    Ad cost per customer{' '}
                    <span className="metric-orb metric-orb-violet">
                      <Target size={19} />
                    </span>
                  </span>
                  <div>
                    <strong>${report.cost}</strong>
                  </div>
                  <p>
                    {period === 'current' ? (
                      <>
                        <span className="change-pill">↗ 25%</span>
                        <span>$40 in the previous period</span>
                      </>
                    ) : (
                      <span>Ad spend ÷ customers linked to ads</span>
                    )}
                  </p>
                </article>
              </div>
              <p className="metric-definition">
                <Info size={17} />
                <span>
                  <strong>What counts as a customer?</strong> A first purchase
                  linked to a recorded ad click. Customers with no recorded
                  source are shown separately. Lower ad cost is better, but it
                  does not tell you your profit.
                </span>
              </p>
              <div className="detail-grid">
                <section className="chart-card">
                  <div className="card-heading">
                    <div>
                      <h2>How customer cost changed</h2>
                      <p>Ad cost per customer · four complete weeks</p>
                    </div>
                    <span className="chart-unit">USD</span>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i /> Selected dates
                    </span>
                    <span>
                      <i /> Earlier period
                    </span>
                  </div>
                  <svg
                    className="trend-chart"
                    viewBox="0 0 650 225"
                    aria-label={
                      period === 'current'
                        ? 'Weekly ad cost per linked customer rose from $42.86 to $60. The earlier period was $40.'
                        : 'Weekly ad cost per linked customer was $40 throughout the earlier period.'
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
                  <dl className="weekly-values">
                    {report.weeklyCustomers.map((customers, index) => (
                      <div key={index}>
                        <dt>Week {index + 1}</dt>
                        <dd>
                          {'$'}
                          {(600 / customers).toFixed(2)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section className="coverage-card">
                  <div className="card-heading">
                    <h2>How complete is this report?</h2>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="coverage-meter">
                    <div className="coverage-ring">
                      <svg viewBox="0 0 140 140" aria-hidden="true">
                        <circle
                          cx="70"
                          cy="70"
                          r="60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="ring-track"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r="60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeLinecap="round"
                          pathLength="100"
                          strokeDasharray={report.coverage + ' 100'}
                          transform="rotate(-90 70 70)"
                          className="ring-value"
                        />
                      </svg>
                      <strong>
                        {report.coverage}
                        <span>%</span>
                      </strong>
                    </div>
                    <span>
                      of new customers
                      <br />
                      <strong>have a source recorded</strong>
                    </span>
                  </div>
                  <p>
                    {report.totalCustomers - report.unknownCustomers} of{' '}
                    {report.totalCustomers} new customers have a recorded
                    marketing source. {report.unknownCustomers} have no source
                    recorded.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setPanel('coverage')}
                  >
                    See who is included <ArrowRight size={15} />
                  </button>
                  <div className="coverage-note">
                    <Info size={14} /> Missing information can change the
                    result.
                  </div>
                </section>
              </div>
              <section className="channels-card">
                <div className="card-heading">
                  <div>
                    <h2>Your advertising side by side</h2>
                    <p>Completed period · {report.label}</p>
                  </div>
                  {section === 'overview' && (
                    <button
                      className="text-link"
                      onClick={() => setSection('channels')}
                    >
                      Compare ads <ArrowRight size={15} />
                    </button>
                  )}
                </div>
                <Table
                  className="channel-table"
                  aria-label="Advertising comparison"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad platform</TableHead>
                      <TableHead>Spend</TableHead>
                      <TableHead>New customers linked</TableHead>
                      <TableHead>Cost per customer</TableHead>
                      <TableHead>Compared with $60 target</TableHead>
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
                <div className="mobile-ad-comparison">
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
                  ].map((channel) => (
                    <article key={channel.name}>
                      <h3>
                        <Platform name={channel.name} />
                        {channel.label}
                      </h3>
                      <dl>
                        <div>
                          <dt>Ad spend</dt>
                          <dd>
                            {'$'}
                            {channel.spend.toLocaleString('en-US')}
                          </dd>
                        </div>
                        <div>
                          <dt>New customers linked</dt>
                          <dd>{channel.customers}</dd>
                        </div>
                        <div>
                          <dt>Cost per customer</dt>
                          <dd>
                            {'$'}
                            {channel.cost}
                          </dd>
                        </div>
                      </dl>
                      <span
                        className={
                          channel.cost > 60 ? 'status-review' : 'status-healthy'
                        }
                      >
                        {channel.cost > 60
                          ? 'Above the $60 target'
                          : 'Below the $60 target'}
                      </span>
                    </article>
                  ))}
                </div>
                <div className="table-footnote">
                  A customer counts once, under their last recorded source
                  before a first purchase. Cost per customer is not a profit
                  calculation.
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
                      ? 'You’ve finished this review.'
                      : 'One clear next step.'}
                  </h2>
                  <p>
                    {storageAvailable
                      ? 'Your sample progress is saved in this browser. Your ads are unchanged.'
                      : 'Progress lasts until you leave or reload this page. Your ads are unchanged.'}
                  </p>
                </div>
              </div>
              <article className="decision-row">
                <span className={reviewed ? 'status-healthy' : 'status-review'}>
                  {reviewed ? 'Reviewed' : 'Awaiting review'}
                </span>
                <h3>{demoFinding.title}</h3>
                <p>
                  {reviewed
                    ? 'Next: check the missing source fields in your sales records before deciding whether to increase Meta’s budget.'
                    : demoFinding.finding}
                </p>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPeriod('current');
                      setPanel('evidence');
                    }}
                  >
                    Review evidence <ArrowUpRight size={15} />
                  </Button>
                  <Button onClick={openReview}>
                    {reviewed
                      ? 'Reopen checklist'
                      : review.checks.some(Boolean)
                        ? 'Continue review'
                        : 'Start review'}
                    <Check size={15} />
                  </Button>
                </div>
              </article>
              <p className="muted-note">
                Completing the checklist means you understand what to check. It
                does not confirm that the business records were corrected or
                that an ad budget changed.
              </p>
            </section>
          )}
          {section === 'connections' && (
            <>
              <div className="connections-intro">
                <ShieldCheck size={20} />
                <div>
                  <strong>This is a sample report.</strong>
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
                    desc: 'Sample ad spending and new customers linked to Meta ads.',
                    role: 'Sample advertising records',
                  },
                  {
                    name: 'Google',
                    desc: 'Sample ad spending and new customers linked to Google Ads.',
                    role: 'Sample advertising records',
                  },
                  {
                    name: 'Sales',
                    desc: 'First-time customers and the marketing source recorded with their purchase.',
                    role: 'Sample sales records',
                  },
                  {
                    name: 'Analytics',
                    desc: 'Planned: website visits and important actions, such as purchases or enquiries.',
                    role: 'Planned connection',
                  },
                  {
                    name: 'Shopify',
                    desc: 'Planned: orders, refunds, and first-time customers from your shop.',
                    role: 'Planned connection',
                  },
                  {
                    name: 'Stripe',
                    desc: 'Planned: successful payments and refunds from your Stripe account.',
                    role: 'Planned connection',
                  },
                ].map((c) => (
                  <article className="connection-card" key={c.name}>
                    <div>
                      <Platform name={c.name} />
                      <span className="label-pill">
                        {c.role.startsWith('Sample')
                          ? 'Sample data'
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
                      aria-label={
                        'About ' +
                        (c.name === 'Google'
                          ? 'Google Ads'
                          : c.name === 'Analytics'
                            ? 'Google Analytics'
                            : c.name === 'Sales'
                              ? 'sales records'
                              : c.name)
                      }
                    >
                      What is included <ArrowUpRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {section === 'decisions' &&
            (reviewed || review.checks.some(Boolean)) && (
              <button className="reset-review text-link" onClick={resetReview}>
                Start this sample review over
              </button>
            )}
          <footer className="app-footer">
            <span>
              <span className="status-dot" /> All amounts in US dollars.
            </span>
            <span>Sample snapshot · Sep 4, 2026</span>
          </footer>
        </div>
      </SidebarInset>
      <Sheet
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent
          className="evidence-sheet"
          ref={sheetRef}
          initialFocus={sheetHeadingRef}
          finalFocus={mainHeadingRef}
        >
          <SheetHeader>
            <span className="eyebrow">
              {panel === 'review'
                ? 'Your checklist'
                : panel === 'help'
                  ? 'Help'
                  : panel === 'connection'
                    ? 'Data source'
                    : 'Behind the numbers'}
            </span>
            <SheetTitle ref={sheetHeadingRef} tabIndex={-1}>
              {panel === 'review'
                ? 'Review Meta in three steps.'
                : panel === 'evidence'
                  ? 'How we worked this out.'
                  : panel === 'coverage'
                    ? 'Which customers are included?'
                    : panel === 'connection'
                      ? connection === 'Google'
                        ? 'Google Ads'
                        : connection === 'Analytics'
                          ? 'Google Analytics'
                          : connection === 'Sales'
                            ? 'Sales records'
                            : connection
                      : 'A quick guide to Daymark.'}
            </SheetTitle>
            <SheetDescription>
              {panel === 'review'
                ? 'Read each step, check it off, and leave knowing what to do next.'
                : panel === 'connection'
                  ? 'What this source means for your report.'
                  : panel === 'help'
                    ? 'Start with what changed. Look closer only when you need to.'
                    : 'These sample figures show how Daymark explains a result. They are not your business data.'}
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body">
            {panel === 'review' ? (
              <ReviewGuide
                checks={review.checks}
                storageAvailable={storageAvailable}
                onCheck={(index, checked) =>
                  setReview((previous) => ({
                    checks: previous.checks.map((value, i) =>
                      i === index ? checked : value,
                    ),
                    completed: false,
                  }))
                }
                onDetails={setPanel}
                onFinish={() => {
                  setReview((previous) => ({ ...previous, completed: true }));
                  setPanel(null);
                  setSection('decisions');
                }}
              />
            ) : panel === 'evidence' ? (
              <>
                <span className="label-pill">{report.label}</span>
                <h3>The calculation</h3>
                <div className="calculation">
                  $2,400 <span>÷</span> {report.paidCustomers} <span>=</span>{' '}
                  <strong>${report.cost}</strong>
                </div>
                <p>
                  We divide ad spending by first-time customers whose purchase
                  can be linked to an ad.
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
                <h3>What “linked to ads” means</h3>
                <p>
                  In this sample, a customer is linked to the last recorded ad
                  they clicked within 28 days before their first purchase. Each
                  customer counts once. Both reporting periods contain 28 full
                  days.
                </p>
                <h3>What the numbers show</h3>
                <p>
                  {period === 'current'
                    ? demoFinding.basis
                    : 'Both platforms were below the sample business’s $60 cost-per-customer target. This is the earliest period in the sample.'}
                </p>
                <h3>What still needs checking</h3>
                <p>
                  {period === 'current'
                    ? demoFinding.limits
                    : '10 customers have no source recorded. These records cannot tell us whether an ad caused a purchase or whether the business made a profit.'}
                </p>
                <div className="sheet-callout">
                  <Info size={18} />
                  <span>
                    A recorded ad click does not prove an ad caused a purchase.
                    The $60 target belongs to this sample business; it is not a
                    general rule.
                  </span>
                </div>
              </>
            ) : panel === 'coverage' ? (
              <>
                <div className="coverage-value">
                  <strong>{report.coverage}%</strong>
                </div>
                <p>
                  This is the share of new customers with a recorded marketing
                  source. It includes ads and other sources, such as email or
                  referrals.
                </p>
                {[
                  ['Linked to ads', report.paidCustomers],
                  ['Other recorded sources', report.otherCustomers],
                  ['No source recorded', report.unknownCustomers],
                  ['Total new customers', report.totalCustomers],
                ].map(([label, value]) => (
                  <div className="evidence-row" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
                <h3>Why missing sources matter</h3>
                <p>
                  Some of these customers may have come from an ad, but we do
                  not know which one. We leave them out of the ad comparison
                  instead of guessing. Checking the missing fields could change
                  the result.
                </p>
              </>
            ) : panel === 'connection' ? (
              <>
                <span className="status-review">
                  Live connection in development
                </span>
                <div className="sheet-platform">
                  <Platform name={connection} />
                  <strong>
                    {connection === 'Google'
                      ? 'Google Ads'
                      : connection === 'Analytics'
                        ? 'Google Analytics'
                        : connection === 'Sales'
                          ? 'Sales records'
                          : connection}
                  </strong>
                </div>
                <h3>When connections become available</h3>
                <p>
                  Connecting an account will require your permission. For now,
                  the example uses sample numbers. Selecting a tool on your
                  early-access profile tells us what you use; it does not
                  connect the account.
                </p>
                <h3>What you can do today</h3>
                <p>
                  Save your business details and which tools you use. Email
                  contact about early access is optional.
                </p>
                <Link className="button-primary" href="/login">
                  Get early access <ArrowUpRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <h3>1. See the change.</h3>
                <p>
                  Overview compares two complete 28-day periods and highlights
                  one change worth checking. The date menu lets you switch
                  between them.
                </p>
                <h3>2. Review the evidence.</h3>
                <p>
                  “See how we worked this out” shows the calculation and which
                  customers are included. Missing information stays visible.
                </p>
                <h3>3. Make your decision.</h3>
                <p>
                  “Start review” opens three short steps. Check them off as you
                  read, then finish your review. This sample saves progress in
                  this browser and does not change any ads.
                </p>
                <Link className="text-link" href="/">
                  Back to Daymark <ArrowLeft size={16} />
                </Link>
              </>
            )}
            {(panel === 'evidence' || panel === 'coverage') &&
              period === 'current' && (
                <Button className="sheet-next-action" onClick={openReview}>
                  Open review checklist <ArrowRight size={17} />
                </Button>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
