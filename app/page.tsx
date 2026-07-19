"use client";

import { useMemo, useState } from "react";

type ServiceStatus = "Completed" | "Missed" | "Client Closed";
type PayMode = "Hourly" | "Flat rate" | "% of job" | "Monthly" | "Semimonthly";
type MessageAudience = "client" | "cleaner";

type ActivityItem = {
  id: number;
  icon: string;
  color: string;
  title: string;
  detail: string;
  time: string;
  reason: string;
};

const statusStyles: Record<ServiceStatus, string> = {
  Completed: "status-completed",
  Missed: "status-missed",
  "Client Closed": "status-closed",
};

const initialLocations = [
  {
    id: 1,
    name: "Harbor Point Offices",
    address: "1840 Seaport Blvd · Suite 400",
    time: "6:00–8:30 AM",
    cleaner: "Maya Chen",
    initials: "MC",
    value: 285,
    status: "Completed" as ServiceStatus,
    detail: "18,500 sq ft · Daily service",
    notes: "All areas passed the 24-point quality checklist. Lobby glass received an extra spot clean.",
    color: "blue",
  },
  {
    id: 2,
    name: "Juniper Health Center",
    address: "72 West Juniper Ave",
    time: "12:30–3:00 PM",
    cleaner: "Luis Rivera",
    initials: "LR",
    value: 340,
    status: "Missed" as ServiceStatus,
    detail: "14,200 sq ft · Mon/Wed/Fri",
    notes: "Cleaner reported a family emergency before arrival. No substitute had been assigned.",
    color: "teal",
  },
  {
    id: 3,
    name: "Northstar Learning Hub",
    address: "905 Atlas Street",
    time: "5:30–8:00 PM",
    cleaner: "Nia Brooks",
    initials: "NB",
    value: 260,
    status: "Client Closed" as ServiceStatus,
    detail: "11,800 sq ft · Weeknights",
    notes: "The client contact confirmed the building is closed for a staff development day.",
    color: "violet",
  },
];

const initialActivity: ActivityItem[] = [
  { id: 1, icon: "✓", color: "teal-bg", title: "Maya completed Harbor Point Offices", detail: "Quality checklist: 24/24", time: "Today · 8:21 AM", reason: "Cleaner submitted the completed service checklist." },
  { id: 2, icon: "!", color: "amber-bg", title: "Juniper Health Center marked Missed", detail: "Assigned cleaner: Luis Rivera", time: "Today · 12:46 PM", reason: "Cleaner reported a family emergency before arrival." },
  { id: 3, icon: "○", color: "violet-bg", title: "Northstar marked Client Closed", detail: "Confirmed by client contact", time: "Today · 4:12 PM", reason: "Building closed for a staff development day." },
  { id: 4, icon: "$", color: "blue-bg", title: "Pay calculation reviewed for Maya Chen", detail: "$176.00 hourly estimate", time: "Yesterday · 5:42 PM", reason: "Weekly payroll preparation." },
  { id: 5, icon: "✦", color: "teal-bg", title: "Client update drafted for Juniper", detail: "Missed service follow-up", time: "Yesterday · 2:18 PM", reason: "Proactive notice requested after a schedule exception." },
  { id: 6, icon: "↗", color: "blue-bg", title: "Invoice #1048 was sent", detail: "Northstar Learning Hub", time: "Friday · 7:05 AM", reason: "Recurring monthly billing schedule." },
];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [locations, setLocations] = useState(initialLocations);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [payOpen, setPayOpen] = useState(false);
  const [mode, setMode] = useState<PayMode>("Hourly");
  const [hours, setHours] = useState(6.5);
  const [rate, setRate] = useState(24);
  const [flat, setFlat] = useState(180);
  const [percent, setPercent] = useState(55);
  const [jobValue, setJobValue] = useState(340);
  const [bonus, setBonus] = useState(20);
  const [periodBase, setPeriodBase] = useState(3200);
  const [scheduledDays, setScheduledDays] = useState(22);
  const [unpaidMissedDays, setUnpaidMissedDays] = useState(1);
  const [clientClosedDays, setClientClosedDays] = useState(1);
  const [clientClosedPaid, setClientClosedPaid] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageAudience, setMessageAudience] = useState<MessageAudience>("client");
  const [selectedLocationId, setSelectedLocationId] = useState(2);
  const [messageText, setMessageText] = useState("");
  const [messageEditing, setMessageEditing] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [toast, setToast] = useState("");

  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? locations[1];

  const pay = useMemo(() => {
    const dailyRate = periodBase / Math.max(1, scheduledDays);
    const unpaidDays = unpaidMissedDays + (clientClosedPaid ? 0 : clientClosedDays);
    const base = mode === "Hourly" ? hours * rate : mode === "Flat rate" ? flat : mode === "% of job" ? jobValue * (percent / 100) : periodBase - dailyRate * unpaidDays;
    return Math.max(0, base + bonus);
  }, [mode, hours, rate, flat, percent, jobValue, periodBase, scheduledDays, unpaidMissedDays, clientClosedDays, clientClosedPaid, bonus]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const addActivity = (item: Omit<ActivityItem, "id">) => {
    setActivity((current) => [{ ...item, id: Date.now() }, ...current]);
  };

  const draftMessage = (audience: MessageAudience, locationId = selectedLocationId) => {
    const location = locations.find((item) => item.id === locationId) ?? locations[1];
    setSelectedLocationId(location.id);
    setMessageAudience(audience);
    setMessageEditing(false);
    const text = audience === "client"
      ? `Subject: Service update for ${location.name}\n\nHello ${location.name} team,\n\nI’m writing with an update about today’s scheduled cleaning service. The service is currently marked ${location.status}. ${location.cleaner} was the assigned cleaner for the ${location.time} visit.\n\nNotes: ${location.notes}\n\nWe’re reviewing the schedule and will follow up with the next appropriate step. Please reply if there is anything else we should know.\n\nThank you,\nAvery\nBrightline Cleaning Co.`
      : `Hi ${location.cleaner},\n\nI’m following up about your service at ${location.name}, currently marked ${location.status}.\n\nService window: ${location.time}\nLocation: ${location.address}\nNotes: ${location.notes}\n\nPlease reply to confirm you received this update and let me know whether any schedule or service details need to be corrected.\n\nThank you,\nAvery`;
    setMessageText(text);
    setMessageOpen(true);
    addActivity({ icon: "✦", color: "teal-bg", title: `${audience === "client" ? "Client" : "Cleaner"} message drafted for ${location.name}`, detail: `${location.status} service · ${location.cleaner}`, time: "Just now", reason: location.notes });
  };

  const setStatus = (id: number, status: ServiceStatus) => {
    setLocations((current) => current.map((location) => location.id === id ? { ...location, status } : location));
    const location = locations.find((item) => item.id === id)!;
    addActivity({ icon: status === "Completed" ? "✓" : status === "Missed" ? "!" : "○", color: status === "Completed" ? "teal-bg" : status === "Missed" ? "amber-bg" : "violet-bg", title: `${location.name} marked ${status}`, detail: `Assigned cleaner: ${location.cleaner}`, time: "Just now", reason: location.notes });
    showToast(`Service marked ${status.toLowerCase()}`);
  };

  const navItems = [
    ["Dashboard", "⌂"], ["Schedule", "▦"], ["Locations", "◇"], ["Team", "◎"], ["Clients", "○"], ["Reports", "↗"],
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>CleanFlow <b>AI</b></span></div>
        <div className="workspace-label">Workspace</div>
        <nav aria-label="Primary navigation">
          {navItems.map(([label, symbol]) => (
            <button key={label} onClick={() => setActiveNav(label)} className={activeNav === label ? "active" : ""}>
              <Icon>{symbol}</Icon><span>{label}</span>{label === "Schedule" && <em>3</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setPayOpen(true)}><Icon>$</Icon><span>Pay calculator</span></button>
          <button><Icon>?</Icon><span>Help center</span></button>
          <button><Icon>⚙</Icon><span>Settings</span></button>
          <div className="demo-note"><span>DEMO WORKSPACE</span><p>All names, jobs, and figures are fictional.</p></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="search"><span>⌕</span><input aria-label="Search" placeholder="Search jobs, clients, cleaners…" /><kbd>⌘ K</kbd></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><div className="profile"><span>AP</span><div><strong>Avery Patel</strong><small>Owner</small></div><b>⌄</b></div></div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">SUNDAY, JULY 19</p><h1>Good morning, Avery.</h1><p>Here’s how Brightline Cleaning Co. is running today.</p></div>
            <div className="heading-actions"><button className="secondary-button" onClick={() => setPayOpen(true)}>▣ &nbsp; Calculate pay</button><button className="primary-button" onClick={() => { setToast("New job draft created"); window.setTimeout(() => setToast(""), 2200); }}>＋ Add job</button></div>
          </div>

          <div className="fictional-notice" role="note"><span>i</span>All names and information shown are fictional demonstration data.</div>

          <section className="metrics" aria-label="Business overview">
            <article><div className="metric-head"><span>Today’s jobs</span><b className="metric-icon blue">▦</b></div><strong>3</strong><p><i className="up">↑ 1</i> from last Sunday</p></article>
            <article><div className="metric-head"><span>Completed</span><b className="metric-icon teal">✓</b></div><strong>{locations.filter((l) => l.status === "Completed").length}<small> / 3</small></strong><p>{Math.round((locations.filter((l) => l.status === "Completed").length / 3) * 100)}% completion rate</p></article>
            <article><div className="metric-head"><span>Revenue today</span><b className="metric-icon violet">$</b></div><strong>${locations.filter((l) => l.status === "Completed").reduce((sum, l) => sum + l.value, 0).toLocaleString()}</strong><p><i className="up">↑ 8.4%</i> vs. weekly avg.</p></article>
            <article><div className="metric-head"><span>Active cleaners</span><b className="metric-icon amber">◎</b></div><strong>3</strong><p><span className="live-dot" /> All checked in</p></article>
          </section>

          <section className="workspace-grid">
            <div className="locations-card panel-card">
              <div className="card-title"><div><h2>Today’s service locations</h2><p>Three commercial locations on the schedule</p></div><button>View schedule <span>→</span></button></div>
              <div className="location-list">
                {locations.map((location) => (
                  <article className="location-row" key={location.id}>
                    <div className={`location-symbol ${location.color}`}>▥</div>
                    <div className="location-main"><h3>{location.name}</h3><p>{location.address}</p><small>{location.detail}</small></div>
                    <div className="service-time"><strong>{location.time}</strong><span>${location.value} service</span></div>
                    <div className="cleaner"><span>{location.initials}</span><div><strong>{location.cleaner}</strong><small>Assigned cleaner</small></div></div>
                    <label className="status-select-wrap">
                      <span className={`status-dot ${statusStyles[location.status]}`} />
                      <select aria-label={`Status for ${location.name}`} value={location.status} onChange={(e) => setStatus(location.id, e.target.value as ServiceStatus)}>
                        <option>Completed</option><option>Missed</option><option>Client Closed</option>
                      </select>
                    </label>
                    <button className="more-button" aria-label={`More options for ${location.name}`}>•••</button>
                  </article>
                ))}
              </div>
              <div className="legend"><span><i className="status-completed" />Completed</span><span><i className="status-missed" />Missed</span><span><i className="status-closed" />Client Closed</span><small>Change any status directly from its row</small></div>
            </div>

            <aside className="side-stack">
              <article className="ai-card">
                <div className="ai-label"><span>✦</span> CLEANFLOW AI</div><h2>A missed visit needs attention</h2><p>Juniper Health Center was missed. I can prepare a client update and suggest the next open cleaner.</p>
                <div className="ai-recommend"><span>LR</span><div><strong>Luis is unavailable</strong><small>Maya has a 3:30 PM opening nearby</small></div></div>
                <div className="ai-actions"><button onClick={() => draftMessage("client", 2)}>Draft client update</button><button onClick={() => draftMessage("cleaner", 2)}>Draft for cleaner</button></div>
              </article>

              <article className="panel-card pay-summary">
                <div className="card-title"><div><h2>Cleaner pay</h2><p>Today’s estimated payout</p></div><button onClick={() => setPayOpen(true)}>Open calculator</button></div>
                <div className="pay-number"><strong>$518</strong><span>3 cleaners</span></div>
                <div className="pay-bars"><span style={{ width: "84%" }} /><span style={{ width: "67%" }} /><span style={{ width: "58%" }} /></div>
                <div className="pay-meta"><span><i className="blue-bg" /> Maya <b>$176</b></span><span><i className="teal-bg" /> Luis <b>$187</b></span><span><i className="violet-bg" /> Nia <b>$155</b></span></div>
              </article>
            </aside>
          </section>

          <section className="bottom-grid">
            <article className="panel-card revenue-card"><div className="card-title"><div><h2>Weekly revenue</h2><p>Service value by day</p></div><button>This week ⌄</button></div><div className="revenue-top"><strong>$4,860</strong><span>↑ 12.6%</span><small>vs. last week</small></div><div className="chart"><i style={{height:"42%"}} /><i style={{height:"63%"}} /><i style={{height:"54%"}} /><i style={{height:"78%"}} /><i style={{height:"71%"}} /><i style={{height:"92%"}} /><i className="today" style={{height:"46%"}} /></div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></article>
            <article className="panel-card activity-card"><div className="card-title"><div><h2>Recent activity</h2><p>Live team updates</p></div><button onClick={() => setActivityOpen(true)}>See all</button></div><ul>{activity.slice(0, 3).map((item) => <li key={item.id}><span className={item.color}>{item.icon}</span><p><strong>{item.title}</strong><small>{item.detail} · {item.time}</small></p></li>)}</ul></article>
          </section>
        </div>
      </section>

      {payOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) setPayOpen(false); }}>
        <section className="pay-modal" role="dialog" aria-modal="true" aria-labelledby="pay-title">
          <div className="modal-header"><div><span className="calculator-mark">$</span><div><p>FLEXIBLE PAY TOOL</p><h2 id="pay-title">Cleaner pay calculator</h2></div></div><button onClick={() => setPayOpen(false)} aria-label="Close calculator">×</button></div>
          <p className="modal-intro">Estimate cleaner earnings with the pay method that fits each job. No values are saved in this demo.</p>
          <div className="mode-tabs">{(["Hourly", "Flat rate", "% of job", "Monthly", "Semimonthly"] as PayMode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</div>
          <div className="calculator-form">
            <label>Cleaner<select defaultValue="Maya Chen"><option>Maya Chen</option><option>Luis Rivera</option><option>Nia Brooks</option></select></label>
            <label>Service location<select defaultValue="Juniper Health Center"><option>Harbor Point Offices</option><option>Juniper Health Center</option><option>Northstar Learning Hub</option></select></label>
            {mode === "Hourly" && <><label>Hours worked<input type="number" min="0" step="0.25" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label><label>Hourly rate<div className="money-input"><span>$</span><input type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></div></label></>}
            {mode === "Flat rate" && <label className="full">Flat payment<div className="money-input"><span>$</span><input type="number" min="0" value={flat} onChange={(e) => setFlat(Number(e.target.value))} /></div></label>}
            {mode === "% of job" && <><label>Job value<div className="money-input"><span>$</span><input type="number" min="0" value={jobValue} onChange={(e) => setJobValue(Number(e.target.value))} /></div></label><label>Cleaner share<div className="money-input suffix"><input type="number" min="0" max="100" value={percent} onChange={(e) => setPercent(Number(e.target.value))} /><span>%</span></div></label></>}
            {(mode === "Monthly" || mode === "Semimonthly") && <>
              <label>{mode} base pay<div className="money-input"><span>$</span><input type="number" min="0" value={periodBase} onChange={(e) => setPeriodBase(Number(e.target.value))} /></div></label>
              <label>Scheduled service days<input type="number" min="1" step="1" value={scheduledDays} onChange={(e) => setScheduledDays(Number(e.target.value))} /></label>
              <label>Unpaid missed days<input type="number" min="0" max={scheduledDays} step="1" value={unpaidMissedDays} onChange={(e) => setUnpaidMissedDays(Number(e.target.value))} /></label>
              <label>Client Closed days<input type="number" min="0" max={scheduledDays} step="1" value={clientClosedDays} onChange={(e) => setClientClosedDays(Number(e.target.value))} /></label>
              <fieldset className="closed-pay-choice"><legend>Client Closed treatment</legend><label><input type="radio" name="closed-pay" checked={clientClosedPaid} onChange={() => setClientClosedPaid(true)} /> Paid</label><label><input type="radio" name="closed-pay" checked={!clientClosedPaid} onChange={() => setClientClosedPaid(false)} /> Unpaid</label></fieldset>
            </>}
            <label className="full">Bonus or adjustment<div className="money-input"><span>$</span><input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} /></div><small>Use a negative number for deductions.</small></label>
          </div>
          <div className="calculation-result"><div><p>Estimated cleaner pay</p><strong>${pay.toFixed(2)}</strong></div><div className="formula">{mode === "Hourly" ? `${hours} hrs × $${rate.toFixed(2)}` : mode === "Flat rate" ? `$${flat.toFixed(2)} flat` : mode === "% of job" ? `${percent}% × $${jobValue.toFixed(2)}` : `$${periodBase.toFixed(2)} base − ${unpaidMissedDays + (clientClosedPaid ? 0 : clientClosedDays)} unpaid day${unpaidMissedDays + (clientClosedPaid ? 0 : clientClosedDays) === 1 ? "" : "s"}`}<span>{(mode === "Monthly" || mode === "Semimonthly") && `$${(periodBase / Math.max(1, scheduledDays)).toFixed(2)} per scheduled day · `}{bonus >= 0 ? "+" : "−"} ${Math.abs(bonus).toFixed(2)} adjustment</span></div></div>
          <div className="modal-actions"><button onClick={() => setPayOpen(false)}>Cancel</button><button onClick={() => { setPayOpen(false); addActivity({ icon: "$", color: "blue-bg", title: `${mode} pay estimate saved`, detail: `$${pay.toFixed(2)} for Maya Chen`, time: "Just now", reason: `${mode} calculation with current service adjustments.` }); showToast(`Pay estimate saved: $${pay.toFixed(2)}`); }}>Save estimate</button></div>
        </section>
      </div>}

      {messageOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) setMessageOpen(false); }}>
        <section className="message-modal" role="dialog" aria-modal="true" aria-labelledby="message-title">
          <div className="modal-header"><div><span className="calculator-mark">✦</span><div><p>CLEANFLOW AI DRAFT</p><h2 id="message-title">Message for the {messageAudience}</h2></div></div><button onClick={() => setMessageOpen(false)} aria-label="Close message">×</button></div>
          <div className="message-context">
            <label>Location<select value={selectedLocationId} onChange={(e) => draftMessage(messageAudience, Number(e.target.value))}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
            <label>Recipient<select value={messageAudience} onChange={(e) => draftMessage(e.target.value as MessageAudience, selectedLocationId)}><option value="client">Client contact</option><option value="cleaner">Assigned cleaner</option></select></label>
          </div>
          <div className="message-facts"><span><b>Status</b>{selectedLocation.status}</span><span><b>Cleaner</b>{selectedLocation.cleaner}</span><span><b>Notes</b>{selectedLocation.notes}</span></div>
          <textarea className="message-editor" aria-label="Drafted message" readOnly={!messageEditing} value={messageText} onChange={(e) => setMessageText(e.target.value)} />
          <div className="message-actions"><button onClick={() => { navigator.clipboard.writeText(messageText); showToast("Draft copied to clipboard"); }}>Copy</button><button className={messageEditing ? "editing" : ""} onClick={() => setMessageEditing((value) => !value)}>{messageEditing ? "Done editing" : "Edit"}</button><button onClick={() => setMessageOpen(false)}>Close</button></div>
        </section>
      </div>}

      {activityOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) setActivityOpen(false); }}>
        <section className="activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-title">
          <div className="modal-header"><div><span className="calculator-mark">↗</span><div><p>DEMO AUDIT TRAIL</p><h2 id="activity-title">Full activity log</h2></div></div><button onClick={() => setActivityOpen(false)} aria-label="Close activity log">×</button></div>
          <p className="modal-intro">Status changes, pay calculations, saved estimates, and drafted messages appear here with fictional timestamps and reasons.</p>
          <div className="activity-log">{activity.map((item) => <article key={item.id}><span className={item.color}>{item.icon}</span><div><h3>{item.title}</h3><p>{item.detail}</p><small><b>{item.time}</b> · Reason: {item.reason}</small></div></article>)}</div>
          <div className="modal-actions"><button onClick={() => setActivityOpen(false)}>Close</button></div>
        </section>
      </div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
