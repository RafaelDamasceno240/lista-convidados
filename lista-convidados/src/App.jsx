import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "lista_convidados_v1";

const INITIAL_GUESTS = [
  { id: 1, name: "Douglas", type: "individual", count: 1, status: "confirmed" },
  { id: 2, name: "Ana Costa", type: "individual", count: 1, status: "confirmed" },
  { id: 3, name: "Família Oliveira", type: "group", count: 4, status: "confirmed" },
  { id: 4, name: "Casal Pedro & Luana", type: "group", count: 2, status: "confirmed" },
  { id: 5, name: "Beatriz Ramos", type: "individual", count: 1, status: "confirmed" },
  { id: 6, name: "Dr. Roberto Nunes", type: "individual", count: 1, status: "confirmed" },
  { id: 7, name: "Damasceno", type: "individual", count: 1, status: "pending" },
  { id: 8, name: "Marcos Silva", type: "individual", count: 1, status: "absent" },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmado", color: "#2DD4A0", bg: "rgba(45,212,160,0.15)", dot: "#2DD4A0" },
  pending:   { label: "Pendente",   color: "#F59E0B", bg: "rgba(245,158,11,0.15)", dot: "#F59E0B" },
  absent:    { label: "Ausente",    color: "#F87171", bg: "rgba(248,113,113,0.15)", dot: "#F87171" },
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
      <div onClick={e => e.stopPropagation()} style={{ background:"#131B1E",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:"28px 24px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",animation:"slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {children}
      </div>
    </div>
  );
}

function GuestCard({ guest, onStatusChange, onDelete, onEdit }) {
  const { bg, text } = avatarColor(guest.name);
  const statusCfg = STATUS_CONFIG[guest.status];
  const nextStatus = guest.status === "confirmed" ? "pending" : guest.status === "pending" ? "absent" : "confirmed";

  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,background:"#131B1E",borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid rgba(255,255,255,0.05)",transition:"all 0.18s ease" }}>
      <div style={{ width:44,height:44,borderRadius:"50%",background:bg,color:text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,flexShrink:0,border:`2px solid ${statusCfg.dot}22` }}>
        {getInitials(guest.name)}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontWeight:600,fontSize:15,color:"#E8F0EE",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{guest.name}</div>
        <div style={{ fontSize:12,color:"#5E7A72",marginTop:2 }}>{guest.type === "group" ? `${guest.count} pessoa(s)` : "Individual"}</div>
        <span style={{ display:"inline-block",marginTop:4,fontSize:11,fontWeight:600,letterSpacing:"0.03em",color:statusCfg.color,background:statusCfg.bg,borderRadius:20,padding:"2px 10px" }}>{statusCfg.label}</span>
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
  const [count, setCount] = useState(initial?.count || 1);
  const [status, setStatus] = useState(initial?.status || "pending");
  const inputRef = useRef();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, count: type === "group" ? Number(count) : 1, status });
  };

  const inputStyle = { width:"100%",background:"#0E1618",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px 16px",color:"#E8F0EE",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box" };
  const labelStyle = { fontSize:12,fontWeight:600,color:"#5E7A72",letterSpacing:"0.06em",marginBottom:6,display:"block",textTransform:"uppercase" };

  return (
    <>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:700,color:"#E8F0EE",fontFamily:"'DM Sans',sans-serif" }}>{initial ? "Editar Convidado" : "Novo Convidado"}</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#5E7A72",fontSize:22,cursor:"pointer",lineHeight:1 }}>×</button>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Nome</label>
        <input ref={inputRef} style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Família Silva" onKeyDown={e => e.key === "Enter" && handleSave()} />
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={labelStyle}>Tipo</label>
        <div style={{ display:"flex",gap:10 }}>
          {[{ v:"individual",l:"Individual" },{ v:"group",l:"Grupo / Família" }].map(({ v, l }) => (
            <button key={v} onClick={() => setType(v)} style={{ flex:1,padding:"11px",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,background:type===v?"rgba(45,212,160,0.15)":"#0E1618",border:type===v?"1px solid #2DD4A044":"1px solid rgba(255,255,255,0.08)",color:type===v?"#2DD4A0":"#5E7A72" }}>{l}</button>
          ))}
        </div>
      </div>
      {type === "group" && (
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Número de pessoas</label>
          <input type="number" min={2} max={99} style={inputStyle} value={count} onChange={e => setCount(e.target.value)} />
        </div>
      )}
      <div style={{ marginBottom:24 }}>
        <label style={labelStyle}>Status</label>
        <div style={{ display:"flex",gap:8 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatus(key)} style={{ flex:1,padding:"10px 8px",borderRadius:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,background:status===key?cfg.bg:"#0E1618",border:status===key?`1px solid ${cfg.color}44`:"1px solid rgba(255,255,255,0.08)",color:status===key?cfg.color:"#5E7A72" }}>{cfg.label}</button>
          ))}
        </div>
      </div>
      <button onClick={handleSave} style={{ width:"100%",padding:"16px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",fontWeight:700,fontSize:16,fontFamily:"'DM Sans',sans-serif",cursor:"pointer" }}>
        {initial ? "Salvar alterações" : "Adicionar convidado"}
      </button>
    </>
  );
}

export default function App() {
  const [guests, setGuests] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : INITIAL_GUESTS; }
    catch { return INITIAL_GUESTS; }
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(guests)); }, [guests]);

  const totalPeople = guests.reduce((s, g) => s + g.count, 0);
  const confirmedPeople = guests.filter(g => g.status === "confirmed").reduce((s, g) => s + g.count, 0);
  const pendingPeople = guests.filter(g => g.status === "pending").reduce((s, g) => s + g.count, 0);
  const absentPeople = guests.filter(g => g.status === "absent").reduce((s, g) => s + g.count, 0);
  const pendingGuests = guests.filter(g => g.status === "pending");

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return filter === "all" ? matchSearch : g.status === filter && matchSearch;
  });

  const sections = [
    { key:"pending", label:"Pendentes", data: filtered.filter(g => g.status === "pending") },
    { key:"confirmed", label:"Confirmados", data: filtered.filter(g => g.status === "confirmed") },
    { key:"absent", label:"Ausentes", data: filtered.filter(g => g.status === "absent") },
  ].filter(s => s.data.length > 0);

  const handleAdd = (data) => { setGuests(prev => [...prev, { id: Date.now(), ...data }]); setShowForm(false); };
  const handleEdit = (data) => { setGuests(prev => prev.map(g => g.id === editGuest.id ? { ...g, ...data } : g)); setEditGuest(null); };
  const handleStatusChange = (id, newStatus) => setGuests(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
  const handleDelete = (id) => setGuests(prev => prev.filter(g => g.id !== id));
  const handleBulkConfirm = () => { setGuests(prev => prev.map(g => g.status === "pending" ? { ...g, status: "confirmed" } : g)); setConfirmBulk(false); };

  return (
    <div style={{ minHeight:"100vh",background:"#0A1214",fontFamily:"'DM Sans',sans-serif",color:"#E8F0EE",maxWidth:480,margin:"0 auto",paddingBottom:pendingGuests.length>0?100:32 }}>
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
            <p style={{ fontSize:13,color:"#5E7A72" }}>{guests.length} grupos · {totalPeople} pessoas</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",border:"none",borderRadius:12,padding:"10px 18px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>+ Novo</button>
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
              <div style={{ width:`${(absentPeople/totalPeople)*100}%`,background:"#F87171",transition:"width 0.4s ease" }} />
            </div>
          )}
        </div>

        <div style={{ position:"relative",marginBottom:14 }}>
          <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#334A44",pointerEvents:"none" }}>🔍</span>
          <input type="text" placeholder="Buscar pelo nome..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:"100%",background:"#131B1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 14px 13px 42px",color:"#E8F0EE",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none" }} />
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#5E7A72",cursor:"pointer",fontSize:18 }}>×</button>}
        </div>

        <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4 }}>
          {[{ key:"all",label:"Todos" },{ key:"confirmed",label:"✓ Confirmados" },{ key:"pending",label:"⏳ Pendentes" },{ key:"absent",label:"✕ Ausentes" }].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{ flexShrink:0,padding:"8px 14px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",background:filter===key?"#2DD4A0":"transparent",border:filter===key?"1px solid #2DD4A0":"1px solid rgba(255,255,255,0.1)",color:filter===key?"#042C1E":"#5E7A72" }}>{label}</button>
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
            <div style={{ fontSize:11,fontWeight:700,color:STATUS_CONFIG[key].color,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,marginTop:4 }}>
              {label} ({data.reduce((s, g) => s + g.count, 0)})
            </div>
            {data.map(g => <GuestCard key={g.id} guest={g} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={setEditGuest} />)}
          </div>
        ))}
      </div>

      {pendingGuests.length > 0 && filter !== "absent" && (
        <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 20px 28px",background:"linear-gradient(0deg,#0A1214 70%,transparent)",zIndex:20 }}>
          <button onClick={() => setConfirmBulk(true)} style={{ width:"100%",padding:"16px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",fontWeight:700,fontSize:16,fontFamily:"'DM Sans',sans-serif",cursor:"pointer" }}>
            Confirmar {pendingGuests.length} pendente{pendingGuests.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <GuestForm onSave={handleAdd} onClose={() => setShowForm(false)} />
      </Modal>
      <Modal open={!!editGuest} onClose={() => setEditGuest(null)}>
        {editGuest && <GuestForm initial={editGuest} onSave={handleEdit} onClose={() => setEditGuest(null)} />}
      </Modal>
      <Modal open={confirmBulk} onClose={() => setConfirmBulk(false)}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
          <h2 style={{ fontSize:20,fontWeight:700,color:"#E8F0EE",marginBottom:8 }}>Confirmar todos?</h2>
          <p style={{ color:"#5E7A72",fontSize:14,marginBottom:28 }}>{pendingGuests.length} convidado{pendingGuests.length>1?"s":""} pendente{pendingGuests.length>1?"s":""} serão marcados como confirmados.</p>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={() => setConfirmBulk(false)} style={{ flex:1,padding:14,borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"#0E1618",color:"#5E7A72",fontWeight:600,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Cancelar</button>
            <button onClick={handleBulkConfirm} style={{ flex:1,padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#2DD4A0,#1DAF82)",color:"#042C1E",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Confirmar todos</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}