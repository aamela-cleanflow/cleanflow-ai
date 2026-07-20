"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ServiceStatus = "Completed" | "Missed" | "Client Closed";
type PayMode = "Hourly" | "Flat rate" | "% of job" | "Monthly" | "Semimonthly";
type MessageAudience = "client" | "cleaner";
type DemoRole = "Owner/Admin" | "Cleaner" | "Client/School";
type DraftRecord = { id: number; audience: MessageAudience; recipient: string; location: string; status: ServiceStatus; time: string; reason: string; body: string };
type LocationRecord = (typeof initialLocations)[number];
type CleanerRecord = { id: number; name: string; initials: string; role: string; email: string; phone: string; availability: string; location: string; shift: string; payMethod: string };
type ClientRecord = { id: number; name: string; title: string; email: string; phone: string; location: string; notes: string };
type DemoSettings = { company: string; serviceArea: string; email: string; timezone: string; defaultPay: string; emailUpdates: boolean; autoReminders: boolean };

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
    client: "Jordan Ellis",
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
    client: "Priya Shah",
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
    client: "Marcus Bell",
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

const initialCleaners: CleanerRecord[] = [
  { id: 1, name: "Maya Chen", initials: "MC", role: "Lead cleaner", email: "maya.chen@example.test", phone: "(555) 010-4101", availability: "Checked in · Mon–Fri mornings", location: "Harbor Point Offices", shift: "6:00–8:30 AM", payMethod: "$24/hr" },
  { id: 2, name: "Luis Rivera", initials: "LR", role: "Commercial cleaner", email: "luis.rivera@example.test", phone: "(555) 010-4102", availability: "Unavailable today · Tue–Sat", location: "Juniper Health Center", shift: "12:30–3:00 PM", payMethod: "$22/hr" },
  { id: 3, name: "Nia Brooks", initials: "NB", role: "Evening specialist", email: "nia.brooks@example.test", phone: "(555) 010-4103", availability: "Checked in · Weekday evenings", location: "Northstar Learning Hub", shift: "5:30–8:00 PM", payMethod: "$155 flat" },
];

const initialClients: ClientRecord[] = [
  { id: 1, name: "Jordan Ellis", title: "Facilities coordinator", email: "jordan.ellis@example.test", phone: "(555) 010-1840", location: "Harbor Point Offices", notes: "Prefers service updates by email before 9:00 AM." },
  { id: 2, name: "Priya Shah", title: "Practice administrator", email: "priya.shah@example.test", phone: "(555) 010-2272", location: "Juniper Health Center", notes: "Use the west entrance and confirm any missed visit immediately." },
  { id: 3, name: "Marcus Bell", title: "Operations director", email: "marcus.bell@example.test", phone: "(555) 010-3905", location: "Northstar Learning Hub", notes: "Evening access code is provided to the assigned cleaner each week." },
];

const initialSettings: DemoSettings = { company: "Brightline Cleaning Co.", serviceArea: "Harbor City Metro", email: "ops@brightline-demo.example", timezone: "Eastern Time", defaultPay: "Hourly", emailUpdates: true, autoReminders: true };
const initialJobDraft = { client: "Jordan Ellis", location: "Harbor Point Offices", date: "2026-07-19", start: "09:00", end: "11:00", cleaner: "Maya Chen", value: 225, status: "Completed" as ServiceStatus, instructions: "Clean entry, offices, restrooms, and breakroom.", notes: "Fictional internal demo note." };
const formatTime = (value: string) => { const [hourText, minute = "00"] = value.split(":"); const hour = Number(hourText); if (!Number.isFinite(hour)) return value; return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`; };

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

function MessageOverlay({ audience, text: value, editing, setEditing, setText, onCopy, onSave, onClose }: { audience: MessageAudience; text: string; editing: boolean; setEditing: (value: boolean) => void; setText: (value: string) => void; onCopy: () => void; onSave: () => void; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="message-modal" role="dialog" aria-modal="true" aria-label={`AI draft for ${audience}`}><div className="modal-header"><div><span className="calculator-mark">✦</span><div><p>AI-ASSISTED DEMO DRAFT</p><h2>Message {audience === "client" ? "Client" : "Cleaner"}</h2></div></div><button onClick={onClose} aria-label="Close draft">×</button></div><p className="modal-intro">Editable fictional draft only. This prototype never sends email or text messages.</p><textarea className="message-editor" aria-label="Draft message" readOnly={!editing} value={value} onChange={(e) => setText(e.target.value)} /><div className="message-actions"><button onClick={onCopy}>Copy</button><button onClick={() => setEditing(!editing)}>{editing ? "Done Editing" : "Edit"}</button><button onClick={() => setEditing(false)}>Cancel</button><button onClick={onSave}>Save Draft</button><button onClick={onClose}>Close</button></div></section></div>;
}

function ProblemOverlay({ description, photo, setDescription, setPhoto, onSubmit, onClose }: { description: string; photo: boolean; setDescription: (value: string) => void; setPhoto: (value: boolean) => void; onSubmit: () => void; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="message-modal" role="dialog" aria-modal="true" aria-label="Report a Problem"><div className="modal-header"><div><span className="calculator-mark">!</span><div><p>CLIENT DEMO REQUEST</p><h2>Report a Problem</h2></div></div><button onClick={onClose} aria-label="Close problem report">×</button></div><div className="problem-form"><label>Short description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fictional service issue…" /></label><div className="demo-upload"><p>{photo ? "✓ Demo photos uploaded" : "No demo photos uploaded"}</p><button onClick={() => setPhoto(true)}>Upload Demo Photos</button></div><small>Uploads and reports remain fictional demonstration data.</small></div><div className="modal-actions"><button onClick={onClose}>Cancel</button><button onClick={onSubmit}>Submit Report</button></div></section></div>;
}

function SectionView({ section, locations, setLocations, cleaners, setCleaners, clients, setClients, settings, setSettings, drafts, archivedDraftIds, onArchiveDraft, onDeleteDraft, onBack, onOpenPay, onMessage, onActivity, showToast }: {
  section: string;
  locations: LocationRecord[];
  setLocations: React.Dispatch<React.SetStateAction<LocationRecord[]>>;
  cleaners: CleanerRecord[];
  setCleaners: React.Dispatch<React.SetStateAction<CleanerRecord[]>>;
  clients: ClientRecord[];
  setClients: React.Dispatch<React.SetStateAction<ClientRecord[]>>;
  settings: DemoSettings;
  setSettings: React.Dispatch<React.SetStateAction<DemoSettings>>;
  drafts: DraftRecord[];
  archivedDraftIds: number[];
  onArchiveDraft: (id: number) => void;
  onDeleteDraft: (id: number) => void;
  onBack: () => void;
  onOpenPay: () => void;
  onMessage: (audience: MessageAudience, locationId: number) => void;
  onActivity: (item: Omit<ActivityItem, "id">) => void;
  showToast: (message: string) => void;
}) {
  const [modal, setModal] = useState<{ kind: "service" | "location" | "cleaner" | "client"; id: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const [settingsConfirmed, setSettingsConfirmed] = useState(false);
  const [threadDraft, setThreadDraft] = useState<DraftRecord | null>(null);
  const sectionCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
    Schedule: { eyebrow: "OPERATIONS", title: "Service schedule", description: "Today’s three fictional commercial cleaning visits." },
    Locations: { eyebrow: "SERVICE DIRECTORY", title: "Commercial locations", description: "Fictional location details and recurring service plans." },
    Team: { eyebrow: "CREW DIRECTORY", title: "Cleaning team", description: "Fictional cleaners and their assigned service locations." },
    Clients: { eyebrow: "CLIENT DIRECTORY", title: "Client contacts", description: "Fictional contacts connected to each demonstration location." },
    Reports: { eyebrow: "PERFORMANCE", title: "Operations summary", description: "Fictional service, pay, and revenue information for this demo." },
    "Help center": { eyebrow: "DEMO SUPPORT", title: "Help center", description: "A quick guide to the main CleanFlow AI prototype features." },
    Settings: { eyebrow: "DEMO PREFERENCES", title: "Company settings", description: "Fictional business settings and cleaner pay preferences." },
    Communications: { eyebrow: "COMMUNICATIONS", title: "Communication Center", description: "Saved fictional client and cleaner message drafts. Nothing is sent." },
  };
  const copy = sectionCopy[section] ?? sectionCopy.Schedule;
  const selected: any = modal ? (modal.kind === "cleaner" ? cleaners : modal.kind === "client" ? clients : locations).find((item) => item.id === modal.id) : null;
  const openDetails = (kind: "service" | "location" | "cleaner" | "client", item: any) => { setModal({ kind, id: item.id }); setDraft({ ...item }); setEditing(false); };
  const closeDetails = () => { setModal(null); setEditing(false); };
  const cancelEdit = () => { setDraft(selected ? { ...selected } : null); setEditing(false); };
  const saveEdit = () => {
    if (!modal || !draft) return;
    if (modal.kind === "cleaner") setCleaners((all) => all.map((item) => item.id === draft.id ? draft : item));
    else if (modal.kind === "client") setClients((all) => all.map((item) => item.id === draft.id ? draft : item));
    else setLocations((all) => all.map((item) => item.id === draft.id ? { ...draft, value: Number(draft.value) } : item));
    setEditing(false);
    showToast(`${modal.kind === "service" ? "Service" : modal.kind[0].toUpperCase() + modal.kind.slice(1)} details saved`);
    onActivity({ icon: "✎", color: "blue-bg", title: `${modal.kind === "service" ? "Service" : modal.kind} details edited`, detail: draft.name, time: "Just now", reason: "Demo record updated for the current session." });
  };
  const updateDraft = (field: string, value: string | number) => setDraft((current: any) => ({ ...current, [field]: value }));
  const guides = [
    ["Manage today’s services", "Open any schedule row to review the visit, then use Edit to update the cleaner, time, status, or operational notes."],
    ["Draft clear updates", "From the dashboard, create a client or cleaner message using the selected service status and notes, then edit or copy it."],
    ["Estimate cleaner pay", "Compare hourly, flat, percentage, monthly, and semimonthly methods. Saved estimates appear in Recent activity."],
    ["Review the audit trail", "Open Recent activity to see fictional status changes, drafted messages, pay calculations, timestamps, and reasons."],
  ];

  return <div className="section-view">
    <div className="section-heading">
      <div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.description}</p></div>
      <button className="secondary-button back-dashboard" onClick={onBack}>← Back to Dashboard</button>
    </div>
    <div className="fictional-notice" role="note"><span>i</span>All names and information shown are fictional demonstration data.</div>

    {section === "Schedule" && <div className="section-card panel-card"><div className="section-card-head"><div><h2>Sunday, July 19</h2><p>3 scheduled services · 7.5 crew hours</p></div><span className="section-pill">Today</span></div><div className="schedule-list">{locations.map((location, index) => <article key={location.id} className="interactive-row" role="button" tabIndex={0} onClick={() => openDetails("service", location)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openDetails("service", location); }}><div className="schedule-time"><strong>{location.time}</strong><small>Stop {index + 1}</small></div><div className={`location-symbol ${location.color}`}>▥</div><div className="schedule-main"><h3>{location.name}</h3><p>{location.address}</p><small>{location.detail}</small></div><div className="schedule-cleaner"><span>{location.initials}</span><div><strong>{location.cleaner}</strong><small>Assigned cleaner</small></div></div><div className="schedule-controls"><span className={`section-status ${statusStyles[location.status]}`}>{location.status}</span><button onClick={(e) => { e.stopPropagation(); openDetails("service", location); }} aria-label={`View service details for ${location.name}`}>Details</button></div><div className="schedule-notes"><b>Fictional notes</b><p>{location.notes}</p></div></article>)}</div></div>}

    {section === "Locations" && <div className="directory-grid">{locations.map((location) => <article className="directory-card panel-card interactive-card" key={location.id} role="button" tabIndex={0} onClick={() => openDetails("location", location)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openDetails("location", location); }}><div className="directory-top"><div className={`location-symbol ${location.color}`}>▥</div><span className={`section-status ${statusStyles[location.status]}`}>{location.status}</span></div><h2>{location.name}</h2><p>{location.address}</p><dl><div><dt>Service plan</dt><dd>{location.detail}</dd></div><div><dt>Today’s window</dt><dd>{location.time}</dd></div><div><dt>Assigned cleaner</dt><dd>{location.cleaner}</dd></div><div><dt>Job Price</dt><dd>${location.value}</dd></div></dl><button onClick={(e) => { e.stopPropagation(); openDetails("location", location); }}>View location details →</button></article>)}</div>}

    {section === "Team" && <div className="directory-grid team-grid">{cleaners.map((cleaner) => <article className="directory-card panel-card interactive-card" key={cleaner.id} role="button" tabIndex={0} onClick={() => openDetails("cleaner", cleaner)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openDetails("cleaner", cleaner); }}><div className="team-avatar">{cleaner.initials}</div><h2>{cleaner.name}</h2><p>{cleaner.role}</p><dl><div><dt>Assigned today</dt><dd>{cleaner.location}</dd></div><div><dt>Service time</dt><dd>{cleaner.shift}</dd></div><div><dt>Demo pay method</dt><dd>{cleaner.payMethod}</dd></div><div><dt>Availability</dt><dd><i className="live-dot" /> {cleaner.availability}</dd></div></dl><button onClick={(e) => { e.stopPropagation(); openDetails("cleaner", cleaner); }}>View cleaner profile →</button></article>)}</div>}

    {section === "Clients" && <div className="client-table panel-card"><div className="table-head"><span>Contact</span><span>Location</span><span>Email</span><span>Phone</span></div>{clients.map((client) => <article className="interactive-row" key={client.id} role="button" tabIndex={0} onClick={() => openDetails("client", client)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openDetails("client", client); }}><div className="client-name"><span>{client.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{client.name}</strong><small>{client.title}</small></div></div><strong>{client.location}</strong><span>{client.email}</span><span>{client.phone}</span></article>)}</div>}

    {section === "Reports" && <><div className="report-metrics"><article className="panel-card"><span>Completed services</span><strong>18</strong><p>78% of scheduled visits</p></article><article className="panel-card"><span>Missed services</span><strong>2</strong><p>8.7% of scheduled visits</p></article><article className="panel-card"><span>Client Closed</span><strong>3</strong><p>13% of scheduled visits</p></article><article className="panel-card"><span>Fictional revenue</span><strong>$4,860</strong><p>↑ 12.6% from prior week</p></article></div><div className="reports-grid"><article className="panel-card report-summary"><h2>Weekly service summary</h2><div><span>Completed</span><b>18</b></div><div><span>Missed</span><b>2</b></div><div><span>Client Closed</span><b>3</b></div><div className="report-total"><span>Total scheduled</span><b>23</b></div></article><article className="panel-card report-summary"><h2>Pay and revenue</h2><div><span>Estimated cleaner pay</span><b>$2,940</b></div><div><span>Service revenue</span><b>$4,860</b></div><div><span>Gross difference</span><b>$1,920</b></div><div className="report-total"><span>Pay as % of revenue</span><b>60.5%</b></div><button onClick={onOpenPay}>Open pay calculator</button></article></div></>}

    {section === "Help center" && <div className="help-grid"><article className="panel-card help-intro"><div className="help-mark">?</div><h2>CleanFlow AI demo guide</h2><p>Use the dashboard to review service status, update locations, draft messages, calculate cleaner pay, and inspect the fictional activity log.</p></article><article className="panel-card help-list">{guides.map(([title, explanation], index) => <div className={openGuide === index ? "guide-open" : ""} key={title}><button aria-expanded={openGuide === index} onClick={() => setOpenGuide(openGuide === index ? null : index)}><span>{index + 1}</span><p><strong>{title}</strong><small>{openGuide === index ? explanation : "Select to learn more"}</small></p><b>{openGuide === index ? "−" : "+"}</b></button></div>)}</article></div>}

    {section === "Communications" && <div className="panel-card communication-list"><div className="section-card-head"><div><h2>Demo communication inbox</h2><p>{drafts.length} fictional conversations · replies are never sent</p></div></div>{drafts.length ? drafts.map((item) => <article className={archivedDraftIds.includes(item.id) ? "archived" : ""} key={item.id}><span className={`draft-kind ${item.audience}`}>{item.audience === "client" ? "Client" : "Cleaner"}</span><div><h3>{item.recipient}{archivedDraftIds.includes(item.id) && <em>Archived</em>}</h3><p>{item.location} · {item.status}</p><small>{item.time} · Reason: {item.reason}</small></div><div className="inbox-actions"><button onClick={() => onMessage(item.audience, locations.find((location) => location.name === item.location)?.id ?? 1)}>Reply</button><button onClick={() => onMessage(item.audience, locations.find((location) => location.name === item.location)?.id ?? 1)}>Save Draft</button><button onClick={() => setThreadDraft(item)}>View Thread</button><button onClick={() => onArchiveDraft(item.id)}>{archivedDraftIds.includes(item.id) ? "Restore" : "Archive"}</button><button className="delete-action" onClick={() => onDeleteDraft(item.id)}>Delete</button></div></article>) : <div className="empty-state">No conversations yet. Saved drafts and client reports will appear here.</div>}</div>}

    {threadDraft && <div className="modal-backdrop"><section className="message-modal" role="dialog" aria-modal="true" aria-label="Conversation thread"><div className="modal-header"><div><span className="calculator-mark">✦</span><div><p>FICTIONAL THREAD</p><h2>{threadDraft.recipient}</h2></div></div><button onClick={() => setThreadDraft(null)} aria-label="Close conversation thread">×</button></div><div className="thread-view"><p><b>{threadDraft.time}</b> · {threadDraft.location}</p><div>{threadDraft.body}</div><small>No message in this demonstration thread has been sent.</small></div><div className="modal-actions"><button onClick={() => setThreadDraft(null)}>Close</button><button onClick={() => { setThreadDraft(null); onMessage(threadDraft.audience, locations.find((location) => location.name === threadDraft.location)?.id ?? 1); }}>Reply</button></div></section></div>}

    {section === "Settings" && <><div className="settings-grid"><article className="panel-card settings-panel"><div className="section-card-head"><div><h2>Company profile</h2><p>Fictional demonstration settings</p></div></div><label>Company name<input value={settings.company} onChange={(e) => setSettings({ ...settings, company: e.target.value })} /></label><label>Service area<input value={settings.serviceArea} onChange={(e) => setSettings({ ...settings, serviceArea: e.target.value })} /></label><label>Operations email<input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></label><label>Default timezone<select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}><option>Eastern Time</option><option>Central Time</option><option>Pacific Time</option></select></label></article><article className="panel-card settings-panel"><div className="section-card-head"><div><h2>Pay and notifications</h2><p>Demo workspace preferences</p></div></div><label>Default pay method<select value={settings.defaultPay} onChange={(e) => setSettings({ ...settings, defaultPay: e.target.value })}><option>Hourly</option><option>Flat rate</option><option>Percent of job</option><option>Monthly</option><option>Semimonthly</option></select></label><label className="toggle-row"><span><strong>Email status updates</strong><small>Send fictional operations summaries</small></span><input type="checkbox" checked={settings.emailUpdates} onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })} /></label><label className="toggle-row"><span><strong>Automatic service reminders</strong><small>Remind assigned cleaners before visits</small></span><input type="checkbox" checked={settings.autoReminders} onChange={(e) => setSettings({ ...settings, autoReminders: e.target.checked })} /></label><div className="settings-saved">Changes apply to this demo session only.</div></article></div><div className="settings-actions"><button className="primary-button" onClick={() => { setSettingsConfirmed(true); showToast("Demo settings saved for this session"); }}>Save Changes</button>{settingsConfirmed && <span role="status">✓ Settings saved for this demo session.</span>}</div></>}

    {modal && selected && draft && <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) closeDetails(); }}><section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="record-title"><div className="modal-header"><div><span className="calculator-mark">{modal.kind === "cleaner" ? "◎" : modal.kind === "client" ? "○" : "▥"}</span><div><p>{modal.kind.toUpperCase()} DETAILS</p><h2 id="record-title">{selected.name}</h2></div></div><button onClick={closeDetails} aria-label={`Close ${modal.kind} details`}>×</button></div>
      <div className="record-body">
        {!editing ? <div className="detail-grid">
          {(modal.kind === "service" || modal.kind === "location") && <><div><span>Location</span><b>{selected.name}</b></div>{modal.kind === "service" && <div><span>Client</span><b>{selected.client}</b></div>}<div><span>Address</span><b>{selected.address}</b></div><div><span>Service plan</span><b>{selected.detail}</b></div><div><span>Assigned cleaner</span><b>{selected.cleaner}</b></div><div><span>Service time</span><b>{selected.time}</b></div><div><span>Status</span><b>{selected.status}</b></div><div><span>Job Price</span><b>${selected.value}</b></div><div className="detail-notes"><span>Notes</span><b>{selected.notes}</b></div></>}
          {modal.kind === "cleaner" && <><div><span>Name</span><b>{selected.name}</b></div><div><span>Role</span><b>{selected.role}</b></div><div><span>Email</span><b>{selected.email}</b></div><div><span>Phone</span><b>{selected.phone}</b></div><div><span>Availability</span><b>{selected.availability}</b></div><div><span>Assigned location</span><b>{selected.location}</b></div><div><span>Service time</span><b>{selected.shift}</b></div><div><span>Pay method</span><b>{selected.payMethod}</b></div></>}
          {modal.kind === "client" && <><div><span>Name</span><b>{selected.name}</b></div><div><span>Role</span><b>{selected.title}</b></div><div><span>Email</span><b>{selected.email}</b></div><div><span>Phone</span><b>{selected.phone}</b></div><div><span>Linked location</span><b>{selected.location}</b></div><div className="detail-notes"><span>Notes</span><b>{selected.notes}</b></div></>}
        </div> : <div className="record-form">
          {(modal.kind === "service" || modal.kind === "location") && <>{modal.kind === "location" && <><label>Address<input value={draft.address} onChange={(e) => updateDraft("address", e.target.value)} /></label><label>Service plan<input value={draft.detail} onChange={(e) => updateDraft("detail", e.target.value)} /></label></>}<label>Assigned cleaner<select value={draft.cleaner} onChange={(e) => updateDraft("cleaner", e.target.value)}>{cleaners.map((cleaner) => <option key={cleaner.id}>{cleaner.name}</option>)}</select></label><label>Service time<input value={draft.time} onChange={(e) => updateDraft("time", e.target.value)} /></label>{modal.kind === "service" && <label>Status<select value={draft.status} onChange={(e) => updateDraft("status", e.target.value)}><option>Completed</option><option>Missed</option><option>Client Closed</option></select></label>}{modal.kind === "location" && <label>Job Price<input type="number" value={draft.value} onChange={(e) => updateDraft("value", e.target.value)} /></label>}<label className="full">Notes<textarea value={draft.notes} onChange={(e) => updateDraft("notes", e.target.value)} /></label></>}
          {modal.kind === "cleaner" && <><label>Name<input value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} /></label><label>Email<input value={draft.email} onChange={(e) => updateDraft("email", e.target.value)} /></label><label>Phone<input value={draft.phone} onChange={(e) => updateDraft("phone", e.target.value)} /></label><label>Availability<input value={draft.availability} onChange={(e) => updateDraft("availability", e.target.value)} /></label><label>Assigned location<select value={draft.location} onChange={(e) => updateDraft("location", e.target.value)}>{locations.map((location) => <option key={location.id}>{location.name}</option>)}</select></label><label>Service time<input value={draft.shift} onChange={(e) => updateDraft("shift", e.target.value)} /></label><label className="full">Pay method<input value={draft.payMethod} onChange={(e) => updateDraft("payMethod", e.target.value)} /></label></>}
          {modal.kind === "client" && <><label>Name<input value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} /></label><label>Email<input value={draft.email} onChange={(e) => updateDraft("email", e.target.value)} /></label><label>Phone<input value={draft.phone} onChange={(e) => updateDraft("phone", e.target.value)} /></label><label>Linked location<select value={draft.location} onChange={(e) => updateDraft("location", e.target.value)}>{locations.map((location) => <option key={location.id}>{location.name}</option>)}</select></label><label className="full">Notes<textarea value={draft.notes} onChange={(e) => updateDraft("notes", e.target.value)} /></label></>}
        </div>}
      </div><div className="modal-actions">{editing ? <><button onClick={cancelEdit}>Cancel</button><button onClick={saveEdit}>Save</button></> : <><button onClick={closeDetails}>Close</button><button onClick={() => onMessage("cleaner", modal.kind === "service" || modal.kind === "location" ? selected.id : locations.find((item) => item.name === selected.location)?.id ?? 1)}>Message Cleaner</button><button onClick={() => onMessage("client", modal.kind === "service" || modal.kind === "location" ? selected.id : locations.find((item) => item.name === selected.location)?.id ?? 1)}>Message Client</button><button onClick={() => setEditing(true)}>Edit {modal.kind === "service" ? "Service" : modal.kind[0].toUpperCase() + modal.kind.slice(1)}</button></>}</div></section></div>}
  </div>;
}

export default function Home() {
  const [locations, setLocations] = useState(initialLocations);
  const [cleaners, setCleaners] = useState(initialCleaners);
  const [clients, setClients] = useState(initialClients);
  const [settings, setSettings] = useState(initialSettings);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [role, setRole] = useState<DemoRole>("Owner/Admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [notifications, setNotifications] = useState(["Client draft saved", "Missed visit", "Cleaner checked in", "Schedule updated"]);
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [archivedDraftIds, setArchivedDraftIds] = useState<number[]>([]);
  const [jobOpen, setJobOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState<"jobs" | "completed" | "revenue" | "cleaners" | null>(null);
  const [checklist, setChecklist] = useState([false, false, false, false]);
  const [portalPhoto, setPortalPhoto] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [problemDescription, setProblemDescription] = useState("");
  const [problemPhoto, setProblemPhoto] = useState(false);
  const [newJob, setNewJob] = useState(initialJobDraft);
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

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); searchRef.current?.focus(); setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

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
  };

  const saveDraft = () => {
    const recipient = messageAudience === "client" ? selectedLocation.client : selectedLocation.cleaner;
    const saved: DraftRecord = { id: Date.now(), audience: messageAudience, recipient, location: selectedLocation.name, status: selectedLocation.status, time: "Today · Just now", reason: selectedLocation.notes, body: messageText };
    setDrafts((current) => [saved, ...current]);
    addActivity({ icon: "✦", color: "teal-bg", title: `${messageAudience === "client" ? "Client" : "Cleaner"} draft saved for ${recipient}`, detail: `${selectedLocation.name} · ${selectedLocation.status}`, time: "Just now", reason: selectedLocation.notes });
    setMessageOpen(false); showToast("Draft saved to Communication Center");
  };

  const portalAction = (title: string, reason: string) => { addActivity({ icon: "✓", color: "teal-bg", title, detail: role, time: "Just now", reason }); showToast(title); };
  const saveJob = () => {
    const cleaner = cleaners.find((item) => item.name === newJob.cleaner) ?? cleaners[0];
    const client = clients.find((item) => item.name === newJob.client) ?? clients[0];
    const next: LocationRecord = { id: Date.now(), name: `${newJob.location} · Extra Service`, address: locations.find((item) => item.name === newJob.location)?.address ?? "100 Demo Way", client: client.name, time: `${formatTime(newJob.start)}–${formatTime(newJob.end)}`, cleaner: cleaner.name, initials: cleaner.initials, value: Number(newJob.value), status: newJob.status, detail: `One-time service · ${newJob.date}`, notes: `${newJob.instructions} ${newJob.notes}`, color: "blue" };
    setLocations((current) => [...current, next]); setJobOpen(false); setNewJob({ ...initialJobDraft });
    addActivity({ icon: "+", color: "blue-bg", title: `Job added for ${next.name}`, detail: `${next.cleaner} · ${next.time}`, time: "Just now", reason: newJob.instructions }); showToast("New fictional job saved");
  };

  const submitProblem = () => {
    const job = locations[0];
    const body = `Client problem report for ${job.name}\n\nDescription: ${problemDescription || "No description provided."}\nDemo photo: ${problemPhoto ? "Attached" : "Not attached"}\n\nFictional demonstration report only.`;
    setDrafts((current) => [{ id: Date.now(), audience: "client", recipient: "Brightline Cleaning Co.", location: job.name, status: job.status, time: "Today · Just now", reason: problemDescription || "Client reported a service problem.", body }, ...current]);
    addActivity({ icon: "!", color: "amber-bg", title: "Client problem report drafted", detail: job.name, time: "Just now", reason: problemDescription || "Client reported a service problem." });
    setProblemOpen(false); setProblemDescription(""); setProblemPhoto(false); showToast("Problem report saved to Communication Center");
  };

  const searchGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase(); if (!q) return [];
    return [
      { label: "Locations", items: locations.filter((item) => `${item.name} ${item.address}`.toLowerCase().includes(q)).map((item) => ({ title: item.name, detail: item.address, nav: "Locations" })) },
      { label: "Cleaners", items: cleaners.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(q)).map((item) => ({ title: item.name, detail: item.location, nav: "Team" })) },
      { label: "Clients", items: clients.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(q)).map((item) => ({ title: item.name, detail: item.location, nav: "Clients" })) },
      { label: "Services & jobs", items: locations.filter((item) => `${item.name} ${item.cleaner} ${item.status} ${item.detail}`.toLowerCase().includes(q)).map((item) => ({ title: `${item.name} service`, detail: `${item.time} · ${item.status}`, nav: "Schedule" })) },
    ].filter((group) => group.items.length);
  }, [searchQuery, locations, cleaners, clients]);

  const setStatus = (id: number, status: ServiceStatus) => {
    setLocations((current) => current.map((location) => location.id === id ? { ...location, status } : location));
    const location = locations.find((item) => item.id === id)!;
    addActivity({ icon: status === "Completed" ? "✓" : status === "Missed" ? "!" : "○", color: status === "Completed" ? "teal-bg" : status === "Missed" ? "amber-bg" : "violet-bg", title: `${location.name} marked ${status}`, detail: `Assigned cleaner: ${location.cleaner}`, time: "Just now", reason: location.notes });
    showToast(`Service marked ${status.toLowerCase()}`);
  };

  const navItems = [
    ["Dashboard", "⌂"], ["Schedule", "▦"], ["Locations", "◇"], ["Team", "◎"], ["Clients", "○"], ["Reports", "↗"], ["Communications", "✦"],
  ];

  if (role === "Cleaner") {
    const cleaner = cleaners[0]; const job = locations.find((item) => item.cleaner === cleaner.name) ?? locations[0];
    return <main className="portal-shell"><header className="portal-top"><div className="brand"><span className="brand-mark">C</span><span>CleanFlow <b>AI</b></span></div><div className="role-switch"><label>Switch Demo Role<select value={role} onChange={(e) => setRole(e.target.value as DemoRole)}><option>Owner/Admin</option><option>Cleaner</option><option>Client/School</option></select></label></div></header><div className="portal-content"><div className="portal-heading"><div><p className="eyebrow">CLEANER DEMO PORTAL</p><h1>Welcome, {cleaner.name}</h1><p>Only your fictional assignment and pay estimate are shown.</p></div><button className="secondary-button" onClick={() => setRole("Owner/Admin")}>Return to Owner/Admin</button></div><div className="fictional-notice"><span>i</span>All names and information shown are fictional demonstration data.</div><section className="portal-grid"><article className="panel-card portal-job"><div className="section-card-head"><div><h2>Today’s assigned job</h2><p>{job.time} · {job.status}</p></div><span className={`section-status ${statusStyles[job.status]}`}>{job.status}</span></div><div className="portal-job-body"><h2>{job.name}</h2><p>{job.address}</p><dl><div><dt>Service instructions</dt><dd>{job.detail}</dd></div><div><dt>Job notes</dt><dd>{job.notes}</dd></div><div><dt>Estimated pay</dt><dd>$176.00</dd></div></dl><div className="portal-actions">{["Check In","Start Service","Report Issue","Message Manager","Mark Complete"].map((action) => <button key={action} onClick={() => action === "Message Manager" ? draftMessage("client", job.id) : portalAction(`${cleaner.name}: ${action}`, `Cleaner action for ${job.name}.`)}>{action}</button>)}</div></div></article><article className="panel-card checklist-card"><h2>Cleaning checklist</h2>{["Entry and lobby","Work areas","Restrooms","Final walkthrough"].map((item, index) => <label key={item}><input type="checkbox" checked={checklist[index]} onChange={(e) => setChecklist((current) => current.map((value, i) => i === index ? e.target.checked : value))} />{item}</label>)}<button onClick={() => portalAction("Checklist completed", `Four-step checklist submitted for ${job.name}.`)}>Complete Checklist</button><div className="photo-demo"><p className={portalPhoto ? "photo-success" : ""}>{portalPhoto ? "✓ Demo photo uploaded" : "No demonstration photo attached"}</p><button onClick={() => { setPortalPhoto(true); portalAction("Demo photo attached", `Mock photo placeholder added for ${job.name}.`); }}>Add Demo Photo</button></div></article></section></div>{problemOpen && <ProblemOverlay description={problemDescription} photo={problemPhoto} setDescription={setProblemDescription} setPhoto={setProblemPhoto} onSubmit={submitProblem} onClose={() => setProblemOpen(false)} />}{messageOpen && <MessageOverlay audience={messageAudience} text={messageText} editing={messageEditing} setEditing={setMessageEditing} setText={setMessageText} onCopy={() => { navigator.clipboard.writeText(messageText); showToast("Draft copied"); }} onSave={saveDraft} onClose={() => setMessageOpen(false)} />}{toast && <div className="toast"><span>✓</span>{toast}</div>}</main>;
  }

  if (role === "Client/School") {
    const client = clients[0]; const job = locations.find((item) => item.name === client.location) ?? locations[0];
    return <main className="portal-shell"><header className="portal-top"><div className="brand"><span className="brand-mark">C</span><span>CleanFlow <b>AI</b></span></div><div className="role-switch"><label>Switch Demo Role<select value={role} onChange={(e) => setRole(e.target.value as DemoRole)}><option>Owner/Admin</option><option>Cleaner</option><option>Client/School</option></select></label></div></header><div className="portal-content"><div className="portal-heading"><div><p className="eyebrow">CLIENT / SCHOOL DEMO PORTAL</p><h1>{job.name}</h1><p>Welcome, {client.name}. Only your fictional location information is shown.</p></div><button className="secondary-button" onClick={() => setRole("Owner/Admin")}>Return to Owner/Admin</button></div><div className="fictional-notice"><span>i</span>All names and information shown are fictional demonstration data.</div><section className="portal-grid"><article className="panel-card portal-job"><div className="section-card-head"><div><h2>Upcoming cleaning schedule</h2><p>Today · {job.time}</p></div><span className={`section-status ${statusStyles[job.status]}`}>{job.status}</span></div><div className="portal-job-body"><h2>{job.name}</h2><p>{job.address}</p><dl><div><dt>Assigned cleaner</dt><dd>{job.cleaner}</dd></div><div><dt>Completed-service summary</dt><dd>24-point checklist · lobby glass spot-cleaned</dd></div><div><dt>Recent update</dt><dd>Service status confirmed today at 8:21 AM.</dd></div></dl><div className="portal-actions">{["Report a Problem","Request Extra Service","Message Company","Acknowledge Service Change"].map((action) => <button key={action} onClick={() => action === "Report a Problem" ? setProblemOpen(true) : action === "Message Company" ? draftMessage("client", job.id) : portalAction(`${client.name}: ${action}`, `Client portal request for ${job.name}.`)}>{action}</button>)}</div></div></article><article className="panel-card client-update-card"><h2>Recent updates</h2><p><b>Today · 8:21 AM</b> Service checklist completed.</p><p><b>Yesterday · 3:10 PM</b> Schedule reminder confirmed.</p><button onClick={() => draftMessage("client", job.id)}>Message Company</button></article></section></div>{problemOpen && <ProblemOverlay description={problemDescription} photo={problemPhoto} setDescription={setProblemDescription} setPhoto={setProblemPhoto} onSubmit={submitProblem} onClose={() => setProblemOpen(false)} />}{messageOpen && <MessageOverlay audience={messageAudience} text={messageText} editing={messageEditing} setEditing={setMessageEditing} setText={setMessageText} onCopy={() => { navigator.clipboard.writeText(messageText); showToast("Draft copied"); }} onSave={saveDraft} onClose={() => setMessageOpen(false)} />}{toast && <div className="toast"><span>✓</span>{toast}</div>}</main>;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>CleanFlow <b>AI</b></span></div>
        <div className="workspace-label">Workspace</div>
        <nav aria-label="Primary navigation">
          {navItems.map(([label, symbol]) => (
            <button key={label} onClick={() => setActiveNav(label)} className={activeNav === label ? "active" : ""}>
              <Icon>{symbol}</Icon><span>{label}</span>{label === "Schedule" && <em>{locations.length}</em>}{label === "Communications" && drafts.length > 0 && <em>{drafts.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setPayOpen(true)}><Icon>$</Icon><span>Pay calculator</span></button>
          <button onClick={() => setActiveNav("Help center")} className={activeNav === "Help center" ? "active" : ""}><Icon>?</Icon><span>Help center</span></button>
          <button onClick={() => setActiveNav("Settings")} className={activeNav === "Settings" ? "active" : ""}><Icon>⚙</Icon><span>Settings</span></button>
          <div className="demo-note"><span>DEMO WORKSPACE</span><p>All names, jobs, and figures are fictional.</p></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="search-wrap"><div className="search"><span>⌕</span><input ref={searchRef} aria-label="Global search" placeholder="Search jobs, clients, cleaners…" value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }} /><kbd>⌘ K</kbd></div>{searchOpen && searchQuery && <div className="search-results" role="dialog" aria-label="Search results"><div className="search-result-head"><b>Search results</b><button onClick={() => setSearchOpen(false)} aria-label="Close search results">×</button></div>{searchGroups.length ? searchGroups.map((group) => <section key={group.label}><h3>{group.label}</h3>{group.items.map((item) => <button key={`${group.label}-${item.title}`} onClick={() => { setActiveNav(item.nav); setSearchOpen(false); }}><b>{item.title}</b><small>{item.detail}</small><span>→</span></button>)}</section>) : <div className="empty-state">No fictional locations, cleaners, clients, services, or jobs match “{searchQuery}”.</div>}</div>}</div>
          <div className="top-actions"><div className="role-switch compact"><label>Switch Demo Role<select aria-label="Switch Demo Role" value={role} onChange={(e) => setRole(e.target.value as DemoRole)}><option>Owner/Admin</option><option>Cleaner</option><option>Client/School</option></select></label></div><div className="notification-wrap"><button className="icon-button" aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setNotificationsRead(true); }}>🔔{!notificationsRead && notifications.length > 0 && <i />}</button>{notificationsOpen && <div className="notification-panel" role="dialog" aria-label="Demo notifications"><div><b>Notifications</b><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button></div>{notifications.length ? notifications.map((item) => <p key={item}>{item}</p>) : <div className="empty-state">No demo notifications.</div>}<footer><button onClick={() => setNotificationsRead(true)}>Mark all as read</button><button onClick={() => setNotifications([])}>Clear notifications</button></footer></div>}</div><div className="profile"><span>AP</span><div><strong>Avery Patel</strong><small>Owner/Admin</small></div></div></div>
        </header>

        <div className="content">
          {activeNav === "Dashboard" ? <>
          <div className="page-heading">
            <div><p className="eyebrow">SUNDAY, JULY 19</p><h1>Good morning, Avery.</h1><p>Here’s how Brightline Cleaning Co. is running today.</p></div>
            <div className="heading-actions"><button className="secondary-button" onClick={() => setPayOpen(true)}>▣ &nbsp; Calculate pay</button><button className="primary-button" onClick={() => { setNewJob({ ...initialJobDraft }); setJobOpen(true); }}>＋ Add job</button></div>
          </div>

          <div className="fictional-notice" role="note"><span>i</span>All names and information shown are fictional demonstration data.</div>

          <section className="metrics" aria-label="Business overview">
            <article role="button" tabIndex={0} onClick={() => setSummaryOpen("jobs")}><div className="metric-head"><span>Today’s jobs</span><b className="metric-icon blue">▦</b></div><strong>{locations.length}</strong><p>Open today’s schedule</p></article>
            <article role="button" tabIndex={0} onClick={() => setSummaryOpen("completed")}><div className="metric-head"><span>Completed</span><b className="metric-icon teal">✓</b></div><strong>{locations.filter((l) => l.status === "Completed").length}<small> / {locations.length}</small></strong><p>View completed services</p></article>
            <article role="button" tabIndex={0} onClick={() => setSummaryOpen("revenue")}><div className="metric-head"><span>Revenue today</span><b className="metric-icon violet">$</b></div><strong>${locations.reduce((sum, l) => sum + l.value, 0).toLocaleString()}</strong><p>View fictional breakdown</p></article>
            <article role="button" tabIndex={0} onClick={() => setSummaryOpen("cleaners")}><div className="metric-head"><span>Active cleaners</span><b className="metric-icon amber">◎</b></div><strong>{cleaners.length}</strong><p><span className="live-dot" /> View today’s team</p></article>
          </section>

          <section className="workspace-grid">
            <div className="locations-card panel-card">
              <div className="card-title"><div><h2>Today’s service locations</h2><p>Three commercial locations on the schedule</p></div><button onClick={() => setActiveNav("Schedule")}>View schedule <span>→</span></button></div>
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
                    <button className="more-button" aria-label={`More options for ${location.name}`} onClick={() => setActiveNav("Schedule")}>•••</button>
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
            <article className="panel-card revenue-card"><div className="card-title"><div><h2>Weekly revenue</h2><p>Job Price by day</p></div><button onClick={() => showToast("Showing this fictional week")}>This week ⌄</button></div><div className="revenue-top"><strong>$4,860</strong><span>↑ 12.6%</span><small>vs. last week</small></div><div className="chart"><i style={{height:"42%"}} /><i style={{height:"63%"}} /><i style={{height:"54%"}} /><i style={{height:"78%"}} /><i style={{height:"71%"}} /><i style={{height:"92%"}} /><i className="today" style={{height:"46%"}} /></div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></article>
            <article className="panel-card activity-card"><div className="card-title"><div><h2>Recent activity</h2><p>Live team updates</p></div><button onClick={() => setActivityOpen(true)}>See all</button></div><ul>{activity.slice(0, 3).map((item) => <li key={item.id}><span className={item.color}>{item.icon}</span><p><strong>{item.title}</strong><small>{item.detail} · {item.time}</small></p></li>)}</ul></article>
          </section>
          </> : <SectionView section={activeNav} locations={locations} setLocations={setLocations} cleaners={cleaners} setCleaners={setCleaners} clients={clients} setClients={setClients} settings={settings} setSettings={setSettings} drafts={drafts} archivedDraftIds={archivedDraftIds} onArchiveDraft={(id) => setArchivedDraftIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onDeleteDraft={(id) => { setDrafts((current) => current.filter((item) => item.id !== id)); setArchivedDraftIds((current) => current.filter((item) => item !== id)); showToast("Demo conversation deleted"); }} onBack={() => setActiveNav("Dashboard")} onOpenPay={() => setPayOpen(true)} onMessage={draftMessage} onActivity={addActivity} showToast={showToast} />}
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
          <div className="message-actions"><button onClick={() => { navigator.clipboard.writeText(messageText); showToast("Draft copied to clipboard"); }}>Copy</button><button className={messageEditing ? "editing" : ""} onClick={() => setMessageEditing((value) => !value)}>{messageEditing ? "Done editing" : "Edit"}</button><button onClick={() => setMessageEditing(false)}>Cancel</button><button onClick={saveDraft}>Save Draft</button><button onClick={() => setMessageOpen(false)}>Close</button></div>
        </section>
      </div>}

      {jobOpen && <div className="modal-backdrop"><section className="record-modal" role="dialog" aria-modal="true" aria-label="New Job"><div className="modal-header"><div><span className="calculator-mark">＋</span><div><p>FICTIONAL JOB</p><h2>New Job</h2></div></div><button onClick={() => setJobOpen(false)} aria-label="Close New Job">×</button></div><div className="record-body record-form"><label>Client<select value={newJob.client} onChange={(e) => setNewJob({ ...newJob, client: e.target.value })}>{clients.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label>Location<select value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}>{initialLocations.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label>Service date<input type="date" value={newJob.date} onChange={(e) => setNewJob({ ...newJob, date: e.target.value })} /></label><label>Start time<input type="time" value={newJob.start} onChange={(e) => setNewJob({ ...newJob, start: e.target.value })} /></label><label>End time<input type="time" value={newJob.end} onChange={(e) => setNewJob({ ...newJob, end: e.target.value })} /></label><label>Assigned cleaner<select value={newJob.cleaner} onChange={(e) => setNewJob({ ...newJob, cleaner: e.target.value })}>{cleaners.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label>Job Price<input type="number" value={newJob.value} onChange={(e) => setNewJob({ ...newJob, value: Number(e.target.value) })} /></label><label>Status<select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value as ServiceStatus })}><option>Completed</option><option>Missed</option><option>Client Closed</option></select></label><label className="full">Service instructions<textarea value={newJob.instructions} onChange={(e) => setNewJob({ ...newJob, instructions: e.target.value })} /></label><label className="full">Internal notes<textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} /></label></div><div className="modal-actions"><button onClick={() => setJobOpen(false)}>Cancel</button><button onClick={saveJob}>Save Job</button></div></section></div>}

      {summaryOpen && <div className="modal-backdrop"><section className="activity-modal summary-modal" role="dialog" aria-modal="true" aria-label={`${summaryOpen} summary`}><div className="modal-header"><div><span className="calculator-mark">{summaryOpen === "revenue" ? "$" : summaryOpen === "cleaners" ? "◎" : "▦"}</span><div><p>DASHBOARD DETAIL</p><h2>{summaryOpen === "jobs" ? "Today’s Jobs" : summaryOpen === "completed" ? "Completed Services" : summaryOpen === "revenue" ? "Revenue Today" : "Active Cleaners"}</h2></div></div><button onClick={() => setSummaryOpen(null)} aria-label="Close summary">×</button></div><div className="summary-list">{summaryOpen === "cleaners" ? cleaners.map((item, index) => <article key={item.id}><b>{item.name}</b><span>{item.location}</span><small>{item.shift} · {index === 0 ? "🟢 Working" : index === 1 ? "🟡 On Break" : "⚪ Finished"}</small></article>) : locations.filter((item) => summaryOpen !== "completed" || item.status === "Completed").map((item) => <article key={item.id}><b>{item.name}</b><span>{summaryOpen === "revenue" ? `$${item.value} Job Price` : summaryOpen === "completed" ? `Completed by ${item.cleaner}` : `${item.cleaner} · ${item.time}`}</span><small>{summaryOpen === "completed" ? `Completed at 8:21 AM · Checklist complete · ${item.notes}` : `${item.status} · ${item.notes}`}</small></article>)}</div>{summaryOpen === "revenue" && <div className="summary-total"><span>Total Job Price</span><b>${locations.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</b></div>}<div className="modal-actions"><button onClick={() => setSummaryOpen(null)}>Close</button><button onClick={() => { setSummaryOpen(null); setActiveNav(summaryOpen === "revenue" ? "Reports" : summaryOpen === "cleaners" ? "Team" : "Schedule"); }}>{summaryOpen === "revenue" ? "Open Reports" : summaryOpen === "cleaners" ? "View Cleaner Profiles" : "View Full Schedule"}</button></div></section></div>}

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
