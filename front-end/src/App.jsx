import { useState, useRef } from "react";
import { APP_CONFIG, MOCK_NURSES, MOCK_POOL, MOCK_WEEK_DATA, MOCK_MY_SHIFTS } from "./data";
import "./index.css";

// --- COMPONENTES AUXILIARES DE UI ---
function ReadinessBar({ value, width }) {
  const color = value > 60 ? "#006035" : value > 30 ? "#d97706" : "#dc2626";
  return (
    <div style={{ width: width || "100%" }}>
      <div className="fatigue-track">
        <div className="fatigue-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function ScoreDots({ score, max = 5 }) {
  return (
    <div className="score-dots">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className="score-dot" style={{ background: i < score ? "#006035" : "#e2e8e5" }} />
      ))}
    </div>
  );
}

function DonutChart({ weekData, maxHours }) {
  const totalHours = weekData.reduce((a, d) => a + d.h, 0);
  const worked = totalHours;
  const remaining = Math.max(0, maxHours - worked);
  const extraHours = worked - maxHours > 0 ? worked - maxHours : 0;

  const cx = 60, cy = 60, r = 44, stroke = 12;
  const circ = 2 * Math.PI * r;
  const dayColors = ["#006035", "#007a43", "#009952", "#34c77b", "#d97706", "#e2e8e5", "#e2e8e5"];
  
  const segments = weekData.filter(d => d.h > 0).map((d, i) => ({
    ...d, pct: d.h / maxHours, color: dayColors[i] || "#006035"
  }));

  let cumulative = 0;
  const arcSegments = segments.map(seg => {
    const start = cumulative;
    cumulative += seg.pct;
    return { ...seg, start, end: cumulative };
  });

  function describeArc(startPct, endPct) {
    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPct * 2 * Math.PI - Math.PI / 2;
    const largeArc = (endPct - startPct) > 0.5 ? 1 : 0;
    return `M ${cx + r * Math.cos(startAngle)} ${cy + r * Math.sin(startAngle)} A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(endAngle)} ${cy + r * Math.sin(endAngle)}`;
  }

  return (
    <div className="donut-wrap">
      <svg width="120" height="120" className="donut-svg" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8e5" strokeWidth={stroke} />
        {arcSegments.map((seg, i) => (
          <path key={i} d={describeArc(seg.start, seg.end)} fill="none" stroke={seg.color} strokeWidth={stroke} strokeLinecap="round" style={{ transition: "all 1s ease-in-out" }} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#006035" fontFamily="DM Mono, monospace">{worked}h</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#7a9488" fontFamily="Inter, sans-serif" fontWeight="500">de {maxHours}h CLT</text>
      </svg>
      <div className="donut-legend">
        {arcSegments.map((seg, i) => (
          <div className="legend-item" key={i}><div className="legend-dot" style={{ background: seg.color }} /><span className="legend-label">{seg.day}</span><span className="legend-val">{seg.h}h</span></div>
        ))}
        <div className="legend-item"><div className="legend-dot" style={{ background: "#e2e8e5" }} /><span className="legend-label">Restante</span><span className="legend-val">{remaining}h</span></div>
        {worked > maxHours && (
          <div className="legend-item"><div className="legend-dot" style={{ background: "#dc2626" }} /><span className="legend-label" style={{ color: "#dc2626" }}>Extra</span><span className="legend-val" style={{ color: "#dc2626" }}>{extraHours}h</span></div>
        )}
      </div>
    </div>
  );
}

function AbsenceSection({ shifts, onReport, activeProfile }) {
  const [selectedShift, setSelectedShift] = useState("");
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [fileName, setFileName] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setFileName(f.name);
  };

  const handleSubmit = () => {
    onReport(selectedShift, reason, desc, activeProfile);
    setSubmitted(true);
  };

  if (activeProfile?.type === "Pool Flexível") {
    return (
      <div className="absence-card" style={{ borderColor: "var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Acesso Indisponível</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>Profissionais do Pool Flexível operam sob demanda e não possuem escala fixa para justificar ausência.</div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="absence-card" style={{ borderColor: "rgba(0,96,53,0.3)", borderLeft: "3px solid #006035" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#006035" }}>Falta Registada</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>O painel do gestor foi atualizado em tempo real.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absence-card">
      <div className="absence-header">
        <span style={{ fontSize: 18 }}>📋</span>
        <div><div className="absence-title">Reportar Falta</div><div className="absence-sub">{activeProfile?.name} · Equipe Efetiva</div></div>
      </div>
      
      <div className="absence-label">Plantão da Falta</div>
      <select className="absence-select" value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
        <option value="">Selecione o plantão...</option>
        {shifts && shifts.filter(s => s.status === "confirmed").map(s => (
          <option key={s.id} value={s.id}>{s.date} ({s.hours}) - {s.name}</option>
        ))}
      </select>

      <div className="absence-label">Motivo da Falta</div>
      <select className="absence-select" value={reason} onChange={e => setReason(e.target.value)}>
        <option value="">Selecione o motivo...</option>
        <option value="Atestado Médico">Atestado Médico</option>
        <option value="Problema Familiar">Problema Familiar</option>
        <option value="Acidente / Emergência">Acidente / Emergência</option>
        <option value="Motivo Pessoal">Motivo Pessoal</option>
      </select>

      <div className="absence-label">Descrição (opcional)</div>
      <textarea className="absence-textarea" placeholder="Descreva o motivo da falta..." value={desc} onChange={e => setDesc(e.target.value)} />
      
      <div className="absence-label">Documento Comprobatório</div>
      <input type="file" ref={fileRef} style={{ display: "none" }} onChange={handleFile} accept=".pdf,.jpg,.png" />
      <div className={`upload-zone${fileName ? " has-file" : ""}`} onClick={() => fileRef.current.click()}>
        {fileName ? (
          <div><div className="upload-icon">📎</div><div className="file-chip">{fileName}</div></div>
        ) : (
          <><div className="upload-icon">⬆️</div><div className="upload-text"><strong>Toque para anexar</strong></div><div className="upload-text" style={{ marginTop: 3 }}>PDF, JPG ou PNG · Máx. 10MB</div></>
        )}
      </div>

      <button className="submit-absence" disabled={!reason || !selectedShift} onClick={handleSubmit}>
        Reportar Falta
      </button>
    </div>
  );
}

// --- VISÃO DO GESTOR (DASHBOARD) ---
function Dashboard({ nurses, pool, inviteStatus, onSendInvite, hospitalBank, reportedAbsences }) {
  const [isComputing, setIsComputing] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("Todas");

  const nativeGaps = nurses.filter(n => n.status === "falta").length;
  const totalFuros = (inviteStatus === 'accepted' ? 0 : nativeGaps) + reportedAbsences.length;

  const bestCandidate = pool.reduce((prev, current) => (prev.readiness > current.readiness) ? prev : current, pool[0]);

  const runAI = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
      setAiAnalyzed(true);
    }, 1500);
  };

  const handleInviteNurse = (poolId) => {
    setSelectedSuggestionId(poolId);
    onSendInvite(poolId);
  };

  const availableUnits = ["Todas", ...Array.from(new Set(nurses.map(n => n.unit)))];
  const filteredNurses = selectedUnit === "Todas" ? nurses : nurses.filter(n => n.unit === selectedUnit);
  const invitedNurseInfo = pool.find(p => p.id === selectedSuggestionId) || pool[0];

  return (
    <div className="dashboard">
      <div className="main-col">
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-label">Plantão {APP_CONFIG.hospitalShort}</div>
            <div className={`kpi-value ${totalFuros === 0 ? 'green' : 'red'}`}>
              {nurses.length - totalFuros}/{nurses.length}
            </div>
            <div className="kpi-sub">{totalFuros === 0 ? 'Equipe Efetiva Completa' : `${totalFuros} Furo(s) na Operação`}</div>
          </div>
          <div className="kpi" style={{ borderLeftColor: "#dc2626" }}>
            <div className="kpi-label">Furos Detectados</div>
            <div className="kpi-value red">{totalFuros}</div>
            <div className="kpi-sub">⚡ Requer ação urgente</div>
          </div>
          <div className="kpi" style={{ borderLeftColor: "#2563eb" }}>
            <div className="kpi-label">Pool Disponível</div>
            <div className="kpi-value blue">{pool.length}</div>
            <div className="kpi-sub">Dentro do limite CLT</div>
          </div>
          <div className="kpi" style={{ borderLeftColor: "#d97706" }}>
            <div className="kpi-label">Horas Extras Pagas</div>
            <div className="kpi-value amber">0h</div>
            <div className="kpi-sub">Sistema de banco ativo</div>
          </div>
        </div>

        {reportedAbsences.map(abs => (
          <div key={abs.id} className="alert-card" style={{ borderColor: "var(--red-rim)", marginBottom: 16 }}>
            <div className="alert-card-header">
              <span>🚨</span>
              <span className="alert-title">Furo (Tempo Real) — {abs.nurseName}</span>
            </div>
            <div className="alert-desc">
              Falta reportada na aplicação móvel.<br/>
              <strong style={{color: "var(--text)"}}>Plantão Afetado:</strong> {abs.date} ({abs.shiftName})<br/>
              <strong style={{color: "var(--text)"}}>Motivo:</strong> {abs.reason}
            </div>
            {!aiAnalyzed && inviteStatus === 'none' && (
              <button className="btn-magic" style={{marginTop: 12}} onClick={runAI} disabled={isComputing}>
                {isComputing ? <><span className="ai-loader"></span> Analisando Substituição...</> : "✨ Validar Atestado e Acionar IA"}
              </button>
            )}
          </div>
        ))}

        {inviteStatus === 'none' && !aiAnalyzed && reportedAbsences.length === 0 && nurses.filter(n => n.status === "falta").map(missingNurse => (
          <div className="alert-card" key={missingNurse.id}>
            <div className="alert-card-header">
              <span>⚠️</span>
              <span className="alert-title">Furo Identificado — {missingNurse.shift} · {missingNurse.name} ({missingNurse.unit})</span>
            </div>
            <div className="alert-desc">O sistema identificou <strong style={{ color: "var(--text)" }}>{pool.length} profissionais elegíveis</strong>. Acione a IA para classificar os melhores perfis com base nas regras legais.</div>
            <button className="btn-magic" onClick={runAI} disabled={isComputing}>
              {isComputing ? <><span className="ai-loader"></span> Analisando Fadiga e Regulamentos...</> : "✨ Analisar Opções com Inteligência"}
            </button>
          </div>
        ))}

        {inviteStatus === 'none' && aiAnalyzed && (
          <div style={{ background: "#f0faf4", border: "1px solid var(--green-rim)", borderRadius: 12, padding: "16px", marginBottom: 16, borderLeft: "4px solid var(--green-800)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--green-800)" }}>Análise Concluída (0.8s)</div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>Profissionais ranqueados pela IA. <strong>Selecione quem deseja acionar:</strong></div>
              </div>
            </div>
            
            <div className="suggestion-list">
              {pool.slice(0, 3).sort((a,b) => b.readiness - a.readiness).map((p, index) => (
                <div className="suggestion-item" key={p.id}>
                  <div className="suggestion-left">
                    <div className="avatar" style={{ background: p.bg, color: p.color, border: "none" }}>{p.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div className="suggestion-name">{p.name} {p.id === bestCandidate.id && "⭐ (Melhor Escolha)"}</div>
                      <div className="suggestion-meta">{p.hoursSem}h Semanais · Prontidão {p.readiness}%</div>
                    </div>
                  </div>
                  <div className="score-bar">
                    <ScoreDots score={5 - index} />
                    <button className="action-btn btn-green" style={{marginLeft: 12}} onClick={() => handleInviteNurse(p.id)}>
                      Convidar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(inviteStatus === 'pending' || inviteStatus === 'accepted') && (
          <div style={{ background: inviteStatus === 'accepted' ? "var(--green-50)" : "#fff8f1", border: `1px solid ${inviteStatus === 'accepted' ? "var(--green-rim)" : "var(--amber-dim)"}`, borderRadius: 12, padding: "16px", marginBottom: 16, borderLeft: `4px solid ${inviteStatus === 'accepted' ? "var(--green-800)" : "var(--amber)"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{inviteStatus === 'accepted' ? '✅' : '⏳'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: inviteStatus === 'accepted' ? "var(--green-800)" : "var(--amber)" }}>
                  {inviteStatus === 'accepted' ? 'Escala Resolvida com Sucesso' : 'A Aguardar Confirmação'}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                  {inviteStatus === 'accepted' 
                    ? `${invitedNurseInfo.name} aceitou o convite. O banco de horas foi balanceado.` 
                    : `O convite foi enviado para ${invitedNurseInfo.name}. A aguardar resposta na aplicação...`}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">Monitorização de Escalas</span><span className="badge badge-blue">{APP_CONFIG.currentDate}</span></div>
          
          <div className="filter-row">
            {availableUnits.map(u => (
              <button key={u} className={`filter-btn ${selectedUnit === u ? 'active' : ''}`} onClick={() => setSelectedUnit(u)}>{u}</button>
            ))}
          </div>

          <div className="schedule-grid">
            {filteredNurses.map(n => (
              <div className={`shift-row${n.alert && inviteStatus !== 'accepted' ? " alert" : ""}`} key={n.id}>
                <div className="nurse-info">
                  <div className="avatar" style={{ background: n.bg, color: n.color, border: `2px solid ${n.color}30` }}>{n.name.split(" ").map(x => x[0]).join("")}</div>
                  <div>
                    <div className="nurse-name">{n.name}</div>
                    <div className="nurse-role">{n.role} • <span style={{color: n.color, fontWeight: 600}}>{n.unit}</span></div>
                  </div>
                </div>
                <div className="shift-time">{n.shift}</div>
                <div className="fatigue-bar-wrap">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span className="fatigue-label">PRONTIDÃO</span>
                    <span style={{ fontSize: 10, fontFamily: "DM Mono,monospace", color: (n.alert && inviteStatus !== 'accepted') ? "var(--text-dim)" : n.readiness > 60 ? "#006035" : n.readiness > 30 ? "#d97706" : "#dc2626" }}>{(n.alert && inviteStatus !== 'accepted') ? "—" : n.readiness + "%"}</span>
                  </div>
                  <ReadinessBar value={n.readiness} />
                </div>
                <span className={`badge ${(n.alert && inviteStatus !== 'accepted') ? "badge-red" : n.status === "noite" ? "badge-blue" : "badge-green"}`}>{(n.alert && inviteStatus !== 'accepted') ? "⚠ FALTA" : n.status === "noite" ? "NOTURNO" : "✓ ATIVO"}</span>
              </div>
            ))}
            {filteredNurses.length === 0 && (
              <div style={{textAlign: "center", padding: "20px", color: "var(--text-dim)", fontSize: 13}}>Sem profissionais alocados para este filtro.</div>
            )}
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="card">
          <div className="card-header"><span className="card-title">Pool Flexível (Retaguarda)</span><span className="badge badge-green">{pool.length} Disp.</span></div>
          <div className="stats-row" style={{ marginBottom: 14 }}>
            <div className="stat-mini"><div className="stat-mini-val" style={{ color: "var(--green-800)" }}>R$0</div><div className="stat-mini-lbl">Adicional Emergência</div></div>
            <div className="stat-mini"><div className="stat-mini-val" style={{ color: "var(--amber)" }}>+{hospitalBank}h</div><div className="stat-mini-lbl">Banco Acumulado</div></div>
          </div>
          <div className="pool-list">
            {pool.map(p => (
              <div className="pool-item" key={p.id}>
                <div className="pool-left">
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: p.bg, color: p.color, border: "none" }}>{p.name.split(" ").map(x => x[0]).join("")}</div>
                  <div><div className="pool-name">{p.name}</div><div className="pool-hours">{p.hoursSem}h Semanais</div></div>
                </div>
                <ReadinessBar value={p.readiness} width={60} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Análise de Eficiência</span>
            {totalFuros > 0 ? <span className="badge badge-red">Alerta</span> : <span className="badge badge-green">Estável</span>}
          </div>
          {availableUnits.filter(u => u !== "Todas").map(u => {
            let unitGaps = 0;
            nurses.forEach(n => { if (n.unit === u && n.status === "falta" && inviteStatus !== 'accepted') unitGaps++; });
            reportedAbsences.forEach(abs => { if (abs.shiftName.includes(u) && inviteStatus !== 'accepted') unitGaps++; });

            return (
              <div className="analysis-item" key={u}>
                <span className="analysis-unit">{u}</span>
                {unitGaps > 0 ? <span className="badge badge-red">{unitGaps} Furo(s)</span> : <span className="analysis-stat" style={{color: "var(--green-800)"}}>✓ Normal</span>}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Regulamentação (CLT)</span><span className="badge badge-green">Compliance</span></div>
          <div style={{maxHeight: "220px", overflowY: "auto", paddingRight: "4px"}}>
            {[...pool].sort((a,b) => b.hoursSem - a.hoursSem).map(item => {
              const warning = item.hoursSem >= APP_CONFIG.maxWeeklyHoursCLT - APP_CONFIG.alertThresholdHours;
              return (
                <div className="conform-item" key={item.id}>
                  <div className="conform-row">
                    <span className="conform-name">{item.name}</span>
                    <span className="conform-val" style={{ color: warning ? "#d97706" : "var(--text-dim)", fontWeight: warning ? 700 : 400 }}>
                      {item.hoursSem}h / {APP_CONFIG.maxWeeklyHoursCLT}h
                    </span>
                  </div>
                  <div className="fatigue-track" style={{ height: 5 }}>
                    <div className="fatigue-fill" style={{ width: `${(item.hoursSem / APP_CONFIG.maxWeeklyHoursCLT) * 100}%`, background: warning ? "#d97706" : "#006035" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- APP DO ENFERMEIRO (MOBILE) ---
function MobileApp({ shifts, inviteStatus, selectedTargetId, onAccept, weekData, onReportAbsence, allProfiles }) {
  const [activeTab, setActiveTab] = useState("home");
  const [isDark, setIsDark] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(allProfiles[0].id);
  const [activeProfile, setActiveProfile] = useState(null);

  const weekHours = weekData.reduce((a, d) => a + d.h, 0);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const profile = allProfiles.find(p => p.id === Number(selectedProfileId));
    setActiveProfile(profile);
    setIsLoggedIn(true);
    showToast(`Sessão iniciada como ${profile.name}`, "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveProfile(null);
    showToast("Sessão encerrada com sucesso", "info");
  };

  const handleAcceptInvite = () => {
    onAccept(activeProfile);
    setShowNotifMenu(false);
    showToast("Plantão confirmado com sucesso!", "success");
  };

  const isUserInvited = inviteStatus === 'pending' && (activeProfile?.id === selectedTargetId);

  return (
    <div className="mobile-wrapper">
      <div className="phone">
        <div className="phone-notch" />
        <div className={`phone-screen ${isDark ? 'dark-theme' : ''}`}>
          
          {!isLoggedIn ? (
            <div className="login-wrap">
              <div className="login-logo">R</div>
              <div className="login-title">Acesso Seguro</div>
              <div className="login-sub">Aplicativo da Equipe · {APP_CONFIG.hospitalName}</div>
              
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">Selecione o Profissional (Demonstração)</label>
                  <select className="login-input" value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)}>
                    {allProfiles.map(p => (
                      <option key={p.id} value={p.id}>[{p.type}] {p.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="login-btn">Aceder ao Painel</button>
              </form>
            </div>
          ) : (
            <>
              <div className="app-header">
                <div>
                  <div className="app-hello">Olá, colaborador 👋</div>
                  <div className="app-greeting">{activeProfile.first} <span>{activeProfile.last}</span></div>
                  <div style={{fontSize: 10, color: "var(--green-200)", marginTop: 2, background: "rgba(0,0,0,0.2)", display: "inline-block", padding: "2px 6px", borderRadius: 4}}>{activeProfile.type}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="Modo Escuro">
                    {isDark ? '☀️' : '🌙'}
                  </button>
                  <div className="notif-btn" onClick={() => setShowNotifMenu(!showNotifMenu)} title="Notificações">
                    🔔 {isUserInvited && <div className="notif-dot" />}
                  </div>
                  {/* BOTÃO DE LOGOUT ADICIONADO AQUI */}
                  <button onClick={handleLogout} className="theme-toggle" style={{ borderColor: 'rgba(220,38,38,0.3)', color: '#ef4444', fontSize: '18px' }} title="Sair da Conta">
                    🚪
                  </button>
                </div>
              </div>

              {showNotifMenu && (
                <div className="toast-container" style={{ top: '70px', bottom: 'auto', pointerEvents: 'all' }}>
                  {isUserInvited ? (
                    <div className="invite-card" style={{ margin: 0, width: '320px', background: isDark ? "#1f2937" : "#fff" }}>
                      <div className="invite-header"><span>💼</span><span className="invite-title">Oportunidade de Cobertura</span></div>
                      <div className="invite-desc" style={{ color: isDark ? "#d1d5db" : "var(--text-mid)" }}>O algoritmo identificou que possui margem na CLT e prontidão para assumir este plantão de urgência.</div>
                      <div className="invite-detail">
                        <span className="invite-tag" style={isDark ? {background: "#374151", color: "#e5e7eb", borderColor: "#4b5563"} : {}}>📅 Amanhã</span>
                        <span className="invite-tag" style={isDark ? {background: "#374151", color: "#e5e7eb", borderColor: "#4b5563"} : {}}>⏰ 07:00–19:00</span>
                        <span className="invite-tag" style={isDark ? {background: "#374151", color: "#e5e7eb", borderColor: "#4b5563"} : {}}>🏥 Cobertura Extra</span>
                      </div>
                      <button className="invite-accept" onClick={handleAcceptInvite} style={{ width: '100%' }}>✅ Aceitar Plantão (+12h)</button>
                    </div>
                  ) : (
                    <div className="toast info">O seu histórico de notificações está limpo.</div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 0, background: isDark ? "#121212" : "var(--surface)", borderBottom: `1px solid ${isDark ? "#333" : "var(--border)"}`, padding: "0 16px" }}>
                {[{ id: "home", label: "A Minha Escala" }, { id: "banco", label: "Banco Horas" }, { id: "falta", label: "Ausências" }].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    flex: 1, padding: "10px 4px", border: "none", background: "none", fontSize: 11, fontWeight: activeTab === t.id ? 700 : 500,
                    color: activeTab === t.id ? (isDark ? "#34c77b" : "var(--green-800)") : "var(--text-dim)",
                    borderBottom: activeTab === t.id ? `2px solid ${isDark ? "#34c77b" : "var(--green-800)"}` : "2px solid transparent",
                    cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s"
                  }}>{t.label}</button>
                ))}
              </div>

              {activeTab === "home" && (
                <>
                  <div className="fatigue-card">
                    <div className="fatigue-header">
                      <div><div className="fatigue-title" style={{ color: isDark ? "#9ca3af" : "" }}>Índice de Prontidão</div></div>
                      <div style={{ textAlign: "right" }}><div className="fatigue-pct" style={{ color: isDark ? "#34c77b" : "" }}>{activeProfile.readiness}%</div></div>
                    </div>
                    <div className="big-bar-track"><div className="big-bar-fill" style={{ width: `${activeProfile.readiness}%` }} /></div>
                    <div className="bar-zones"><span>🔴 Risco</span><span>🟡 Atenção</span><span>🟢 Excelente</span></div>
                  </div>

                  {inviteStatus === 'accepted' && isUserInvited === false && (
                    <div style={{ margin: "0 16px 16px", background: isDark ? "#064e3b" : "var(--green-50)", border: `1px solid ${isDark ? "#059669" : "var(--green-rim)"}`, borderRadius: 18, padding: 16, borderLeft: `3px solid ${isDark ? "#10b981" : "#006035"}` }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#34d399" : "var(--green-800)", marginBottom: 4 }}>✅ Confirmação Registada</div>
                      <div style={{ fontSize: 12, color: isDark ? "#a7f3d0" : "var(--text-mid)" }}>As horas foram computadas no seu saldo flexível.</div>
                    </div>
                  )}

                  <div className="schedule-title">Próximos Turnos</div>
                  <div className="schedule-scroll">
                    {shifts.map((s) => (
                      <div className={`shift-card${s.today ? " today" : ""}`} key={s.id}>
                        <div className="shift-line" style={{ background: s.color }} />
                        <div className="shift-info">
                          <div className="shift-date">{s.date}</div>
                          <div className="shift-name" style={{ color: isDark ? "#f3f4f6" : "" }}>{s.name}</div>
                          <div className="shift-hours" style={{ color: isDark ? "#9ca3af" : "" }}>{s.hours}</div>
                        </div>
                        <div style={{ fontSize: 14 }}>{s.icon}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "banco" && (
                <div style={{ padding: "16px 0" }}>
                  <div className="bank-card">
                    <div className="bank-header">
                      <span className="bank-title">Consolidado Semanal</span>
                      <span className="bank-total" style={{ color: isDark ? "#34c77b" : "var(--green-800)" }}>{weekHours}h / {APP_CONFIG.maxWeeklyHoursCLT}h</span>
                    </div>
                    <DonutChart weekData={weekData} maxHours={APP_CONFIG.maxWeeklyHoursCLT} />
                  </div>
                </div>
              )}

              {activeTab === "falta" && <div style={{ padding: "16px 0" }}><AbsenceSection shifts={shifts} onReport={onReportAbsence} activeProfile={activeProfile} /></div>}
            </>
          )}

          <div className="toast-container">
            {toasts.map(t => (
              <div key={t.id} className={`toast ${t.type}`}>{t.type === "success" ? "✅" : (t.type === "error" ? "❌" : "🔄")} {t.message}</div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE RAIZ (GERENCIADOR DE ESTADO GLOBAL) ---
export default function App() {
  const [view, setView] = useState("dashboard");
  const [nurses, setNurses] = useState(MOCK_NURSES);
  const [pool, setPool] = useState(MOCK_POOL);
  const [myShifts, setMyShifts] = useState(MOCK_MY_SHIFTS);
  const [inviteStatus, setInviteStatus] = useState("none");
  const [targetPoolId, setTargetPoolId] = useState(null); 
  const [weekData, setWeekData] = useState(MOCK_WEEK_DATA); 
  const [hospitalBank, setHospitalBank] = useState(6);
  const [reportedAbsences, setReportedAbsences] = useState([]);

  const allProfiles = [
    ...nurses.map(n => ({ id: n.id, name: n.name, role: n.role, type: "Equipe Efetiva", readiness: n.readiness, unit: n.unit, first: n.name.split(" ")[0], last: n.name.split(" ").slice(1).join(" ") })),
    ...pool.map(p => ({ id: p.id, name: p.name, role: "Enfermeiro(a)", type: "Pool Flexível", readiness: p.readiness, unit: "Cobertura", first: p.name.split(" ")[0], last: p.name.split(" ").slice(1).join(" ") }))
  ];

  const handleSendInvite = (poolId) => {
    setTargetPoolId(poolId);
    setInviteStatus("pending");
  };

  const handleAcceptInvite = (profile) => {
    setInviteStatus("accepted");
    
    setNurses(prev => prev.map(n => n.status === "falta" ? { ...n, name: `${profile.first} (Cobertura)`, alert: false, status: 'active', color: "#2563eb", bg: "#dbeafe" } : n));
    
    const newShift = { id: Date.now(), date: "AMANHÃ, 17 ABR", name: "Plantão Extra", hours: "07:00 – 19:00", color: "#006035", status: "confirmed", today: false, icon: "🔵", order: 2 };
    
    setMyShifts(prev => {
      const updated = [...prev, newShift];
      return updated.sort((a, b) => a.order - b.order);
    });
    
    setWeekData(prev => prev.map(d => d.day === "SEX" ? { ...d, h: d.h + 12 } : d));
    setHospitalBank(prev => prev + 12);
    setPool(prev => prev.map(p => p.id === targetPoolId ? { ...p, hoursSem: p.hoursSem + 12, readiness: p.readiness - 30 } : p));
    setReportedAbsences([]);
  };

  const handleReportAbsence = (shiftId, reason, desc, activeProfile) => {
    const shiftInfo = myShifts.find(s => s.id.toString() === shiftId.toString());
    
    let dayToReduce = "HOJE";
    if (shiftInfo) {
      if (shiftInfo.date.includes("SEG")) dayToReduce = "SEG";
      else if (shiftInfo.date.includes("TER")) dayToReduce = "TER";
      else if (shiftInfo.date.includes("QUA")) dayToReduce = "QUA";
      else if (shiftInfo.date.includes("SEX")) dayToReduce = "SEX";
      else if (shiftInfo.date.includes("HOJE")) dayToReduce = "HOJE";
    }

    const newAbsence = { id: Date.now(), nurseName: activeProfile.name, date: shiftInfo ? shiftInfo.date : "16 ABR", shiftName: shiftInfo ? shiftInfo.name : "Turno Diurno", reason, desc };
    
    setReportedAbsences(prev => [...prev, newAbsence]);
    
    setMyShifts(prev => prev.filter(s => s.id.toString() !== shiftId.toString()));
    
    setWeekData(prev => {
      const matchDay = dayToReduce === "HOJE" ? "QUI" : dayToReduce;
      return prev.map(d => d.day === matchDay ? { ...d, h: Math.max(0, d.h - 12) } : d);
    });
  };

  return (
    <div className="app">
      <nav className="top-nav">
        <div className="logo"><div className="logo-mark">R</div><div><div className="logo-text">{APP_CONFIG.appName}</div><div className="logo-sub">Solução Tecnológica · RHP</div></div></div>
        <div className="nav-tabs">
          <button className={`nav-tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>🖥 Painel Executivo</button>
          <button className={`nav-tab ${view === 'mobile' ? 'active' : ''}`} onClick={() => setView('mobile')}>📱 Aplicação Colaborador</button>
        </div>
      </nav>

      {view === 'dashboard' ? (
        <Dashboard 
          nurses={nurses} 
          pool={pool}
          inviteStatus={inviteStatus} 
          onSendInvite={handleSendInvite} 
          hospitalBank={hospitalBank} 
          reportedAbsences={reportedAbsences} 
        />
      ) : (
        <MobileApp 
          allProfiles={allProfiles}
          shifts={myShifts} 
          inviteStatus={inviteStatus} 
          selectedTargetId={targetPoolId}
          onAccept={handleAcceptInvite} 
          weekData={weekData} 
          onReportAbsence={handleReportAbsence}
        />
      )}
    </div>
  );
}