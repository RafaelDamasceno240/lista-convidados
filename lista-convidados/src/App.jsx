import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// Chaves públicas configuradas direto no código para pular a limitação da Vercel
const supabaseUrl = "https://pvnsxgyhneocebrbkave.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bnN4Z3lobmVvY2VicmJrYXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NTg1MzIsImV4cCI6MjA5NzIzNDUzMn0._jygiB27AyQk9og-1Z5OlArTLoZZEQInrHtoeSsakNQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STATUS_CONFIG = {
  confirmed: { label: "Confirmado", color: "#2DD4A0", bg: "rgba(45,212,160,0.15)", dot: "#2DD4A0" },
  pending:   { label: "Pendente",   color: "#F59E0B", bg: "rgba(245,158,11,0.15)", dot: "#F59E0B" },
};

// Nova configuração de faixas de idade requisitada
const AGE_CONFIG = {
  plus18: { label: "+18", color: "#60A5FA", bg: "rgba(96,165,251,0.12)" },
  plus6:  { label: "+6",  color: "#F472B6", bg: "rgba(244,114,182,0.12)" },
  minus6: { label: "-6",  color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
};

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function avatarColor(name) {
  const colors = [
    ["#1A3A4A", "#2DD4A0"], ["#3A2A1A", "#F59E0B"], ["#2A1A3A", "#A78BFA"],
    ["#1A2A3A", "#60A5FA"], ["#3A1A2A", "#F472B6"], ["#1A3A2A", "#34D399"],
  ];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  const [bg, text] = colors[h % colors.length];
  return { bg, text };
}

function Modal({ open, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#131B1E",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:"28px 24px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",maxHeight:"85vh",overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function GuestCard({ guest, onStatusChange, onDelete, onEdit }) {
  const { bg, text } = avatarColor(guest.name);
  const statusCfg = STATUS_CONFIG[guest.status] || STATUS_CONFIG.pending;
  const nextStatus = guest.status === "confirmed" ? "pending" : "confirmed";

  // Mapeamento retrocompatível ou baseado nos novos campos adicionais do Supabase
  const p18Count = guest.type === "group" ? (guest.adults_count ?? 0) : (guest.age_group === "plus18" || !guest.age_group || guest.age_group === "adult" ? 1 : 0);
  const p6Count  = guest.type === "group" ? (guest.children_count ?? 0) : (guest.age_group === "plus6" || guest.age_group === "child" ? 1 : 0);
  const m6Count  = guest.type === "group" ? (guest.minus6_count ?? 0) : (guest.age_group === "minus6" ? 1 : 0);

  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,background:"#131B1E",borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid rgba(255,255,255,0.05)",transition:"all 0.18s ease" }}>
      <div style={{ width:44,height:44,borderRadius:"50%",background:bg,color:text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,flexShrink:0,border:`2px solid ${statusCfg.dot}22` }}>
        {getInitials(guest.name)}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontWeight:600,fontSize:15,color:"#E8F0EE",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{guest.name}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:2,marginTop:2 }}>
          <span style={{ fontSize:12,color:"#5E7A72" }}>
            {guest.type === "group" ? `${guest.count} pessoa(s)` : "Individual"}
          </span>
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {p18Count > 0 && (
              <span style={{ fontSize:10,fontWeight:700,color:AGE_CONFIG.plus18.color,background:AGE_CONFIG.plus18.bg,padding:"1px 6px",borderRadius:6 }}>
                {p18Count} [+{AGE_CONFIG.plus18.label}]
              </span>
            )}
            {p6Count > 0 && (
              <span style={{ fontSize:10,fontWeight:700,color:AGE_CONFIG.plus6.color,background:AGE_CONFIG.plus6.bg,padding:"1px 6px",borderRadius:6 }}>
                {p6Count} [+{AGE_CONFIG.plus6.label}]
              </span>
            )}
            {m6Count > 0 && (
              <span style={{ fontSize:10,fontWeight:700,color:AGE_CONFIG.minus6.color,background:AGE_CONFIG.minus6.bg,padding:"1px 6px",borderRadius:6 }}>
                {m6Count} [{AGE_CONFIG.minus6.label}]
              </span>
            )}
          </div>
        </div>
        <span style={{ display:"inline-block",marginTop:6,fontSize:11,fontWeight:600,letterSpacing:"0.03em",color:statusCfg.color,background:statusCfg.bg,borderRadius:20,padding:"2px 10px" }}>{statusCfg.label}</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
        <button onClick={() => onStatusChange(guest.id, nextStatus)} style={{ background:statusCfg.bg,border:`1px solid ${statusCfg.color}44`,borderRadius:10,padding:"8px 14px",color:statusCfg.color,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif" }}>{statusCfg.label}</button>
        <button onClick={() => onEdit(guest)} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,width:34,height:34,color:"#5E7A72",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center" }}>✎</button>
        <button onClick={() => onDelete(guest.id)} style={{ background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.15)",borderRadius:10,width:34,height:34,color:"#F87171",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
      </div>
    </div>
  );
}

function GuestForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "individual");
  const [status, setStatus] = useState(initial?.status || "pending");
  
  // Estados mapeados para os novos padrões numéricos
  const [p18Count, setP18Count] = useState(initial?.adults_count ?? (initial?.age_group === "minus6" || initial?.age_group === "plus6" || initial?.age_group === "child" ? 0 : 1));
  const [p6Count, setP6Count] = useState(initial?.children_count ?? (initial?.age_group === "plus6" || initial?.age_group === "child" ? 1 : 0));
  const [m6Count, setM6Count] = useState(initial?.minus6_count ?? (initial?.age_group === "minus6" ? 1 : 0));
  
  const [ageGroup, setAgeGroup] = useState(() => {
    if (initial?.age_group === "child") return "plus6";
    if (initial?.age_group === "adult") return "plus18";
    return initial?.age_group || "plus18";
  });

  const inputRef = useRef();
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSave = () => {
    if (!name.trim()) return;

    let finalP18 = 0;
    let finalP6 = 0;
    let finalM6 = 0;
    let finalAgeGroup = ageGroup;

    if (type === "individual") {
      finalP18 = ageGroup === "plus18" ? 1 : 0;
      finalP6 = ageGroup === "plus6" ? 1 : 0;
      finalM6 = ageGroup === "minus6" ? 1 : 0;
    } else {
      finalP18 = Number(p18Count) || 0;
      finalP6 = Number(p6Count) || 0;
      finalM6 = Number(m6Count) || 0;
      finalAgeGroup = finalP18 > 0 ? "plus18" : (finalP6 > 0 ? "plus6" : "minus6");
    }

    const totalCount = finalP18 + finalP6 + finalM6;
    if (totalCount <= 0) return;

    onSave({ 
      name: name.trim(), 
      type, 
      count: totalCount, 
      status, 
      adults_count: finalP18,    // Guardado na coluna adults_count para manter compatibilidade
      children_count: finalP6,   // Guardado na coluna children_count
      minus6_count: finalM6,     // Guardado na nova propriedade (envia direto ao Supabase)
      age_group: finalAgeGroup
    });
  };

  const inputStyle = { width:"100%",background:"#0E1618",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"#E8F0EE",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box" };
  const labelStyle = { fontSize:12,fontWeight:600,color:"#5E7A72",letterSpacing:"0.06em",marginBottom:6,display:"block",textTransform:"uppercase" };

  return (
    <>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:700,color:"#E8F0EE" }}>{initial ? "Editar Convidado" : "Novo Convidado"}</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#5E7A72",fontSize:22,cursor:"pointer" }}>×</button>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Nome</label>
        <input ref={inputRef} style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Família Silva" onKeyDown={e => e.key === "Enter" && handleSave()} />
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Tipo</label>
        <div style={{ display:"flex",gap:10 }}>
          {[{ v:"individual",l:"Individual" },{ v:"group",l:"Grupo / Família" }].map(({ v, l }) => (
            <button key={v} onClick={() => setType(v)} style={{ flex:1,padding:"11px",borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:14,background:type===v?"rgba(45,212,160,0.15)":"#0E1618",border:type===v?"1px solid #2DD4A044":"1px solid rgba(255,255,255,0.08)",color:type===v?"#2DD4A0":"#5E7A72" }}>{l}</button>
          ))}
        </div>
      </div>

      {type === "individual" ? (
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Faixa de Idade</label>
          <div style={{ display:"flex",gap:8 }}>
            {Object.entries(AGE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setAgeGroup(key)} style={{ flex:1,padding:"11px",borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:14,background:ageGroup===key?cfg.bg:"#0E1618",border:ageGroup===key?`1px solid ${cfg.color}44`:"1px solid rgba(255,255,255,0.08)",color:ageGroup===key?cfg.color:"#5E7A72" }}>{cfg.label}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display:"flex",gap:10,marginBottom:16 }}>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>+18</label>
            <input type="number" min={0} max={99} style={inputStyle} value={p18Count} onChange={e => setP18Count(e.target.value)} />
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>+6</label>
            <input type="number" min={0} max={99} style={inputStyle} value={p6Count} onChange={e => setP6Count(e.target.value)} />
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>-6</label>
            <input type="number" min={0} max={99} style={inputStyle} value={m6Count} onChange={e => setM6Count(e.target.value)} />
          </div>
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <label style={labelStyle}>Status</label>
        <div style={{ display:"flex",gap:8 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatus(key)} style={{ flex:1,padding:"10px 8px",borderRadius:12,cursor:"pointer",fontWeight:600,fontSize:12,background:status===key?cfg.bg:"#0E1618",border:status===key?`1px solid ${cfg.color}44`:"1px solid rgba(255,255,255,0.08)",color:status===key?cfg.color:"#5E7A72" }}>{cfg.label}</button>
          ))}
        </div>
      </div>
      <button onClick={handleSave} style={{ width:"100%",padding:"16px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",fontWeight:700,fontSize:16,cursor:"pointer" }}>
        {initial ? "Salvar alterações" : "Adicionar convidado"}
      </button>
    </>
  );
}

function ReportModal({ guests, onClose }) {
  const confirmedList = guests.filter(g => g.status === "confirmed");
  const pendingList = guests.filter(g => g.status === "pending");

  // Totais remapeados para exibir o somatório das três idades
  const totalP18 = confirmedList.reduce((s, g) => s + (g.type === "group" ? (g.adults_count ?? 0) : (g.age_group === "plus18" || !g.age_group || g.age_group === "adult" ? 1 : 0)), 0);
  const totalP6  = confirmedList.reduce((s, g) => s + (g.type === "group" ? (g.children_count ?? 0) : (g.age_group === "plus6" || g.age_group === "child" ? 1 : 0)), 0);
  const totalM6  = confirmedList.reduce((s, g) => s + (g.type === "group" ? (g.minus6_count ?? 0) : (g.age_group === "minus6" ? 1 : 0)), 0);
  const confTotal = totalP18 + totalP6 + totalM6;

  const sectionTitleStyle = { fontSize:13, fontWeight:700, color:"#5E7A72", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12, marginTop:20, borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:6 };
  const reportItemStyle = { fontSize:14, color:"#E8F0EE", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.02)", display:"flex", justifyIntent:"space-between", justifyContent:"space-between" };

  return (
    <>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:700,color:"#E8F0EE" }}>📋 Relatório de Presença</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#5E7A72",fontSize:22,cursor:"pointer" }}>×</button>
      </div>

      <div style={{ background:"#0E1618", borderRadius:12, padding:14, marginBottom:16, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, textAlign:"center" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:"#2DD4A0" }}>{confTotal}</div>
          <div style={{ fontSize:10, color:"#5E7A72", textTransform:"uppercase", marginTop:2 }}>Total</div>
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:AGE_CONFIG.plus18.color }}>{totalP18}</div>
          <div style={{ fontSize:10, color:"#5E7A72", textTransform:"uppercase", marginTop:2 }}>+18</div>
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:AGE_CONFIG.plus6.color }}>{totalP6}</div>
          <div style={{ fontSize:10, color:"#5E7A72", textTransform:"uppercase", marginTop:2 }}>+6</div>
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:AGE_CONFIG.minus6.color }}>{totalM6}</div>
          <div style={{ fontSize:10, color:"#5E7A72", textTransform:"uppercase", marginTop:2 }}>-6</div>
        </div>
      </div>

      <div style={sectionTitleStyle}>Confirmados ({confirmedList.length} Grupos)</div>
      {confirmedList.length === 0 ? (
        <p style={{ fontSize:13, color:"#334A44", fontStyle:"italic" }}>Ninguém confirmado ainda.</p>
      ) : (
        confirmedList.map(g => {
          const p18 = g.type === "group" ? (g.adults_count ?? 0) : (g.age_group === "plus18" || !g.age_group || g.age_group === "adult" ? 1 : 0);
          const p6  = g.type === "group" ? (g.children_count ?? 0) : (g.age_group === "plus6" || g.age_group === "child" ? 1 : 0);
          const m6  = g.type === "group" ? (g.minus6_count ?? 0) : (g.age_group === "minus6" ? 1 : 0);
          return (
            <div key={g.id} style={reportItemStyle}>
              <span>✓ {g.name}</span>
              <span style={{ fontSize:12, color:"#5E7A72" }}>
                {[p18 > 0 && `${p18}(+18)`, p6 > 0 && `${p6}(+6)`, m6 > 0 && `${m6}(-6)`].filter(Boolean).join(" · ")}
              </span>
            </div>
          );
        })
      )}

      <div style={{ ...sectionTitleStyle, color:"#F59E0B" }}>Não Foram / Pendentes ({pendingList.length})</div>
      {pendingList.length === 0 ? (
        <p style={{ fontSize:13, color:"#334A44", fontStyle:"italic" }}>Nenhum pendente.</p>
      ) : (
        pendingList.map(g => (
          <div key={g.id} style={reportItemStyle}>
            <span style={{ color:"rgba(232,240,238,0.6)" }}>⏳ {g.name}</span>
            <span style={{ fontSize:12, color:"#334A44" }}>({g.count}p)</span>
          </div>
        ))
      )}
    </>
  );
}

export default function App() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editGuest, setEditGuest] = useState(null);

  useEffect(() => {
    async function loadGuests() {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("id", { ascending: true });
      
      if (error) console.error("Erro ao carregar dados do Supabase:", error);
      else setGuests(data || []);
    }
    loadGuests();
  }, []);

  const safeGuests = Array.isArray(guests) ? guests : [];

  const totalPeople     = safeGuests.reduce((s, g) => s + (g.count || 0), 0);
  const confirmedPeople = safeGuests.filter(g => g.status === "confirmed").reduce((s, g) => s + (g.count || 0), 0);
  const pendingPeople   = safeGuests.filter(g => g.status === "pending").reduce((s, g) => s + (g.count || 0), 0);

  const filtered = safeGuests.filter(g => {
    const matchSearch = g.name ? g.name.toLowerCase().includes(search.toLowerCase()) : false;
    return filter === "all" ? matchSearch : g.status === filter && matchSearch;
  });

  const sections = [
    { key:"pending", label:"Pendentes", data: filtered.filter(g => g.status === "pending") },
    { key:"confirmed", label:"Confirmados", data: filtered.filter(g => g.status === "confirmed") },
  ].filter(s => s.data.length > 0);

  const handleAdd = async (data) => {
    const { data: newGuest, error } = await supabase.from("guests").insert([data]).select();
    if (error) console.error("Erro ao adicionar:", error);
    else { setGuests(prev => [...prev, newGuest[0]]); setShowForm(false); }
  };

  const handleEdit = async (data) => {
    const { data: updatedGuest, error } = await supabase.from("guests").update(data).eq("id", editGuest.id).select();
    if (error) console.error("Erro ao editar:", error);
    else { setGuests(prev => prev.map(g => g.id === editGuest.id ? updatedGuest[0] : g)); setEditGuest(null); }
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from("guests").update({ status: newStatus }).eq("id", id);
    if (error) console.error("Erro ao atualizar status:", error);
    else setGuests(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) console.error("Erro ao deletar:", error);
    else setGuests(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div style={{ minHeight:"100vh",background:"#0A1214",fontFamily:"'DM Sans',sans-serif",color:"#E8F0EE",maxWidth:480,margin:"0 auto",paddingBottom:32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input::placeholder{color:#334A44;}
        input:focus{border-color:rgba(45,212,160,0.4)!important;}
      `}</style>

      <div style={{ padding:"28px 20px 0",background:"linear-gradient(180deg,#0D1A1E 0%,#0A1214 100%)" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              <span style={{ fontSize:22 }}>🎉</span>
              <h1 style={{ fontSize:26,fontWeight:800,color:"#E8F0EE",letterSpacing:"-0.02em" }}>Convidados</h1>
            </div>
            <p style={{ fontSize:13,color:"#5E7A72" }}>{safeGuests.length} grupos · {totalPeople} pessoas</p>
          </div>
          
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowReport(true)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#E8F0EE", borderRadius:12, padding:"10px 14px", fontWeight:600, fontSize:13, cursor:"pointer" }}>📋 Relatório</button>
            <button onClick={() => setShowForm(true)} style={{ background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",border:"none",borderRadius:12,padding:"10px 16px",fontWeight:700,fontSize:13,cursor:"pointer" }}>+ Novo</button>
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20 }}>
          {[{ value:totalPeople,label:"Total",color:"#E8F0EE" },{ value:confirmedPeople,label:"Confirmados",color:"#2DD4A0" },{ value:pendingPeople,label:"Pendentes",color:"#F59E0B" }].map(({ value,label,color }) => (
            <div key={label} style={{ background:"#131B1E",borderRadius:14,padding:"14px",border:"1px solid rgba(255,255,255,0.05)",textAlign:"center" }}>
              <div style={{ fontSize:28,fontWeight:800,color,letterSpacing:"-0.03em",lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:11,color:"#5E7A72",marginTop:4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,marginBottom:20,overflow:"hidden" }}>
          {totalPeople > 0 && (
            <div style={{ height:"100%",display:"flex" }}>
              <div style={{ width:`${(confirmedPeople/totalPeople)*100}%`,background:"#2DD4A0",transition:"width 0.4s ease" }} />
              <div style={{ width:`${(pendingPeople/totalPeople)*100}%`,background:"#F59E0B",transition:"width 0.4s ease" }} />
            </div>
          )}
        </div>

        <div style={{ position:"relative",marginBottom:14 }}>
          <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#334A44",pointerEvents:"none" }}>🔍</span>
          <input type="text" placeholder="Buscar pelo nome..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:"100%",background:"#131B1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 14px 13px 42px",color:"#E8F0EE",fontSize:15,outline:"none" }} />
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5E7A72",cursor:"pointer",fontSize:18 }}>×</button>}
        </div>

        <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4 }}>
          {[{ key:"all",label:"Todos" },{ key:"confirmed",label:"✓ Confirmados" },{ key:"pending",label:"⏳ Pendentes" }].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{ flexShrink:0,padding:"8px 14px",borderRadius:20,fontWeight:600,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",background:filter===key?"#2DD4A0":"transparent",border:filter===key?"1px solid #2DD4A0":"1px solid rgba(255,255,255,0.1)",color:filter===key?"#042C1E":"#5E7A72" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        {sections.length === 0 ? (
          <div style={{ textAlign:"center",padding:"60px 0",color:"#334A44" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:16 }}>Nenhum convidado encontrado</p>
          </div>
        ) : sections.map(({ key, label, data }) => (
          <div key={key} style={{ marginBottom:8 }}>
            <div style={{ fontSize:11,fontWeight:700,color:STATUS_CONFIG[key]?.color || "#FFF",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,marginTop:4 }}>
              {label} ({data.reduce((s, g) => s + (g.count || 0), 0)})
            </div>
            {data.map(g => <GuestCard key={g.id} guest={g} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={setEditGuest} />)}
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <GuestForm onSave={handleAdd} onClose={() => setShowForm(false)} />
      </Modal>
      <Modal open={!!editGuest} onClose={() => setEditGuest(null)}>
        {editGuest && <GuestForm initial={editGuest} onSave={handleEdit} onClose={() => setEditGuest(null)} />}
      </Modal>

      <Modal open={showReport} onClose={() => setShowReport(false)}>
        <ReportModal guests={safeGuests} onClose={() => setShowReport(false)} />
      </Modal>
    </div>
  );
}