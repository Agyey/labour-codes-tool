import { useState, useMemo, useCallback, useEffect, useRef } from "react";

/* ========== STORAGE ========== */
const SK = "lc-v5";
async function ld(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function sv(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } }

/* ========== CONSTANTS ========== */
const CODES = {
    CoW: { n: "Code on Wages, 2019", s: "CoW", c: "#2563eb", bg: "#eff6ff", secs: 69, chs: 9, assent: "8 Aug 2019", eff: "21 Nov 2025", dr: "30 Dec 2025", ra: "Central Govt u/s 67", acts: ["Payment of Wages Act, 1936", "Minimum Wages Act, 1948", "Payment of Bonus Act, 1965", "Equal Remuneration Act, 1976"] },
    IRC: { n: "Industrial Relations Code, 2020", s: "IRC", c: "#7c3aed", bg: "#f5f3ff", secs: 104, chs: 14, assent: "28 Sep 2020", eff: "21 Nov 2025", dr: "30 Dec 2025", ra: "Central Govt u/s 99", acts: ["Trade Unions Act, 1926", "Industrial Employment (Standing Orders) Act, 1946", "Industrial Disputes Act, 1947"] },
    CoSS: { n: "Code on Social Security, 2020", s: "CoSS", c: "#059669", bg: "#ecfdf5", secs: 164, chs: 14, assent: "28 Sep 2020", eff: "21 Nov 2025", dr: "30 Dec 2025", ra: "Central Govt u/s 154-159", acts: ["Employee Compensation Act, 1923", "ESI Act, 1948", "EPF & MP Act, 1952", "Employment Exchanges Act, 1959", "Maternity Benefit Act, 1961", "Payment of Gratuity Act, 1972", "Cine Workers WF Act, 1981", "B&OCW Cess Act, 1996", "Unorganised Workers SS Act, 2008"] },
    OSHW: { n: "OSH & Working Conditions Code, 2020", s: "OSHW", c: "#dc2626", bg: "#fef2f2", secs: 143, chs: 15, assent: "28 Sep 2020", eff: "21 Nov 2025", dr: "30 Dec 2025", ra: "Central Govt u/s 133-134", acts: ["Factories Act, 1948", "Mines Act, 1952", "Dock Workers Act, 1986", "B&OCW(RE) Act, 1996", "Plantations Labour Act, 1951", "Contract Labour Act, 1970", "ISMW Act, 1979", "Working Journalist Act, 1955", "WJ(FRW) Act, 1958", "Motor Transport Workers Act, 1961", "Sales Promotion Employees Act, 1976", "Beedi & Cigar Workers Act, 1966", "Cine Workers & CTW Act, 1981"] }
};
const ST = ["Centre", "Delhi", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana"];
const IMP = ["Critical", "High", "Medium", "Low"];
const CST = ["Not Started", "In Progress", "Compliant", "N/A"];
const RA = ["Central Government", "State Government", "Appropriate Government", "Central & State Government", "Not Applicable"];
const CTAGS = ["Applicability changed", "Definition changed", "Threshold changed", "Penalty changed", "New provision", "Provision removed", "Procedure changed", "Authority changed", "Timeline changed", "Coverage expanded", "Coverage narrowed", "Form/register changed"];
const WTAGS_DEF = ["Verified", "State variation exists", "Rules pending", "Financially material", "Urgent action needed", "For discussion"];
const stRS = { Centre: { CoW: "Draft", IRC: "Draft", CoSS: "Draft", OSHW: "Draft" }, Delhi: { CoW: "Final", IRC: "Draft", CoSS: "Final", OSHW: "Draft" }, Karnataka: { CoW: "Final", IRC: "Final", CoSS: "Draft", OSHW: "Draft" }, Maharashtra: { CoW: "Final", IRC: "Final", CoSS: "Final", OSHW: "Final" }, "Tamil Nadu": { CoW: "Draft", IRC: "Draft", CoSS: "Not Published", OSHW: "Draft" }, Telangana: { CoW: "Draft", IRC: "Draft", CoSS: "Draft", OSHW: "Draft" } };

const IC = { Critical: "#dc2626", High: "#ea580c", Medium: "#ca8a04", Low: "#16a34a" };
const TC = { "Applicability changed": "#3b82f6", "Definition changed": "#8b5cf6", "Threshold changed": "#f59e0b", "Penalty changed": "#ef4444", "New provision": "#10b981", "Provision removed": "#6b7280", "Procedure changed": "#06b6d4", "Authority changed": "#ec4899", "Timeline changed": "#f97316", "Coverage expanded": "#22c55e", "Coverage narrowed": "#dc2626", "Form/register changed": "#a855f7" };
const WC = { Verified: "#059669", "State variation exists": "#7c3aed", "Rules pending": "#f59e0b", "Financially material": "#dc2626", "Urgent action needed": "#ef4444", "For discussion": "#3b82f6" };

/* ========== SMALL COMPONENTS ========== */
function Badge({ text, bg, color }) {
    return <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 99, fontSize: 9, fontWeight: 600, color: color || "#fff", background: bg || "#6b7280", lineHeight: "16px", marginRight: 2, marginBottom: 1, whiteSpace: "nowrap" }}>{text}</span>;
}

function TagChip({ t, map, small, onClick, active }) {
    const col = map[t] || "#6b7280";
    if (onClick) {
        return <button onClick={onClick} style={{ padding: small ? "0 4px" : "1px 6px", borderRadius: 99, fontSize: small ? 7 : 9, fontWeight: active ? 700 : 400, color: active ? "#fff" : col, background: active ? col : col + "18", border: "1px solid " + (active ? col : col + "40"), cursor: "pointer", lineHeight: small ? "13px" : "16px", marginRight: 2, marginBottom: 1 }}>{t}</button>;
    }
    return <Badge text={t} bg={col} />;
}

function Prog({ val, max, color }) {
    const pct = max === 0 ? 0 : Math.round((val / max) * 100);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: "100%", background: color || "#10b981", borderRadius: 3, transition: "width .3s" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", minWidth: 30 }}>{pct}%</span>
        </div>
    );
}

/* ========== BLANK PROVISION ========== */
function blankProv(code) {
    return {
        id: code + "-" + Date.now(), code: code, ch: "", chName: "", sec: "", sub: "", title: "",
        ruleAuth: "Appropriate Government", summary: "", fullText: "",
        oldMappings: [],
        impact: "Medium", changeTags: [], workflowTags: [],
        compItems: [],
        draftRules: [], repealedRules: [], forms: [],
        stateNotes: Object.fromEntries(ST.map(function (s) { return [s, ""]; })),
        stateRuleText: Object.fromEntries(ST.map(function (s) { return [s, ""]; })),
        stateCompStatus: Object.fromEntries(ST.map(function (s) { return [s, "Not Started"]; })),
        penaltyOld: "", penaltyNew: "",
        timelineDates: [],
        notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
    };
}

function blankOldMapping() {
    return { act: "", sec: "", summary: "", fullText: "", change: "", changeTags: [] };
}

/* ========== EDITOR MODAL ========== */
function EditorModal({ prov, onSave, onCancel, codeKey }) {
    const [f, setF] = useState(JSON.parse(JSON.stringify(prov)));

    function upd(key, val) { setF(function (p) { return Object.assign({}, p, { [key]: val }); }); }
    function updNested(arr, idx, key, val) {
        setF(function (p) {
            var n = p[arr].slice();
            n[idx] = Object.assign({}, n[idx], { [key]: val });
            return Object.assign({}, p, { [arr]: n });
        });
    }
    function addToArr(arr, item) { setF(function (p) { return Object.assign({}, p, { [arr]: p[arr].concat([item]) }); }); }
    function rmFromArr(arr, idx) { setF(function (p) { return Object.assign({}, p, { [arr]: p[arr].filter(function (_, i) { return i !== idx; }) }); }); }
    function toggleInArr(key, val) {
        setF(function (p) {
            var cur = p[key] || [];
            return Object.assign({}, p, { [key]: cur.indexOf(val) >= 0 ? cur.filter(function (x) { return x !== val; }) : cur.concat([val]) });
        });
    }
    function toggleOldMapTag(idx, val) {
        setF(function (p) {
            var n = p.oldMappings.slice();
            var cur = n[idx].changeTags || [];
            n[idx] = Object.assign({}, n[idx], { changeTags: cur.indexOf(val) >= 0 ? cur.filter(function (x) { return x !== val; }) : cur.concat([val]) });
            return Object.assign({}, p, { oldMappings: n });
        });
    }

    var iStyle = { width: "100%", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 11, boxSizing: "border-box" };
    var tStyle = Object.assign({}, iStyle, { fontFamily: "monospace", resize: "vertical" });
    var lStyle = { fontSize: 10, fontWeight: 700, color: "#374151", marginBottom: 2, display: "block" };
    var secStyle = { marginBottom: 10, padding: 8, background: "#f9fafb", borderRadius: 6 };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 20, overflow: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 10, width: "95%", maxWidth: 900, maxHeight: "90vh", overflow: "auto", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{prov.id.includes(Date.now + "") ? "Add" : "Edit"} Provision</h2>
                    <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
                </div>

                {/* Basic Info */}
                <div style={secStyle}>
                    <label style={lStyle}>Basic Information</label>
                    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 70px 70px", gap: 6, marginBottom: 6 }}>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Chapter</label><input value={f.ch} onChange={function (e) { upd("ch", e.target.value); }} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Chapter Name</label><input value={f.chName} onChange={function (e) { upd("chName", e.target.value); }} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Section</label><input value={f.sec} onChange={function (e) { upd("sec", e.target.value); }} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Sub-sec</label><input value={f.sub} onChange={function (e) { upd("sub", e.target.value); }} style={iStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 6 }}>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Title</label><input value={f.title} onChange={function (e) { upd("title", e.target.value); }} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Impact</label><select value={f.impact} onChange={function (e) { upd("impact", e.target.value); }} style={iStyle}>{IMP.map(function (i) { return <option key={i} value={i}>{i}</option>; })}</select></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Rule Authority</label><select value={f.ruleAuth} onChange={function (e) { upd("ruleAuth", e.target.value); }} style={iStyle}>{RA.map(function (r) { return <option key={r} value={r}>{r}</option>; })}</select></div>
                    </div>
                </div>

                {/* Summary + Full Text */}
                <div style={secStyle}>
                    <label style={lStyle}>New Provision</label>
                    <label style={{ fontSize: 9, color: "#6b7280" }}>Summary (shown on main view)</label>
                    <textarea value={f.summary} onChange={function (e) { upd("summary", e.target.value); }} rows={3} style={iStyle} />
                    <label style={{ fontSize: 9, color: "#6b7280", marginTop: 6, display: "block" }}>Full Statutory Text (collapsed reference)</label>
                    <textarea value={f.fullText} onChange={function (e) { upd("fullText", e.target.value); }} rows={4} style={tStyle} />
                </div>

                {/* Change Tags */}
                <div style={secStyle}>
                    <label style={lStyle}>Change Tags</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {CTAGS.map(function (t) { return <TagChip key={t} t={t} map={TC} onClick={function () { toggleInArr("changeTags", t); }} active={(f.changeTags || []).indexOf(t) >= 0} />; })}
                    </div>
                </div>

                {/* Workflow Tags */}
                <div style={secStyle}>
                    <label style={lStyle}>Workflow Tags</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {WTAGS_DEF.map(function (t) { return <TagChip key={t} t={t} map={WC} onClick={function () { toggleInArr("workflowTags", t); }} active={(f.workflowTags || []).indexOf(t) >= 0} />; })}
                    </div>
                </div>

                {/* Per-Act Old Mappings */}
                <div style={secStyle}>
                    <label style={lStyle}>Per-Act Change Analysis (Repealed Provisions)</label>
                    {(f.oldMappings || []).map(function (m, i) {
                        return (
                            <div key={i} style={{ border: "1px solid #fecaca", borderRadius: 6, padding: 8, marginBottom: 6, background: "#fff5f5" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>Repealed Act #{i + 1}</span>
                                    <button onClick={function () { rmFromArr("oldMappings", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontSize: 10 }}>Remove</button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 4, marginBottom: 4 }}>
                                    <div><label style={{ fontSize: 9, color: "#6b7280" }}>Act Name</label><input value={m.act} onChange={function (e) { updNested("oldMappings", i, "act", e.target.value); }} style={iStyle} /></div>
                                    <div><label style={{ fontSize: 9, color: "#6b7280" }}>Section</label><input value={m.sec} onChange={function (e) { updNested("oldMappings", i, "sec", e.target.value); }} style={iStyle} /></div>
                                </div>
                                <label style={{ fontSize: 9, color: "#6b7280" }}>Summary of old provision</label>
                                <textarea value={m.summary} onChange={function (e) { updNested("oldMappings", i, "summary", e.target.value); }} rows={2} style={iStyle} />
                                <label style={{ fontSize: 9, color: "#6b7280", marginTop: 4, display: "block" }}>Full text (reference)</label>
                                <textarea value={m.fullText} onChange={function (e) { updNested("oldMappings", i, "fullText", e.target.value); }} rows={2} style={tStyle} />
                                <label style={{ fontSize: 9, color: "#6b7280", marginTop: 4, display: "block" }}>What changed vs THIS specific Act</label>
                                <textarea value={m.change} onChange={function (e) { updNested("oldMappings", i, "change", e.target.value); }} rows={2} style={iStyle} />
                                <div style={{ marginTop: 4 }}>
                                    <label style={{ fontSize: 9, color: "#6b7280" }}>Per-Act Change Tags</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                        {CTAGS.map(function (t) { return <TagChip key={t} t={t} map={TC} small onClick={function () { toggleOldMapTag(i, t); }} active={(m.changeTags || []).indexOf(t) >= 0} />; })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("oldMappings", blankOldMapping()); }} style={{ fontSize: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontWeight: 600 }}>+ Add Repealed Act Mapping</button>
                </div>

                {/* Penalty Comparison */}
                <div style={secStyle}>
                    <label style={lStyle}>Penalty Comparison</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Old Penalty</label><textarea value={f.penaltyOld || ""} onChange={function (e) { upd("penaltyOld", e.target.value); }} rows={2} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>New Penalty</label><textarea value={f.penaltyNew || ""} onChange={function (e) { upd("penaltyNew", e.target.value); }} rows={2} style={iStyle} /></div>
                    </div>
                </div>

                {/* Draft Rules + Repealed Rules + Forms */}
                <div style={secStyle}>
                    <label style={lStyle}>Draft Central Rules</label>
                    {(f.draftRules || []).map(function (r, i) {
                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                                <input value={r.ref} onChange={function (e) { updNested("draftRules", i, "ref", e.target.value); }} placeholder="Rule ref" style={Object.assign({}, iStyle, { width: 200 })} />
                                <input value={r.summary} onChange={function (e) { updNested("draftRules", i, "summary", e.target.value); }} placeholder="Summary" style={iStyle} />
                                <button onClick={function () { rmFromArr("draftRules", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "0 6px", cursor: "pointer" }}>✕</button>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("draftRules", { ref: "", summary: "" }); }} style={{ fontSize: 9, background: "#e5e7eb", border: "none", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>+ Add Draft Rule</button>
                </div>

                <div style={secStyle}>
                    <label style={lStyle}>Repealed Central Rules</label>
                    {(f.repealedRules || []).map(function (r, i) {
                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                                <input value={r.ref} onChange={function (e) { updNested("repealedRules", i, "ref", e.target.value); }} placeholder="Repealed rule" style={Object.assign({}, iStyle, { width: 200 })} />
                                <input value={r.summary} onChange={function (e) { updNested("repealedRules", i, "summary", e.target.value); }} placeholder="Summary" style={iStyle} />
                                <button onClick={function () { rmFromArr("repealedRules", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "0 6px", cursor: "pointer" }}>✕</button>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("repealedRules", { ref: "", summary: "" }); }} style={{ fontSize: 9, background: "#e5e7eb", border: "none", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>+ Add Repealed Rule</button>
                </div>

                <div style={secStyle}>
                    <label style={lStyle}>Forms / Registers</label>
                    {(f.forms || []).map(function (r, i) {
                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                                <input value={r.ref} onChange={function (e) { updNested("forms", i, "ref", e.target.value); }} placeholder="Form ref" style={Object.assign({}, iStyle, { width: 200 })} />
                                <input value={r.summary} onChange={function (e) { updNested("forms", i, "summary", e.target.value); }} placeholder="Description" style={iStyle} />
                                <button onClick={function () { rmFromArr("forms", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "0 6px", cursor: "pointer" }}>✕</button>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("forms", { ref: "", summary: "" }); }} style={{ fontSize: 9, background: "#e5e7eb", border: "none", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>+ Add Form/Register</button>
                </div>

                {/* Compliance Items with Assignee + Due Date */}
                <div style={secStyle}>
                    <label style={lStyle}>Compliance Action Items</label>
                    {(f.compItems || []).map(function (c, i) {
                        var item = typeof c === "string" ? { task: c, assignee: "", due: "" } : c;
                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3, alignItems: "center" }}>
                                <input value={item.task || ""} onChange={function (e) { var n = (f.compItems || []).slice(); n[i] = Object.assign({}, item, { task: e.target.value }); upd("compItems", n); }} placeholder="Task" style={iStyle} />
                                <input value={item.assignee || ""} onChange={function (e) { var n = (f.compItems || []).slice(); n[i] = Object.assign({}, item, { assignee: e.target.value }); upd("compItems", n); }} placeholder="Assignee" style={Object.assign({}, iStyle, { width: 100 })} />
                                <input type="date" value={item.due || ""} onChange={function (e) { var n = (f.compItems || []).slice(); n[i] = Object.assign({}, item, { due: e.target.value }); upd("compItems", n); }} style={Object.assign({}, iStyle, { width: 130 })} />
                                <button onClick={function () { rmFromArr("compItems", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "0 6px", cursor: "pointer" }}>✕</button>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("compItems", { task: "", assignee: "", due: "" }); }} style={{ fontSize: 9, background: "#e5e7eb", border: "none", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>+ Add Compliance Item</button>
                </div>

                {/* State-wise: Notes + Rule Text + Compliance */}
                <div style={secStyle}>
                    <label style={lStyle}>State-wise Information</label>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                            <thead>
                                <tr style={{ background: "#f3f4f6" }}>
                                    <th style={{ padding: 4, textAlign: "left", fontWeight: 700 }}>State</th>
                                    <th style={{ padding: 4, textAlign: "left", fontWeight: 700 }}>Notes / Variations</th>
                                    <th style={{ padding: 4, textAlign: "left", fontWeight: 700 }}>State Rule Text</th>
                                    <th style={{ padding: 4, textAlign: "left", fontWeight: 700, width: 100 }}>State Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ST.map(function (s) {
                                    return (
                                        <tr key={s} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                            <td style={{ padding: 4, fontWeight: 600 }}>{s}</td>
                                            <td style={{ padding: 4 }}><input value={(f.stateNotes || {})[s] || ""} onChange={function (e) { upd("stateNotes", Object.assign({}, f.stateNotes || {}, { [s]: e.target.value })); }} style={iStyle} /></td>
                                            <td style={{ padding: 4 }}><input value={(f.stateRuleText || {})[s] || ""} onChange={function (e) { upd("stateRuleText", Object.assign({}, f.stateRuleText || {}, { [s]: e.target.value })); }} style={iStyle} /></td>
                                            <td style={{ padding: 4 }}><select value={(f.stateCompStatus || {})[s] || "Not Started"} onChange={function (e) { upd("stateCompStatus", Object.assign({}, f.stateCompStatus || {}, { [s]: e.target.value })); }} style={iStyle}>{CST.map(function (x) { return <option key={x} value={x}>{x}</option>; })}</select></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Timeline Dates */}
                <div style={secStyle}>
                    <label style={lStyle}>Timeline / Key Dates</label>
                    {(f.timelineDates || []).map(function (d, i) {
                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                                <input type="date" value={d.date || ""} onChange={function (e) { updNested("timelineDates", i, "date", e.target.value); }} style={Object.assign({}, iStyle, { width: 140 })} />
                                <input value={d.label || ""} onChange={function (e) { updNested("timelineDates", i, "label", e.target.value); }} placeholder="What happens on this date" style={iStyle} />
                                <button onClick={function () { rmFromArr("timelineDates", i); }} style={{ background: "#fee2e2", border: "none", borderRadius: 3, padding: "0 6px", cursor: "pointer" }}>✕</button>
                            </div>
                        );
                    })}
                    <button onClick={function () { addToArr("timelineDates", { date: "", label: "" }); }} style={{ fontSize: 9, background: "#e5e7eb", border: "none", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>+ Add Date</button>
                </div>

                {/* Assignee, Due, Notes */}
                <div style={secStyle}>
                    <label style={lStyle}>Metadata</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Overall Assignee</label><input value={f.assignee || ""} onChange={function (e) { upd("assignee", e.target.value); }} style={iStyle} /></div>
                        <div><label style={{ fontSize: 9, color: "#6b7280" }}>Overall Due Date</label><input type="date" value={f.dueDate || ""} onChange={function (e) { upd("dueDate", e.target.value); }} style={iStyle} /></div>
                    </div>
                    <label style={{ fontSize: 9, color: "#6b7280" }}>Internal Notes</label>
                    <textarea value={f.notes || ""} onChange={function (e) { upd("notes", e.target.value); }} rows={2} style={iStyle} />
                </div>

                {/* Save / Cancel */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={function () { onSave(f); }} style={{ padding: "8px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save Provision</button>
                    <button onClick={onCancel} style={{ padding: "8px 24px", background: "#e5e7eb", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

/* ========== MAIN APP ========== */
export default function App() {
    var [provs, setProvs] = useState([
        // ===== CoW =====
        {
            id: "CoW-2y", code: "CoW", ch: "I", chName: "Preliminary", sec: "2", sub: "(y)", title: "Definition — 'wages'", ruleAuth: "Central Government",
            summary: "UNIFIED DEFINITION replacing 4 different definitions. Wages = Basic Pay + DA + Retaining Allowance. Excludes: bonus, HRA, conveyance, OT, commission, gratuity, retrenchment compensation, employer PF/pension. THE 50% RULE: if total exclusions exceed 50% of all remuneration, excess deemed wages. For equal pay & payment of wages: conveyance, HRA, awards, OT are INCLUDED (broader base). Remuneration in kind capped at 15%.",
            fullText: "\"wages\" means all remuneration whether by way of salaries, allowances or otherwise... includes (i) basic pay; (ii) dearness allowance; (iii) retaining allowance, if any, but does not include— (a) bonus not part of employment terms; (b) house-accommodation/amenities; (c) employer PF/pension; (d) conveyance allowance; (e) special expenses; (f) HRA; (g) award/settlement remuneration; (h) OT allowance; (i) commission; (j) gratuity; (k) retrenchment compensation/retirement benefit. Proviso 1: If exclusions (a)-(i) exceed 50% of total remuneration, excess deemed wages. Proviso 2: For equal pay and payment of wages, (d),(f),(g),(h) included. Explanation: Remuneration in kind ≤15% deemed part of wages.",
            oldMappings: [
                { act: "Payment of Wages Act, 1936", sec: "S.2(vi)", summary: "Widest old definition — included all remuneration, OT, most allowances. Excluded bonus, housing, PF, travel, gratuity.", fullText: "\"wages\" means all remuneration expressed in terms of money including overtime wages. Excludes bonus, house accommodation, PF/pension, travel, gratuity.", change: "PoW had widest definition including OT and most allowances. New definition narrows base to Basic+DA+RA but 50% rule prevents gaming. For PAYMENT OF WAGES purposes, Second Proviso adds back conveyance, HRA, awards, OT — partially restoring PoW width.", changeTags: ["Definition changed"] },
                { act: "Minimum Wages Act, 1948", sec: "S.2(h)", summary: "Included HRA explicitly within wages. All remuneration for scheduled employment.", fullText: "\"wages\" means all remuneration capable of being expressed in terms of money. Includes house rent allowance.", change: "HRA was INCLUDED in MW Act wages — now EXCLUDED under S.2(y)(f). For equal pay and payment purposes, HRA added back via Second Proviso. MW computation base may be lower unless 50% rule triggers.", changeTags: ["Definition changed"] },
                { act: "Payment of Bonus Act, 1965", sec: "S.2(21)", summary: "Narrowest definition — only Basic + DA. Used for bonus calculation. Employees earning >₹21,000 excluded.", fullText: "\"salary or wage\" means all remuneration other than overtime. Includes DA.", change: "Bonus Act already used Basic+DA — closest to new definition. 50% anti-avoidance rule means high-allowance structures see excess added to bonus base. Wage thresholds no longer hardcoded — to be notified.", changeTags: ["Definition changed", "Threshold changed"] },
                { act: "Equal Remuneration Act, 1976", sec: "S.2(g)", summary: "Broadest — 'remuneration' meant basic + any additional emoluments whatsoever, cash or kind.", fullText: "\"remuneration\" means basic wage/salary and any additional emoluments whatsoever in cash or kind.", change: "ER Act was broadest. New Code narrows for most purposes but Second Proviso preserves wider base specifically for equal pay. Now gender-neutral, not just men vs women.", changeTags: ["Definition changed", "Coverage expanded"] }
            ], impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material", "Urgent action needed"],
            compItems: [{ task: "Restructure CTC/salary to comply with 50% rule", assignee: "", due: "" }, { task: "Model financial impact — old vs new wage base per statutory purpose", assignee: "", due: "" }, { task: "Recalculate PF, ESI, gratuity, bonus, leave encashment, OT on new base", assignee: "", due: "" }, { task: "Update payroll software with 50% cap logic", assignee: "", due: "" }, { task: "Review all employment contracts and offer letters", assignee: "", due: "" }, { task: "Obtain fresh actuarial valuation for gratuity", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft CoW Rules 2025 — R.3", summary: "Manner of calculating wages by hour/day/month — conversion methodology." }, { ref: "Draft CoW Rules 2025 — R.4", summary: "Norms for MW fixation: 3 consumption units/earner, 2700 cal/day, 66m cloth/family/year, housing 10%, misc 25%." }],
            repealedRules: [{ ref: "MW (Central) Rules, 1950 — R.3-4", summary: "Old consumption norms for MW fixation." }, { ref: "Payment of Bonus Rules, 1975", summary: "Old bonus computation on narrow wage base." }],
            forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
            stateNotes: { Centre: "50% rule is Central — applies uniformly. Draft Rules R.4 prescribes consumption norms.", Delhi: "Historically higher MW — restructuring impact significant.", Karnataka: "IT/ITES sector: significant CTC restructuring expected.", Maharashtra: "Large organised sector — systematic restructuring needed.", "Tamil Nadu": "Manufacturing sector — wage structure review needed.", Telangana: "IT sector Hyderabad — CTC restructuring impact." },
            stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" },
            notes: "Most consequential provision across all 4 Codes. Affects every statutory calculation.", verified: false, pinned: true, assignee: "", dueDate: ""
        },

        {
            id: "CoW-2k", code: "CoW", ch: "I", chName: "Preliminary", sec: "2", sub: "(k)", title: "Definition — 'employee'", ruleAuth: "Appropriate Government",
            summary: "UNIFIED: Any person (except apprentices) employed on wages for skilled, semi-skilled, unskilled, manual, operational, supervisory, managerial, administrative, technical or clerical work. NO WAGE CEILING. Includes persons declared by Govt. Excludes only Armed Forces.",
            fullText: "\"employee\" means any person (other than an apprentice under the Apprentices Act, 1961) employed on wages by an establishment to do any skilled, semi-skilled or unskilled, manual, operational, supervisory, managerial, administrative, technical or clerical work for hire or reward, whether express or implied, and includes a person declared to be an employee by the appropriate Government, but does not include any member of the Armed Forces of the Union.",
            oldMappings: [
                { act: "Payment of Wages Act, 1936", sec: "S.2(vi)", summary: "Limited to persons earning ≤₹24,000/month in factories, railways, notified establishments only.", fullText: "\"employed person\" includes legal representative of deceased. Applied only to wages ≤₹24,000/month.", change: "REMOVED: ₹24,000 wage ceiling. REMOVED: factory/railway/notified establishment restriction. Every employee regardless of salary now covered.", changeTags: ["Threshold changed", "Coverage expanded", "Applicability changed"] },
                { act: "Minimum Wages Act, 1948", sec: "S.2(i)", summary: "Only persons in 'scheduled employment' — listed occupations.", fullText: "\"employee\" means any person employed for hire or reward in a scheduled employment.", change: "REMOVED: scheduled employment limitation. All employees in all occupations now covered for minimum wages.", changeTags: ["Coverage expanded", "Definition changed", "Applicability changed"] },
                { act: "Payment of Bonus Act, 1965", sec: "S.2(13)", summary: "Limited to persons earning ≤₹21,000/month.", fullText: "\"employee\" means any person employed on salary/wage not exceeding ₹21,000 per mensem.", change: "REMOVED: ₹21,000 ceiling (threshold to be notified). Added 'operational' and 'semi-skilled' categories explicitly.", changeTags: ["Threshold changed", "Definition changed"] },
                { act: "Equal Remuneration Act, 1976", sec: "S.2(c)", summary: "Defined by cross-reference. Any person employed for remuneration.", fullText: "Defined by reference to other Acts.", change: "Self-contained definition now. Gender-neutral. Broader work categories enumerated explicitly.", changeTags: ["Definition changed"] }
            ], impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material"],
            compItems: [{ task: "Extend coverage to ALL employees — remove wage ceiling exclusions", assignee: "", due: "" }, { task: "Include supervisory/managerial/administrative in compliance scope", assignee: "", due: "" }, { task: "Map previously excluded worker categories", assignee: "", due: "" }, { task: "Update HRIS to remove wage-ceiling filters", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft CoW Rules 2025 — R.2", summary: "Defines unskilled, semi-skilled, skilled, highly skilled for MW fixation. Defines 'family'." }],
            repealedRules: [{ ref: "MW (Central) Rules, 1950 — R.2", summary: "Old definitions for employees in scheduled employment." }],
            forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [], stateNotes: { Centre: "Universal.", Delhi: "Same.", Karnataka: "Same.", Maharashtra: "Same.", "Tamil Nadu": "Same.", Telangana: "Same." }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
        },

        {
            id: "CoW-17", code: "CoW", ch: "III", chName: "Payment of Wages", sec: "17", sub: "", title: "Time limit for payment of wages", ruleAuth: "Appropriate Government",
            summary: "Specific timelines: Daily — end of shift. Weekly — last working day. Fortnightly — 2nd day after fortnight. Monthly — 7th of succeeding month. ON SEPARATION (removal/dismissal/retrenchment/resignation/closure): within 2 WORKING DAYS. Appropriate Govt may prescribe different limits.",
            fullText: "(1) Employer shall pay wages: (i) daily — end of shift; (ii) weekly — last working day of week; (iii) fortnightly — before end of 2nd day after fortnight; (iv) monthly — before 7th of succeeding month. (2) Where employee removed/dismissed/retrenched/resigned or unemployed due to closure — wages paid within 2 working days. (3) Appropriate Govt may provide other time limit. (4) Does not affect other laws.",
            oldMappings: [
                { act: "Payment of Wages Act, 1936", sec: "S.5", summary: "Monthly: before 7th day (<1000 employees) or 10th day (1000+). Discharged: before next pay day.", fullText: "(1) Wages paid before 7th day (<1000) or 10th day (1000+). (4) Discharged employee: before next pay day or within 2 days, whichever earlier.", change: "2-DAY full & final settlement is TRANSFORMATIONAL — previously could wait until next pay day. No more distinction between <1000 and 1000+ establishments. Monthly timeline standardised at 7th for all.", changeTags: ["Timeline changed", "Procedure changed"] }
            ], impact: "Critical", changeTags: ["Timeline changed", "Procedure changed"], workflowTags: ["Urgent action needed", "Financially material"],
            compItems: [{ task: "Restructure exit process for 2-day full & final settlement", assignee: "", due: "" }, { task: "Automate F&F computation for rapid processing", assignee: "", due: "" }, { task: "Update payroll systems for new timeline", assignee: "", due: "" }, { task: "Review separation/exit policies", assignee: "", due: "" }],
            draftRules: [], repealedRules: [], forms: [], penaltyOld: "Fine up to ₹7,500 (first); ₹22,500 + imprisonment (repeat)", penaltyNew: "Fine ₹50,000 (first); 3 months imprisonment or ₹1 lakh or both (repeat)", timelineDates: [],
            stateNotes: { Centre: "2-day F&F applies universally.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: true, assignee: "", dueDate: ""
        },

        // ===== IRC =====
        {
            id: "IRC-2l", code: "IRC", ch: "I", chName: "Preliminary", sec: "2", sub: "(l)", title: "Definition — 'employee' (replaces 'workman')", ruleAuth: "Not Applicable",
            summary: "'Employee' replaces 'workman'. Includes: manual, unskilled, skilled, technical, operational, supervisory, managerial, administrative, clerical. Supervisory exclusion threshold RAISED from ₹10,000 to ₹18,000/month. Explicitly includes working journalists and sales promotion employees.",
            fullText: "\"employee\" means any person (not being an apprentice) employed on wages in an industry for manual, unskilled, skilled, technical, operational, supervisory, managerial, administrative or clerical work. Excludes: Armed Forces, police, prison officers, managerial/admin capacity, supervisory drawing >₹18,000/month.",
            oldMappings: [
                { act: "Industrial Disputes Act, 1947", sec: "S.2(s) — 'workman'", summary: "'Workman' — manual, unskilled, skilled, technical, operational, clerical. Excluded supervisory >₹10,000/month and all managerial/administrative.", fullText: "\"workman\" means any person employed in any industry to do manual, unskilled, skilled, technical, operational, clerical or supervisory work. Excludes Armed Forces, police, managerial/admin, supervisory >₹10,000.", change: "Terminology: 'workman' replaced by 'employee'. Supervisory exclusion threshold raised ₹10,000→₹18,000. Workers earning ₹10,000-₹18,000 in supervisory roles NOW COVERED. Working journalists and sales promotion employees explicitly included.", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"] }
            ], impact: "Critical", changeTags: ["Definition changed", "Threshold changed", "Coverage expanded"], workflowTags: ["Financially material"],
            compItems: [{ task: "Reclassify supervisory staff ₹10,000-₹18,000 — now covered", assignee: "", due: "" }, { task: "Extend IR protections to newly included employees", assignee: "", due: "" }, { task: "Update workforce databases", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft IR(C) Rules 2025 — R.2", summary: "Defines 'electronically', 'Form', adopts Code meanings." }], repealedRules: [{ ref: "ID (Central) Rules, 1957 — R.2", summary: "Old definitions under ID Act." }], forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
            stateNotes: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
        },

        {
            id: "IRC-77", code: "IRC", ch: "IX", chName: "Lay-off, Retrenchment & Closure", sec: "77", sub: "", title: "Prior permission for lay-off/retrenchment (300+ workers)", ruleAuth: "Appropriate Government",
            summary: "THRESHOLD RAISED: Prior Govt permission for lay-off/retrenchment now required only for 300+ workers (was 100+). Establishments with 100-299 workers: NO prior permission needed — only notice + compensation. Govt may change threshold by notification. Deemed permission if no Govt response in 60 days.",
            fullText: "No employer of an industrial establishment in which 300 or more workers are employed shall lay-off or retrench any worker until prior permission obtained from appropriate Government. Application decided within 60 days — deemed granted if no response.",
            oldMappings: [
                { act: "Industrial Disputes Act, 1947", sec: "S.25M, S.25N", summary: "Prior Govt permission required for establishments with 100+ workers. Made hiring/firing difficult for medium establishments.", fullText: "S.25M: Employer of industrial establishment with ≥100 workmen cannot lay-off without prior permission. S.25N: Same for retrenchment.", change: "THRESHOLD TRIPLED: 100→300 workers. Establishments with 100-299 workers gain significant flexibility — can retrench with just notice + compensation, no Govt approval. 60-day deemed approval prevents bureaucratic delays. Govt can change threshold by notification (could go up or down).", changeTags: ["Threshold changed", "Procedure changed", "Authority changed"] }
            ], impact: "Critical", changeTags: ["Threshold changed", "Procedure changed"], workflowTags: ["Financially material"],
            compItems: [{ task: "Identify establishment size: <100 / 100-299 / 300+", assignee: "", due: "" }, { task: "100-299 workers: update retrenchment SOP — no prior permission needed", assignee: "", due: "" }, { task: "300+: note 60-day deemed approval mechanism", assignee: "", due: "" }, { task: "Reassess workforce restructuring strategies", assignee: "", due: "" }],
            draftRules: [], repealedRules: [{ ref: "ID (Central) Rules, 1957", summary: "Old rules on prior permission for 100+ establishments." }], forms: [], penaltyOld: "Illegal retrenchment: reinstatement + back wages", penaltyNew: "Similar — reinstatement + back wages. Enhanced penalties for non-compliance.", timelineDates: [],
            stateNotes: { Centre: "300 threshold is Central default. States may notify different threshold.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: true, assignee: "", dueDate: ""
        },

        {
            id: "IRC-62", code: "IRC", ch: "VIII", chName: "Strikes & Lock-outs", sec: "62", sub: "", title: "Prohibition of strikes and lock-outs", ruleAuth: "Appropriate Government",
            summary: "14-day advance notice NOW MANDATORY for ALL establishments (was only public utility services). Strike prohibited: without 60-day notice, within 14 days of notice, before specified date, during conciliation/tribunal + 7 days after, during arbitration + 60 days after. Mass casual leave by 50%+ workers = strike.",
            fullText: "No person employed shall go on strike without giving notice within 60 days before striking, within 14 days of giving such notice, before the date of strike specified in the notice, and during any period in which conciliation/tribunal/arbitration proceedings are pending.",
            oldMappings: [
                { act: "Industrial Disputes Act, 1947", sec: "S.22-23", summary: "14 days notice required ONLY in public utility services. Other establishments: strike without notice permitted.", fullText: "S.22: No strike in public utility service without 14 days notice. S.23: No strike during conciliation/adjudication proceedings.", change: "UNIVERSAL NOTICE: 14-day requirement extended from public utilities to ALL industrial establishments. Expanded strike definition includes mass casual leave (50%+ workers). Significant restriction on strike action. Penalty: up to 1 month imprisonment or ₹50,000 or both.", changeTags: ["Applicability changed", "Coverage expanded", "Penalty changed", "Definition changed"] }
            ], impact: "Critical", changeTags: ["Applicability changed", "Coverage expanded", "Penalty changed"], workflowTags: ["Urgent action needed"],
            compItems: [{ task: "Update IR policies — strike notice now universal", assignee: "", due: "" }, { task: "Train management on 14-day notice + cooling period rules", assignee: "", due: "" }, { task: "Monitor mass casual leave patterns as potential illegal strikes", assignee: "", due: "" }, { task: "Establish rapid-response protocol for strike notices", assignee: "", due: "" }],
            draftRules: [], repealedRules: [], forms: [], penaltyOld: "Imprisonment up to 1 month or fine ₹50 or both (public utility only)", penaltyNew: "Imprisonment up to 1 month or fine ₹50,000 or both (ALL establishments)", timelineDates: [],
            stateNotes: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
        },

        // ===== CoSS =====
        {
            id: "CoSS-53", code: "CoSS", ch: "V", chName: "Gratuity", sec: "53", sub: "", title: "Payment of gratuity", ruleAuth: "Appropriate Government",
            summary: "Regular employees: gratuity after 5 years continuous service (same). FIXED TERM EMPLOYEES: eligible for pro-rata gratuity after just 1 YEAR (major change). Calculation: 15 days' wages × years of service — but 'wages' now per new unified definition. Working journalists: 15 days × 3 × years. Gratuity on: termination, superannuation, resignation, death, disablement, FTE contract expiry.",
            fullText: "Gratuity payable to every employee on termination after not less than 5 years continuous service. For fixed-term: payable on a pro-rata basis after completion of one year. Rate: 15 days' wages for every completed year of service or part thereof in excess of six months.",
            oldMappings: [
                { act: "Payment of Gratuity Act, 1972", sec: "S.4", summary: "Gratuity after 5 years continuous service. 15 days' wages (last drawn basic+DA) per year. Max ₹20 lakh. Applied to 10+ employee establishments.", fullText: "S.4: Gratuity payable to every employee after not less than 5 years continuous service at rate of 15 days' wages per completed year. Maximum ₹20 lakh.", change: "FTE GRATUITY after 1 year is transformational — no previous provision. Wage base changes from 'last drawn basic+DA' to new unified definition (50% rule applies). Max limit to be notified (not hardcoded at ₹20 lakh). Draft Rules clarify: performance-linked annual payments NOT included in gratuity wages. Balance sheet impact significant due to wage base change.", changeTags: ["Coverage expanded", "Definition changed", "Threshold changed", "New provision"] }
            ], impact: "Critical", changeTags: ["Coverage expanded", "Definition changed", "Threshold changed", "New provision"], workflowTags: ["Financially material", "Urgent action needed"],
            compItems: [{ task: "Provide pro-rata gratuity for FTE after 1 year", assignee: "", due: "" }, { task: "Recalculate gratuity on new wage definition", assignee: "", due: "" }, { task: "Obtain fresh actuarial valuation", assignee: "", due: "" }, { task: "Update gratuity trust/insurance funding", assignee: "", due: "" }, { task: "Review FTE appointment letters for gratuity terms", assignee: "", due: "" }, { task: "Model balance sheet impact", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft CoSS Rules 2025", summary: "Performance-linked annual payments not part of gratuity wages. Gratuity applies prospectively from 21 Nov 2025." }],
            repealedRules: [{ ref: "PG (Central) Rules, 1972", summary: "Old gratuity computation rules on last-drawn basic+DA." }], forms: [], penaltyOld: "6 months imprisonment or ₹10,000 fine or both", penaltyNew: "Enhanced penalties under unified Code framework", timelineDates: [{ date: "2025-11-21", label: "Gratuity provisions effective — applies prospectively" }],
            stateNotes: { Centre: "Gratuity applies prospectively from 21 Nov 2025.", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "No SS draft rules published.", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: true, assignee: "", dueDate: ""
        },

        {
            id: "CoSS-109", code: "CoSS", ch: "IX", chName: "Unorganised, Gig & Platform Workers", sec: "109-114", sub: "", title: "Social security for gig and platform workers", ruleAuth: "Central Government",
            summary: "TRANSFORMATIONAL: (1) Gig workers and platform workers formally recognized for first time. (2) Central Govt may frame SS schemes for: life/disability insurance, health, maternity, old age, education, housing, food. (3) Aggregators to contribute 1-2% of annual turnover (max 5% of payments to workers). (4) Self-registration on portal. (5) Aadhaar-based identity. (6) Draft Rules prescribe minimum engagement thresholds.",
            fullText: "S.109-114: Central Government may frame welfare schemes for unorganised, gig and platform workers. Aggregators required to contribute 1-2% of annual turnover. National/State Social Security Boards. Workers self-register on designated portal.",
            oldMappings: [
                { act: "Unorganised Workers SS Act, 2008", sec: "S.3-10", summary: "Created National Social Security Board. Provided for life/disability insurance, health/maternity, old age for unorganised workers. Implementation was weak.", fullText: "S.3: National Social Security Board. S.4: State Boards. S.5-7: Registration and record-keeping. S.8-10: Schemes for unorganised workers.", change: "UWSS Act framework STRENGTHENED and MASSIVELY EXPANDED. Gig and platform workers are entirely new categories — no previous coverage. Aggregator contribution (1-2% turnover) is new mandatory obligation. Digital registration replaces paper-based. Aadhaar-linked portability is new.", changeTags: ["New provision", "Coverage expanded", "Definition changed", "Procedure changed"] }
            ], impact: "Critical", changeTags: ["New provision", "Coverage expanded", "Definition changed"], workflowTags: ["Rules pending", "Financially material"],
            compItems: [{ task: "Determine if business qualifies as 'aggregator'", assignee: "", due: "" }, { task: "If aggregator: budget for 1-2% turnover contribution", assignee: "", due: "" }, { task: "Register gig/platform workers on portal", assignee: "", due: "" }, { task: "Track Central scheme notifications", assignee: "", due: "" }, { task: "Monitor eligibility thresholds in final rules", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft CoSS Rules 2025", summary: "Minimum engagement thresholds for gig worker SS eligibility. Registration procedures on Shram Suvidha Portal." }],
            repealedRules: [{ ref: "UWSS Rules, 2009", summary: "Old rules for unorganised worker registration." }], forms: [], penaltyOld: "", penaltyNew: "", timelineDates: [],
            stateNotes: { Centre: "Central schemes to be framed. Portal being set up.", Delhi: "Urban gig economy focus expected.", Karnataka: "Separate Karnataka Gig Workers Act, 2025 enacted — welfare fee notified.", Maharashtra: "Large gig workforce.", "Tamil Nadu": "No SS draft rules published.", Telangana: "Hyderabad gig economy." }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "Karnataka Platform Based Gig Workers (SS & Welfare) Act, 2025", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: true, assignee: "", dueDate: ""
        },

        // ===== OSHW =====
        {
            id: "OSHW-6", code: "OSHW", ch: "II", chName: "Registration & Duties", sec: "6", sub: "", title: "Appointment letters mandatory + employer duties", ruleAuth: "Appropriate Government",
            summary: "MANDATORY appointment letters for ALL employees with prescribed details (name, DOB, nature of employment, wages, social security info etc.) before commencement or within 3 months of rules. Employers must: ensure hazard-free workplace, provide safe systems, free annual health check-ups for employees aged 40+ within 120 days of calendar year.",
            fullText: "Every employer shall issue appointment letter to every employee before commencement of employment containing prescribed particulars. Employer to ensure workplace free from hazards, provide safe work systems, conduct annual health check-ups for employees aged 40+.",
            oldMappings: [
                { act: "Factories Act, 1948", sec: "S.7A, S.11-20", summary: "No mandatory appointment letter. Safety duties were factory-specific: cleanliness, ventilation, temperature, dust/fumes, lighting, drinking water, latrines etc.", fullText: "S.11-20: Cleanliness, disposal of waste, ventilation, temperature, dust and fume, artificial humidification, overcrowding, lighting, drinking water, latrines and urinals, spittoons.", change: "APPOINTMENT LETTER is entirely new statutory requirement — no previous Act mandated it. Health check-ups for 40+ also new. Safety duties consolidated and broadened from factory-specific to all establishments.", changeTags: ["New provision", "Coverage expanded", "Procedure changed"] },
                { act: "Contract Labour (R&A) Act, 1970", sec: "S.7-12", summary: "No appointment letter requirement. Contractor licensing and registration provisions.", fullText: "S.7: Registration of establishments. S.12: Licensing of contractors.", change: "Appointment letters now mandatory for contract labour too. Single pan-India contractor license replaces state-by-state licensing.", changeTags: ["New provision", "Procedure changed"] }
            ], impact: "High", changeTags: ["New provision", "Coverage expanded", "Procedure changed"], workflowTags: ["Urgent action needed"],
            compItems: [{ task: "Issue appointment letters to ALL existing employees within 3 months of rules", assignee: "", due: "" }, { task: "Include prescribed details: name, DOB, wages, SS info, employment nature", assignee: "", due: "" }, { task: "Identify employees aged 40+ for annual health check-ups", assignee: "", due: "" }, { task: "Empanel medical practitioners for health checks", assignee: "", due: "" }, { task: "Schedule check-ups within 120 days of calendar year", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft OSHW Rules 2025", summary: "Appointment letter format prescribed. Health check-up in Form-V. Electronic notice of commencement/cessation in Form-IV within 30 days." }],
            repealedRules: [{ ref: "Factories Act Rules", summary: "Old factory-specific safety provisions." }, { ref: "Contract Labour (Central) Rules, 1971", summary: "Old contractor licensing rules (state-by-state)." }], forms: [{ ref: "Form-IV", summary: "Electronic notice of commencement/cessation of establishment." }, { ref: "Form-V", summary: "Annual health check-up record for employees aged 40+." }], penaltyOld: "", penaltyNew: "Up to ₹2 lakh fine (first); enhanced for repeat", timelineDates: [],
            stateNotes: { Centre: "Appointment letters within 3 months of final rules.", Delhi: "", Karnataka: "IT/ITES: many already issue appointment letters — formal compliance needed.", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
        },

        {
            id: "OSHW-57", code: "OSHW", ch: "VIII", chName: "Contract Labour & Migrant Workers", sec: "57", sub: "", title: "Contract labour in core activities — prohibition", ruleAuth: "Appropriate Government",
            summary: "Contract labour PROHIBITED in core activities of establishment. Exceptions: (1) work customarily done by contractors, (2) does not require full-time workers, (3) temporary increase in workload. Appropriate Govt to define 'core activities'. Regular contractor employees with agreed conditions, increments, SS coverage EXCLUDED from contract labour definition. New: 2% minimum annual increment for regular contractor employees. Pan-India single license for contractors.",
            fullText: "No contract labour shall be employed in core activities. Exceptions: customary contractor work, not requiring full-time, temporary surge. Appropriate Government to define core activities. Contractors may obtain single pan-India license.",
            oldMappings: [
                { act: "Contract Labour (R&A) Act, 1970", sec: "S.10", summary: "Appropriate Govt COULD prohibit contract labour in any process/operation after advisory board recommendation. No concept of 'core activities'.", fullText: "S.10: Appropriate Government may prohibit employment of contract labour in any process, operation or other work in any establishment after consultation with the Board.", change: "Prohibition now AUTOMATIC for core activities (no advisory board needed). 'Core activities' concept is new — to be defined by Govt. Exceptions carved out. Regular contractor employees explicitly excluded from definition. 2% annual increment for regular contractor employees is new. Pan-India single license is major simplification.", changeTags: ["Procedure changed", "Definition changed", "New provision", "Coverage expanded"] }
            ], impact: "Critical", changeTags: ["Procedure changed", "Definition changed", "New provision", "Coverage expanded"], workflowTags: ["Urgent action needed", "Financially material"],
            compItems: [{ task: "Audit ALL contractor engagements against core activity prohibition", assignee: "", due: "" }, { task: "Classify activities as core vs non-core", assignee: "", due: "" }, { task: "Restructure prohibited contract labour arrangements", assignee: "", due: "" }, { task: "Ensure regular contractor employees get 2% annual increment", assignee: "", due: "" }, { task: "Contractors: apply for single pan-India license", assignee: "", due: "" }],
            draftRules: [{ ref: "Draft OSHW Rules 2025", summary: "Single license for contractors across states. Principal employer responsible for basic on-premises facilities." }],
            repealedRules: [{ ref: "Contract Labour (Central) Rules, 1971", summary: "Old state-by-state licensing. No core activity concept." }], forms: [], penaltyOld: "Imprisonment up to 3 months or fine up to ₹1,000", penaltyNew: "Enhanced penalties under OSHW Code", timelineDates: [],
            stateNotes: { Centre: "Core activities to be defined by notification.", Delhi: "Significant contract labour economy.", Karnataka: "IT/ITES sector exemptions expected.", Maharashtra: "Large manufacturing — significant impact.", "Tamil Nadu": "Manufacturing hub — compliance impact.", Telangana: "IT sector considerations." }, stateRuleText: { Centre: "", Delhi: "", Karnataka: "", Maharashtra: "", "Tamil Nadu": "", Telangana: "" }, stateCompStatus: { Centre: "Not Started", Delhi: "Not Started", Karnataka: "Not Started", Maharashtra: "Not Started", "Tamil Nadu": "Not Started", Telangana: "Not Started" }, notes: "", verified: false, pinned: true, assignee: "", dueDate: ""
        }
    ]);
    var [compSt, setCompSt] = useState({});
    var [loading, setLoading] = useState(true);
    var [mode, setMode] = useState("read");
    var [pwOk, setPwOk] = useState(false);
    var [pwInput, setPwInput] = useState("");
    var [editorPw, setEditorPw] = useState("");
    var [view, setView] = useState("mapping");
    var [code, setCode] = useState("CoW");
    var [search, setSearch] = useState("");
    var [sevF, setSevF] = useState("All");
    var [tagF, setTagF] = useState("All");
    var [wfF, setWfF] = useState("All");
    var [raF, setRaF] = useState("All");
    var [stF, setStF] = useState("All");
    var [chF, setChF] = useState("All");
    var [expId, setExpId] = useState(null);
    var [editForm, setEditForm] = useState(null);
    var [showText, setShowText] = useState({});
    var [compareA, setCompareA] = useState(null);
    var [compareB, setCompareB] = useState(null);
    var [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(function () {
        ld(SK).then(function (d) {
            if (d) {
                if (d.provs) setProvs(d.provs);
                if (d.compSt) setCompSt(d.compSt);
                if (d.editorPw) setEditorPw(d.editorPw);
            }
            setLoading(false);
        });
    }, []);

    useEffect(function () {
        if (loading) return;
        var t = setTimeout(function () { sv(SK, { provs: provs, compSt: compSt, editorPw: editorPw }); }, 1500);
        return function () { clearTimeout(t); };
    }, [provs, compSt, editorPw, loading]);

    var setCS = useCallback(function (id, v) { setCompSt(function (p) { return Object.assign({}, p, { [id]: v }); }); }, []);
    var togText = useCallback(function (k) { setShowText(function (p) { return Object.assign({}, p, { [k]: !p[k] }); }); }, []);

    var cObj = CODES[code];

    var filtered = useMemo(function () {
        var p = provs.filter(function (x) { return x.code === code; });
        if (sevF !== "All") p = p.filter(function (x) { return x.impact === sevF; });
        if (tagF !== "All") p = p.filter(function (x) { return (x.changeTags || []).indexOf(tagF) >= 0; });
        if (wfF !== "All") p = p.filter(function (x) { return (x.workflowTags || []).indexOf(wfF) >= 0; });
        if (raF !== "All") p = p.filter(function (x) { return x.ruleAuth === raF; });
        if (chF !== "All") p = p.filter(function (x) { return x.ch === chF; });
        if (stF !== "All") p = p.filter(function (x) { return (x.stateNotes || {})[stF] || (x.stateRuleText || {})[stF]; });
        if (search) {
            var s = search.toLowerCase();
            p = p.filter(function (x) {
                return x.title.toLowerCase().indexOf(s) >= 0 || x.sec.toLowerCase().indexOf(s) >= 0 || (x.sub || "").toLowerCase().indexOf(s) >= 0 || x.summary.toLowerCase().indexOf(s) >= 0 || (x.oldMappings || []).some(function (m) { return m.act.toLowerCase().indexOf(s) >= 0 || m.summary.toLowerCase().indexOf(s) >= 0 || m.change.toLowerCase().indexOf(s) >= 0; }) || (x.compItems || []).some(function (c) { var t = typeof c === "string" ? c : c.task || ""; return t.toLowerCase().indexOf(s) >= 0; });
            });
        }
        return p;
    }, [provs, code, sevF, tagF, wfF, raF, stF, chF, search]);

    var chapters = useMemo(function () {
        var m = {};
        filtered.forEach(function (p) { if (!m[p.ch]) m[p.ch] = { name: p.chName, items: [] }; m[p.ch].items.push(p); });
        return Object.entries(m).sort(function (a, b) { return (parseInt(a[0]) || 999) - (parseInt(b[0]) || 999); });
    }, [filtered]);

    var allChapters = useMemo(function () {
        var m = {};
        provs.filter(function (x) { return x.code === code; }).forEach(function (p) { if (!m[p.ch]) m[p.ch] = p.chName; });
        return Object.entries(m);
    }, [provs, code]);

    var stats = useMemo(function () {
        var all = provs.filter(function (x) { return x.code === code; });
        var tc = 0, c = 0, ip = 0, na = 0;
        all.forEach(function (p) { (p.compItems || []).forEach(function (_, j) { tc++; var s = compSt[p.id + "-" + j]; if (s === "Compliant") c++; else if (s === "In Progress") ip++; else if (s === "N/A") na++; }); });
        return { total: all.length, ct: tc, c: c, ip: ip, na: na, ns: tc - c - ip - na, ver: all.filter(function (x) { return x.verified; }).length, pinned: all.filter(function (x) { return x.pinned; }).length };
    }, [provs, compSt, code]);

    function saveP(p) {
        setProvs(function (prev) {
            var i = prev.findIndex(function (x) { return x.id === p.id; });
            if (i >= 0) { var n = prev.slice(); n[i] = p; return n; }
            return prev.concat([p]);
        });
        setEditForm(null);
    }
    function delP(id) { if (confirm("Delete this provision?")) setProvs(function (p) { return p.filter(function (x) { return x.id !== id; }); }); }
    function togPin(id) { setProvs(function (p) { return p.map(function (x) { return x.id === id ? Object.assign({}, x, { pinned: !x.pinned }) : x; }); }); }
    function togVerify(id) { setProvs(function (p) { return p.map(function (x) { return x.id === id ? Object.assign({}, x, { verified: !x.verified }) : x; }); }); }

    var canEdit = mode === "admin" && (!editorPw || pwOk);

    if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui" }}>Loading...</div>;

    return (
        <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", maxWidth: 1200, margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

            {/* EDITOR MODAL */}
            {editForm && <EditorModal prov={editForm} onSave={saveP} onCancel={function () { setEditForm(null); }} codeKey={code} />}

            {/* HEADER */}
            <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "14px 20px", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>India Labour Code Reform</h1>
                        <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.75 }}>Complete Legal Intelligence · 4 Codes · 29 Repealed Acts · Per-Act Analysis · 6 Jurisdictions</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {mode === "admin" && editorPw && !pwOk && (
                            <div style={{ display: "flex", gap: 4 }}>
                                <input type="password" value={pwInput} onChange={function (e) { setPwInput(e.target.value); }} placeholder="Editor password" style={{ padding: "4px 8px", borderRadius: 4, border: "none", fontSize: 10, width: 120 }} />
                                <button onClick={function () { if (pwInput === editorPw) setPwOk(true); else alert("Wrong password"); }} style={{ padding: "4px 10px", background: "#f59e0b", border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Unlock</button>
                            </div>
                        )}
                        <button onClick={function () { setMode(mode === "read" ? "admin" : "read"); setPwOk(false); setPwInput(""); }} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(255,255,255,.3)", background: mode === "admin" ? "#f59e0b" : "rgba(255,255,255,.1)", color: mode === "admin" ? "#000" : "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                            {mode === "admin" ? "✎ EDITOR" : "👁 READER"}
                        </button>
                        <button onClick={function () { setSidebarOpen(!sidebarOpen); }} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 10, cursor: "pointer" }}>☰</button>
                    </div>
                </div>
            </div>

            {/* NAV */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 10, overflowX: "auto" }}>
                {[["mapping", "Mapping"], ["dashboard", "Dashboard"], ["stateTracker", "States"], ["timeline", "Timeline"], ["penalties", "Penalties"], ["compare", "Compare"]].map(function (vl) {
                    return <button key={vl[0]} onClick={function () { setView(vl[0]); }} style={{ padding: "7px 14px", border: "none", borderBottom: view === vl[0] ? "2px solid #1e3a5f" : "2px solid transparent", background: view === vl[0] ? "#e8eef5" : "transparent", color: view === vl[0] ? "#1e3a5f" : "#6b7280", fontWeight: view === vl[0] ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>{vl[1]}</button>;
                })}
                <div style={{ flex: 1 }} />
                {Object.entries(CODES).map(function (kv) {
                    return <button key={kv[0]} onClick={function () { setCode(kv[0]); setExpId(null); setChF("All"); }} style={{ padding: "7px 12px", border: "none", borderBottom: code === kv[0] ? "2px solid " + kv[1].c : "2px solid transparent", background: code === kv[0] ? kv[1].bg : "transparent", color: code === kv[0] ? kv[1].c : "#9ca3af", fontWeight: code === kv[0] ? 700 : 500, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>{kv[1].s}</button>;
                })}
            </div>

            <div style={{ display: "flex" }}>
                {/* SIDEBAR */}
                {sidebarOpen && (
                    <div style={{ width: 200, borderRight: "1px solid #e5e7eb", padding: "8px 10px", background: "#fafafa", flexShrink: 0, maxHeight: "80vh", overflow: "auto" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, color: cObj.c }}>Chapters — {cObj.s}</div>
                        <button onClick={function () { setChF("All"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "3px 6px", background: chF === "All" ? cObj.bg : "transparent", border: "none", borderRadius: 3, fontSize: 10, cursor: "pointer", color: chF === "All" ? cObj.c : "#374151", fontWeight: chF === "All" ? 700 : 400, marginBottom: 2 }}>All Chapters</button>
                        {allChapters.map(function (kv) {
                            return <button key={kv[0]} onClick={function () { setChF(kv[0]); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "3px 6px", background: chF === kv[0] ? cObj.bg : "transparent", border: "none", borderRadius: 3, fontSize: 10, cursor: "pointer", color: chF === kv[0] ? cObj.c : "#374151", fontWeight: chF === kv[0] ? 700 : 400, marginBottom: 2 }}>Ch {kv[0]}: {kv[1]}</button>;
                        })}
                        <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Pinned</div>
                            {provs.filter(function (x) { return x.code === code && x.pinned; }).map(function (p) {
                                return <button key={p.id} onClick={function () { setExpId(p.id); setChF("All"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "2px 6px", background: "transparent", border: "none", fontSize: 9, cursor: "pointer", color: cObj.c, marginBottom: 1 }}>S.{p.sec}{p.sub} {p.title}</button>;
                            })}
                            {provs.filter(function (x) { return x.code === code && x.pinned; }).length === 0 && <div style={{ fontSize: 9, color: "#9ca3af" }}>No pins yet</div>}
                        </div>
                        {canEdit && (
                            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Editor Password</div>
                                <input value={editorPw} onChange={function (e) { setEditorPw(e.target.value); }} placeholder="Set password (blank=none)" style={{ width: "100%", padding: "3px 6px", border: "1px solid #d1d5db", borderRadius: 3, fontSize: 10 }} />
                            </div>
                        )}
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, padding: "10px 16px", overflow: "auto" }}>

                    {/* ===== DASHBOARD ===== */}
                    {view === "dashboard" && (
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Dashboard — {cObj.n}</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
                                {[["Provisions", stats.total, cObj.c], ["Verified", stats.ver, "#059669"], ["Compliance Items", stats.ct, "#374151"], ["Compliant", stats.c, "#10b981"], ["In Progress", stats.ip, "#f59e0b"], ["Not Started", stats.ns, "#6b7280"]].map(function (r) {
                                    return <div key={r[0]} style={{ padding: 10, background: "#f9fafb", borderRadius: 8, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: r[2] }}>{r[1]}</div><div style={{ fontSize: 10, color: "#6b7280" }}>{r[0]}</div></div>;
                                })}
                            </div>
                            <Prog val={stats.c + stats.na} max={stats.ct} />
                            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "16px 0 8px" }}>All Codes Overview</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
                                {Object.entries(CODES).map(function (kv) {
                                    var k = kv[0], c = kv[1];
                                    var a = provs.filter(function (x) { return x.code === k; });
                                    return <div key={k} onClick={function () { setCode(k); setView("mapping"); }} style={{ border: "1px solid " + c.c + "30", borderRadius: 8, padding: 12, background: c.bg, cursor: "pointer" }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: c.c }}>{c.s}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, margin: "2px 0" }}>{c.n}</div>
                                        <div style={{ fontSize: 10, color: "#6b7280" }}>{c.secs} Sections · {c.acts.length} Acts · Mapped: {a.length}</div>
                                    </div>;
                                })}
                            </div>

                        </div>
                    )}

                    {/* ===== STATE TRACKER ===== */}
                    {view === "stateTracker" && (
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: cObj.c }}>{cObj.n} — State Tracker</h2>
                            <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 12px" }}>Each state may amend Central provisions. Track state-specific rules, variations, and compliance status below.</p>
                            {provs.filter(function (x) { return x.code === code; }).filter(function (p) { return ST.some(function (s) { return (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]; }); }).map(function (p) {
                                return (
                                    <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 6, padding: "8px 10px" }}>
                                        <div style={{ fontWeight: 700, fontSize: 12, color: cObj.c }}>S.{p.sec}{p.sub} — {p.title}</div>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginTop: 4 }}>
                                            <tbody>
                                                {ST.filter(function (s) { return (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]; }).map(function (s) {
                                                    return (
                                                        <tr key={s} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                            <td style={{ padding: "3px 6px", fontWeight: 600, width: 90 }}>{s}</td>
                                                            <td style={{ padding: "3px 6px" }}>{(p.stateNotes || {})[s]}</td>
                                                            <td style={{ padding: "3px 6px", fontStyle: "italic", color: "#6b7280" }}>{(p.stateRuleText || {})[s]}</td>
                                                            <td style={{ padding: "3px 6px", width: 80 }}><Badge text={(p.stateCompStatus || {})[s] || "Not Started"} bg={(p.stateCompStatus || {})[s] === "Compliant" ? "#d1fae5" : "#fef3c7"} color={(p.stateCompStatus || {})[s] === "Compliant" ? "#065f46" : "#92400e"} /></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ===== TIMELINE ===== */}
                    {view === "timeline" && (
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Timeline — Key Dates</h2>
                            {provs.filter(function (x) { return x.code === code && (x.timelineDates || []).length > 0; }).flatMap(function (p) { return (p.timelineDates || []).map(function (d) { return { date: d.date, label: d.label, sec: p.sec, sub: p.sub, title: p.title, id: p.id }; }); }).sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); }).map(function (d, i) {
                                return (
                                    <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                                        <div style={{ fontWeight: 700, fontSize: 11, color: cObj.c, minWidth: 90 }}>{d.date || "TBD"}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600 }}>{d.label}</div>
                                            <div style={{ fontSize: 10, color: "#6b7280" }}>S.{d.sec}{d.sub} — {d.title}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {provs.filter(function (x) { return x.code === code && (x.timelineDates || []).length > 0; }).length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No timeline dates added yet. Add dates via the editor.</div>}
                        </div>
                    )}

                    {/* ===== PENALTIES ===== */}
                    {view === "penalties" && (
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Penalty Comparison — {cObj.s}</h2>
                            {provs.filter(function (x) { return x.code === code && (x.penaltyOld || x.penaltyNew); }).map(function (p) {
                                return (
                                    <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 6, overflow: "hidden" }}>
                                        <div style={{ padding: "6px 10px", background: "#f9fafb", fontWeight: 700, fontSize: 12, color: cObj.c }}>S.{p.sec}{p.sub} — {p.title}</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #e5e7eb" }}>
                                            <div style={{ padding: 8, borderRight: "1px solid #e5e7eb", background: "#fef2f2" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", marginBottom: 3 }}>OLD PENALTY</div><div style={{ fontSize: 11, color: "#374151" }}>{p.penaltyOld || "—"}</div></div>
                                            <div style={{ padding: 8, background: "#f0fdf4" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 3 }}>NEW PENALTY</div><div style={{ fontSize: 11, color: "#374151" }}>{p.penaltyNew || "—"}</div></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {provs.filter(function (x) { return x.code === code && (x.penaltyOld || x.penaltyNew); }).length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No penalty data added yet.</div>}
                        </div>
                    )}

                    {/* ===== COMPARE ===== */}
                    {view === "compare" && (
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Compare Provisions</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                <select value={compareA || ""} onChange={function (e) { setCompareA(e.target.value || null); }} style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 11 }}>
                                    <option value="">Select provision A</option>
                                    {provs.filter(function (x) { return x.code === code; }).map(function (p) { return <option key={p.id} value={p.id}>S.{p.sec}{p.sub} — {p.title}</option>; })}
                                </select>
                                <select value={compareB || ""} onChange={function (e) { setCompareB(e.target.value || null); }} style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 11 }}>
                                    <option value="">Select provision B</option>
                                    {provs.filter(function (x) { return x.code === code; }).map(function (p) { return <option key={p.id} value={p.id}>S.{p.sec}{p.sub} — {p.title}</option>; })}
                                </select>
                            </div>
                            {compareA && compareB && (function () {
                                var a = provs.find(function (x) { return x.id === compareA; });
                                var b = provs.find(function (x) { return x.id === compareB; });
                                if (!a || !b) return <div style={{ color: "#9ca3af" }}>Select two provisions to compare.</div>;
                                return (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        {[a, b].map(function (p) {
                                            return (
                                                <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: cObj.c, marginBottom: 4 }}>S.{p.sec}{p.sub} — {p.title}</div>
                                                    <Badge text={p.impact} bg={IC[p.impact]} />
                                                    <Badge text={p.ruleAuth} bg="#6b7280" />
                                                    <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>{p.summary}</div>
                                                    <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700 }}>Old Mappings: {(p.oldMappings || []).length}</div>
                                                    <div style={{ fontSize: 10, fontWeight: 700 }}>Compliance Items: {(p.compItems || []).length}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* ===== MAPPING (MAIN VIEW) ===== */}
                    {view === "mapping" && (
                        <div>
                            {/* Filters */}
                            <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap", alignItems: "center", fontSize: 10, color: "#6b7280" }}>
                                <span><b>{cObj.secs}</b> sections</span>
                                <span>·</span>
                                <span><b>{stats.total}</b> mapped</span>
                                <span>·</span>
                                <span style={{ color: stats.ver === stats.total && stats.total > 0 ? "#059669" : "#9ca3af" }}><b>{stats.ver}</b> verified</span>
                                <span>·</span>
                                <span>Compliance: <b style={{ color: "#10b981" }}>{stats.c}✓</b> <b style={{ color: "#f59e0b" }}>{stats.ip}◑</b> <b style={{ color: "#6b7280" }}>{stats.ns}○</b></span>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <input type="text" placeholder="Search everything..." value={search} onChange={function (e) { setSearch(e.target.value); }} style={{ flex: 1, minWidth: 150, padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }} />
                                <select value={sevF} onChange={function (e) { setSevF(e.target.value); }} style={{ padding: "5px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }}><option value="All">Impact</option>{IMP.map(function (i) { return <option key={i} value={i}>{i}</option>; })}</select>
                                <select value={tagF} onChange={function (e) { setTagF(e.target.value); }} style={{ padding: "5px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }}><option value="All">Change Tag</option>{CTAGS.map(function (t) { return <option key={t} value={t}>{t}</option>; })}</select>
                                <select value={wfF} onChange={function (e) { setWfF(e.target.value); }} style={{ padding: "5px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }}><option value="All">Workflow</option>{WTAGS_DEF.map(function (t) { return <option key={t} value={t}>{t}</option>; })}</select>
                                <select value={raF} onChange={function (e) { setRaF(e.target.value); }} style={{ padding: "5px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }}><option value="All">Authority</option>{RA.map(function (r) { return <option key={r} value={r}>{r}</option>; })}</select>
                                <select value={stF} onChange={function (e) { setStF(e.target.value); }} style={{ padding: "5px 6px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 10 }}><option value="All">State</option>{ST.map(function (s) { return <option key={s} value={s}>{s}</option>; })}</select>
                                {canEdit && <button onClick={function () { setEditForm(blankProv(code)); }} style={{ padding: "5px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>+ Add Provision</button>}
                                <button onClick={function () { window.print(); }} style={{ padding: "5px 10px", background: "#e5e7eb", border: "none", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>🖨 Print</button>
                            </div>

                            {/* Provisions */}
                            {chapters.length === 0 && !editForm && <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}><div style={{ fontSize: 14, marginBottom: 8 }}>No provisions mapped for {cObj.s} yet.</div>{canEdit && <button onClick={function () { setEditForm(blankProv(code)); }} style={{ padding: "8px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add First Provision</button>}</div>}
                            {chapters.map(function (kv) {
                                var chN = kv[0], ch = kv[1];
                                return (
                                    <details key={chN} open={chapters.length <= 5}>
                                        <summary style={{ padding: "6px 0", fontSize: 12, fontWeight: 700, color: cObj.c, cursor: "pointer" }}>Chapter {chN}: {ch.name} <span style={{ fontWeight: 400, fontSize: 10, color: "#6b7280" }}>({ch.items.length})</span></summary>
                                        {ch.items.map(function (p) {
                                            var isExp = expId === p.id;
                                            return (
                                                <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 5, borderLeft: "4px solid " + IC[p.impact], overflow: "hidden" }}>
                                                    <button onClick={function () { setExpId(isExp ? null : p.id); }} style={{ width: "100%", display: "flex", alignItems: "center", padding: "6px 8px", border: "none", background: isExp ? "#f9fafb" : "#fff", cursor: "pointer", textAlign: "left", gap: 6 }}>
                                                        {p.pinned && <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>}
                                                        <span style={{ fontWeight: 700, fontSize: 11, color: cObj.c, minWidth: 55 }}>S.{p.sec}{p.sub}</span>
                                                        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#1f2937" }}>{p.title}</span>
                                                        {p.verified && <Badge text="✓" bg="#d1fae5" color="#065f46" />}
                                                        {(p.workflowTags || []).filter(function (t) { return t !== "Verified"; }).slice(0, 2).map(function (t) { return <Badge key={t} text={t} bg={WC[t]} />; })}
                                                        <Badge text={(p.ruleAuth || "").split(" ")[0]} bg="#e5e7eb" color="#374151" />
                                                        <Badge text={p.impact} bg={IC[p.impact]} />
                                                        <span style={{ fontSize: 9, color: "#9ca3af" }}>{isExp ? "▲" : "▼"}</span>
                                                    </button>

                                                    {isExp && (
                                                        <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb" }}>
                                                            {/* Admin */}
                                                            {canEdit && (
                                                                <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                                                                    <button onClick={function () { setEditForm(JSON.parse(JSON.stringify(p))); }} style={{ fontSize: 10, padding: "3px 10px", background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>✎ Edit</button>
                                                                    <button onClick={function () { togVerify(p.id); }} style={{ fontSize: 10, padding: "3px 10px", background: p.verified ? "#d1fae5" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}>{p.verified ? "✓ Verified" : "Verify"}</button>
                                                                    <button onClick={function () { togPin(p.id); }} style={{ fontSize: 10, padding: "3px 10px", background: p.pinned ? "#fef3c7" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}>{p.pinned ? "★ Pinned" : "Pin"}</button>
                                                                    <button onClick={function () { delP(p.id); }} style={{ fontSize: 10, padding: "3px 10px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, cursor: "pointer", marginLeft: "auto" }}>Delete</button>
                                                                </div>
                                                            )}

                                                            {/* Tags */}
                                                            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 6 }}>
                                                                {(p.changeTags || []).map(function (t) { return <Badge key={"c" + t} text={t} bg={TC[t]} />; })}
                                                                {(p.workflowTags || []).map(function (t) { return <Badge key={"w" + t} text={t} bg={WC[t]} />; })}
                                                            </div>

                                                            {/* Summary */}
                                                            <div style={{ padding: 8, background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0", marginBottom: 8 }}>
                                                                <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", textTransform: "uppercase", marginBottom: 3 }}>{cObj.s} S.{p.sec}{p.sub} — Summary</div>
                                                                <div style={{ fontSize: 11, color: "#1f2937", lineHeight: 1.6 }}>{p.summary}</div>
                                                                <button onClick={function () { togText("n-" + p.id); }} style={{ fontSize: 9, color: "#059669", background: "none", border: "none", cursor: "pointer", marginTop: 4, textDecoration: "underline" }}>{showText["n-" + p.id] ? "Hide" : "Show"} full statutory text</button>
                                                                {showText["n-" + p.id] && <pre style={{ fontSize: 10, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "Georgia,serif", lineHeight: 1.5, margin: "4px 0 0", padding: 6, background: "#ecfdf5", borderRadius: 4, maxHeight: 300, overflow: "auto" }}>{p.fullText}</pre>}
                                                            </div>

                                                            {/* Per-Act */}
                                                            {(p.oldMappings || []).length > 0 && (
                                                                <div style={{ marginBottom: 8 }}>
                                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", marginBottom: 4 }}>PER-ACT CHANGE ANALYSIS ({(p.oldMappings || []).length})</div>
                                                                    {(p.oldMappings || []).map(function (m, i) {
                                                                        return (
                                                                            <div key={i} style={{ border: "1px solid #fecaca", borderRadius: 6, marginBottom: 4, overflow: "hidden" }}>
                                                                                <div style={{ padding: "6px 8px", background: "#fef2f2" }}>
                                                                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>✕ {m.act} — {m.sec}</div>
                                                                                    <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{m.summary}</div>
                                                                                    <button onClick={function () { togText("o-" + p.id + "-" + i); }} style={{ fontSize: 8, color: "#dc2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: 2 }}>{showText["o-" + p.id + "-" + i] ? "Hide" : "Show"} full text</button>
                                                                                    {showText["o-" + p.id + "-" + i] && <pre style={{ fontSize: 9, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "Georgia,serif", lineHeight: 1.4, margin: "4px 0 0", padding: 4, background: "#fff5f5", borderRadius: 3, maxHeight: 200, overflow: "auto" }}>{m.fullText}</pre>}
                                                                                </div>
                                                                                <div style={{ padding: "6px 8px" }}>
                                                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#2563eb", marginBottom: 2 }}>WHAT CHANGED (vs this Act):</div>
                                                                                    <div style={{ fontSize: 10, color: "#1f2937", lineHeight: 1.5 }}>{m.change}</div>
                                                                                    {(m.changeTags || []).length > 0 && <div style={{ marginTop: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>{(m.changeTags || []).map(function (t) { return <Badge key={t} text={t} bg={TC[t]} />; })}</div>}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Penalty */}
                                                            {(p.penaltyOld || p.penaltyNew) && (
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                                                                    <div style={{ padding: 6, background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#dc2626" }}>OLD PENALTY</div><div style={{ fontSize: 10, marginTop: 2 }}>{p.penaltyOld || "—"}</div></div>
                                                                    <div style={{ padding: 6, background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#059669" }}>NEW PENALTY</div><div style={{ fontSize: 10, marginTop: 2 }}>{p.penaltyNew || "—"}</div></div>
                                                                </div>
                                                            )}

                                                            {/* Draft + Repealed Rules + Forms */}
                                                            {((p.draftRules || []).length > 0 || (p.repealedRules || []).length > 0 || (p.forms || []).length > 0) && (
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                                                                    {(p.draftRules || []).length > 0 && <div style={{ padding: 6, background: "#fefce8", borderRadius: 6, border: "1px solid #fde68a" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#a16207", marginBottom: 3 }}>DRAFT CENTRAL RULES</div>{(p.draftRules || []).map(function (r, i) { return <div key={i} style={{ fontSize: 10, marginBottom: 2 }}><b style={{ color: "#92400e" }}>{r.ref}</b><br />{r.summary}</div>; })}</div>}
                                                                    {(p.repealedRules || []).length > 0 && <div style={{ padding: 6, background: "#fdf2f8", borderRadius: 6, border: "1px solid #f9a8d4" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#9d174d", marginBottom: 3 }}>REPEALED RULES</div>{(p.repealedRules || []).map(function (r, i) { return <div key={i} style={{ fontSize: 10, marginBottom: 2 }}><b style={{ color: "#9d174d" }}>✕ {r.ref}</b><br />{r.summary}</div>; })}</div>}
                                                                    {(p.forms || []).length > 0 && <div style={{ padding: 6, background: "#f0f9ff", borderRadius: 6, border: "1px solid #bae6fd" }}><div style={{ fontSize: 9, fontWeight: 700, color: "#0369a1", marginBottom: 3 }}>FORMS / REGISTERS</div>{(p.forms || []).map(function (r, i) { return <div key={i} style={{ fontSize: 10, marginBottom: 2 }}><b style={{ color: "#0369a1" }}>{r.ref}</b><br />{r.summary}</div>; })}</div>}
                                                                </div>
                                                            )}

                                                            {/* State Notes */}
                                                            {ST.some(function (s) { return (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]; }) && (
                                                                <details style={{ marginBottom: 8 }}>
                                                                    <summary style={{ fontSize: 9, fontWeight: 700, cursor: "pointer", color: "#7c3aed" }}>State-wise Notes (states may amend Central provisions)</summary>
                                                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginTop: 4 }}>
                                                                        <tbody>{ST.filter(function (s) { return (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]; }).map(function (s) {
                                                                            return <tr key={s} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                                                <td style={{ padding: "2px 6px", fontWeight: 600, width: 80 }}>{s}</td>
                                                                                <td style={{ padding: "2px 6px" }}>{(p.stateNotes || {})[s]}</td>
                                                                                <td style={{ padding: "2px 6px", fontStyle: "italic", color: "#6b7280" }}>{(p.stateRuleText || {})[s]}</td>
                                                                            </tr>;
                                                                        })}</tbody>
                                                                    </table>
                                                                </details>
                                                            )}

                                                            {/* Notes */}
                                                            {p.notes && <div style={{ marginBottom: 6, padding: 4, background: "#faf5ff", borderRadius: 4, fontSize: 10, color: "#6b21a8" }}><b>Notes:</b> {p.notes}</div>}
                                                            {(p.assignee || p.dueDate) && <div style={{ marginBottom: 6, fontSize: 10, color: "#6b7280" }}>{p.assignee && <span><b>Assignee:</b> {p.assignee} </span>}{p.dueDate && <span><b>Due:</b> {p.dueDate}</span>}</div>}

                                                            {/* Compliance */}
                                                            {(p.compItems || []).length > 0 && (
                                                                <div>
                                                                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 3 }}>COMPLIANCE ({(p.compItems || []).length})</div>
                                                                    {(p.compItems || []).map(function (c, j) {
                                                                        var item = typeof c === "string" ? { task: c, assignee: "", due: "" } : c;
                                                                        var cid = p.id + "-" + j;
                                                                        var st = compSt[cid] || "Not Started";
                                                                        return (
                                                                            <div key={j} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 0", borderBottom: "1px solid #f3f4f6", fontSize: 10 }}>
                                                                                <select value={st} onChange={function (e) { setCS(cid, e.target.value); }} style={{ padding: "1px 3px", border: "1px solid #d1d5db", borderRadius: 3, fontSize: 9, minWidth: 80, background: st === "Compliant" ? "#d1fae5" : st === "In Progress" ? "#fef3c7" : "#fff" }}>{CST.map(function (s) { return <option key={s} value={s}>{s}</option>; })}</select>
                                                                                <span style={{ flex: 1, color: "#374151" }}>{item.task || item}</span>
                                                                                {item.assignee && <span style={{ fontSize: 9, color: "#6b7280" }}>@{item.assignee}</span>}
                                                                                {item.due && <span style={{ fontSize: 9, color: "#6b7280" }}>{item.due}</span>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </details>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: "8px 16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 8, color: "#9ca3af", textAlign: "center" }}>
                Auto-saves · States may amend Central provisions — verify state rules · Not legal advice · Data as of March 2026
            </div>
        </div>
    );
}
