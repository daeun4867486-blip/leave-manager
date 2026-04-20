import { useState } from "react";

const TEAM_MEMBERS = [
  { id: 1, name: "정일환", color: "#E85D4A" },
  { id: 2, name: "피재석", color: "#4A90E2" },
  { id: 3, name: "김다은", color: "#7ED321" },
  { id: 4, name: "정유림", color: "#F5A623" },
  { id: 5, name: "정혜란", color: "#9B59B6" },
];

const LEAVE_TYPES = [
  { id: "annual",     label: "연차",    color: "#4A90E2", bg: "#EBF4FF" },
  { id: "half",       label: "반차",    color: "#F5A623", bg: "#FFF8ED" },
  { id: "sick",       label: "병가",    color: "#E85D4A", bg: "#FEF0EE" },
  { id: "substitute", label: "대체휴일", color: "#9B59B6", bg: "#F5F0FF" },
];

const EXT_TYPES = [
  { id: "meeting",  label: "미팅",  color: "#00897B", bg: "#E0F2F1" },
  { id: "training", label: "교육",  color: "#1E88E5", bg: "#E3F2FD" },
  { id: "biz_trip", label: "출장",  color: "#6D4C41", bg: "#EFEBE9" },
  { id: "event",    label: "외부",  color: "#757575", bg: "#F5F5F5" },
];

// full label for list view
const EXT_TYPES_FULL = [
  { id: "meeting",  label: "외부 미팅",  color: "#00897B", bg: "#E0F2F1" },
  { id: "training", label: "교육/워크샵", color: "#1E88E5", bg: "#E3F2FD" },
  { id: "biz_trip", label: "출장",       color: "#6D4C41", bg: "#EFEBE9" },
  { id: "event",    label: "기타 외부",  color: "#757575", bg: "#F5F5F5" },
];

const ALL_TYPES = [...LEAVE_TYPES, ...EXT_TYPES];

const TOTAL_ANNUAL = 15;
const DAYS_KR   = ["일","월","화","수","목","금","토"];
const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const getTypeInfo     = (id) => ALL_TYPES.find(t => t.id === id) || LEAVE_TYPES[0];
const getTypeInfoFull = (id) => [...LEAVE_TYPES, ...EXT_TYPES_FULL].find(t => t.id === id) || LEAVE_TYPES[0];
const getMember       = (id) => TEAM_MEMBERS.find(m => m.id === id);
const getDaysInMonth  = (y,m) => new Date(y, m+1, 0).getDate();
const getFirstDay     = (y,m) => new Date(y, m, 1).getDay();
const toDateStr       = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const monthKey        = (ds) => ds ? ds.slice(0,7) : "";

const initLeaves = [
  { id:1, memberId:3, type:"annual",     startDate:"2026-04-07", endDate:"2026-04-07", days:1,   reason:"개인 사정" },
  { id:2, memberId:2, type:"half",       startDate:"2026-04-10", endDate:"2026-04-10", days:0.5, reason:"병원 방문" },
  { id:3, memberId:4, type:"substitute", startDate:"2026-04-14", endDate:"2026-04-14", days:1,   reason:"3/29 주말근무" },
  { id:4, memberId:5, type:"annual",     startDate:"2026-04-21", endDate:"2026-04-21", days:1,   reason:"여행" },
  { id:5, memberId:1, type:"annual",     startDate:"2026-04-28", endDate:"2026-04-28", days:1,   reason:"가족 행사" },
];

const initExternal = [
  { id:101, memberId:2, type:"meeting",  startDate:"2026-04-09", endDate:"2026-04-09", title:"클라이언트 미팅", location:"강남 사무실" },
  { id:102, memberId:1, type:"biz_trip", startDate:"2026-04-22", endDate:"2026-04-23", title:"부산 출장",       location:"부산" },
  { id:103, memberId:3, type:"training", startDate:"2026-04-16", endDate:"2026-04-16", title:"UX 워크샵",       location:"온라인" },
];

const initOT = [
  { id:1, memberId:4, date:"2026-03-29", reason:"분기 마감", used:true  },
  { id:2, memberId:2, date:"2026-04-05", reason:"긴급 배포", used:false },
  { id:3, memberId:1, date:"2026-04-12", reason:"고객 미팅", used:false },
];

// ─── UI helpers ────────────────────────────────────────────
const inputStyle = { width:"100%", padding:"10px 12px", border:"1.5px solid #E8E8E8", borderRadius:10, fontSize:13, color:"#333", outline:"none", boxSizing:"border-box", background:"#fff" };
const labelStyle = { fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:5 };

function Avatar({ m, size=36, fs=12 }) {
  if (!m) return null;
  return <div style={{ width:size, height:size, borderRadius:"50%", background:m.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:fs, fontWeight:700, flexShrink:0 }}>{m.name.slice(0,2)}</div>;
}
function Tag({ bg, color, children }) {
  return <span style={{ background:bg, color, borderRadius:6, fontSize:11, fontWeight:700, padding:"3px 8px", whiteSpace:"nowrap" }}>{children}</span>;
}
function FilterBtn({ label, active, color, onClick }) {
  return <button onClick={onClick} style={{ padding:"5px 13px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:active?color:"#fff", color:active?"#fff":"#555" }}>{label}</button>;
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:20, padding:"24px", width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:17, color:"#1A1A2E" }}>{title}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, color:"#aaa", cursor:"pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function InfoBanner({ color, bg, border, children }) {
  return <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color }}>{children}</div>;
}
function DeleteBtn({ onClick }) {
  return <button onClick={onClick} style={{ background:"none", border:"none", color:"#CCC", cursor:"pointer", fontSize:16, padding:"2px 6px", borderRadius:6, lineHeight:1 }} title="삭제">✕</button>;
}

// ── Calendar event chip — strictly contained ──────────────
function EventChip({ ev }) {
  const m2 = getMember(ev.memberId);
  const t2 = getTypeInfo(ev.type);
  // Short 2-char name + short type label (already short in ALL_TYPES)
  return (
    <div style={{
      background: t2.color,
      color: "#fff",
      borderRadius: 3,
      fontSize: 9,
      fontWeight: 700,
      padding: "1px 3px",
      lineHeight: "14px",
      // CRITICAL: never overflow the cell
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
      display: "block",
      boxSizing: "border-box",
    }}>
      {m2?.name.slice(0,2)} {ev.kind==="external" ? t2.label : t2.label}
    </div>
  );
}

// ─── main ───────────────────────────────────────────────────
export default function VacationManager() {
  const [tab,          setTab]          = useState("calendar");
  const [leaves,       setLeaves]       = useState(initLeaves);
  const [externals,    setExternals]    = useState(initExternal);
  const [overtimes,    setOvertimes]    = useState(initOT);
  const [calYear,      setCalYear]      = useState(2026);
  const [calMonth,     setCalMonth]     = useState(3);
  const [filterMember, setFilterMember] = useState("all");
  const [showLeave,    setShowLeave]    = useState(false);
  const [showExt,      setShowExt]      = useState(false);
  const [showOT,       setShowOT]       = useState(false);
  const [toast,        setToast]        = useState(null);

  const [form,   setForm]   = useState({ memberId:1, type:"annual",  startDate:"", endDate:"", reason:"" });
  const [extForm,setExtForm]= useState({ memberId:1, type:"meeting", startDate:"", endDate:"", title:"", location:"" });
  const [otForm, setOtForm] = useState({ memberId:1, date:"", reason:"" });

  function flash(msg, type="error") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  const monthlyCount = (mid, mk) =>
    leaves.filter(l => l.memberId===mid && !["substitute","sick"].includes(l.type) && monthKey(l.startDate)===mk).length;

  const subLeft = (mid) => {
    const earned = overtimes.filter(o=>o.memberId===mid).length;
    const used   = overtimes.filter(o=>o.memberId===mid&&o.used).length;
    return earned - used;
  };

  function deleteLeave(id)    { setLeaves(p=>p.filter(l=>l.id!==id));    flash("삭제되었어요.","info"); }
  function deleteExternal(id) { setExternals(p=>p.filter(e=>e.id!==id)); flash("삭제되었어요.","info"); }
  function deleteOT(id)       { setOvertimes(p=>p.filter(o=>o.id!==id)); flash("삭제되었어요.","info"); }

  function submitLeave() {
    if (!form.startDate||!form.endDate||!form.reason) { flash("모든 항목을 입력해 주세요."); return; }
    const mid=Number(form.memberId), mk=monthKey(form.startDate);
    if (!["substitute","sick"].includes(form.type) && monthlyCount(mid,mk)>=1) {
      flash(`${mk.replace("-","년 ")}월에 이미 휴가가 있어요. 월 1회만 가능해요.`); return;
    }
    if (form.type==="substitute") {
      if (subLeft(mid)<=0) { flash("사용 가능한 대체 휴일이 없어요."); return; }
      const unused=overtimes.find(o=>o.memberId===mid&&!o.used);
      if (unused) setOvertimes(p=>p.map(o=>o.id===unused.id?{...o,used:true}:o));
    }
    const days = form.type==="half" ? 0.5 : Math.round((new Date(form.endDate)-new Date(form.startDate))/86400000)+1;
    setLeaves(p=>[...p,{ id:Date.now(), memberId:mid, type:form.type, startDate:form.startDate, endDate:form.endDate, days, reason:form.reason }]);
    setShowLeave(false); setForm({memberId:1,type:"annual",startDate:"",endDate:"",reason:""});
    flash("등록되었어요.","success");
  }

  function submitExt() {
    if (!extForm.startDate||!extForm.endDate||!extForm.title) { flash("날짜와 일정 제목을 입력해 주세요."); return; }
    setExternals(p=>[...p,{ id:Date.now(), memberId:Number(extForm.memberId), type:extForm.type, startDate:extForm.startDate, endDate:extForm.endDate, title:extForm.title, location:extForm.location }]);
    setShowExt(false); setExtForm({memberId:1,type:"meeting",startDate:"",endDate:"",title:"",location:""});
    flash("외부 일정이 등록되었어요.","success");
  }

  function submitOT() {
    if (!otForm.date||!otForm.reason) { flash("날짜와 사유를 입력해 주세요."); return; }
    setOvertimes(p=>[...p,{ id:Date.now(), memberId:Number(otForm.memberId), date:otForm.date, reason:otForm.reason, used:false }]);
    setShowOT(false); setOtForm({memberId:1,date:"",reason:""});
    flash("휴일 근무가 등록되었어요.","success");
  }

  const daysInMonth = getDaysInMonth(calYear,calMonth);
  const firstDay    = getFirstDay(calYear,calMonth);

  function getEventsForDay(y,m,d) {
    const ds = toDateStr(y,m,d);
    const lv = leaves.filter(l=>l.startDate<=ds&&l.endDate>=ds).map(l=>({...l,kind:"leave"}));
    const ex = externals.filter(e=>e.startDate<=ds&&e.endDate>=ds).map(e=>({...e,kind:"external"}));
    return [...lv,...ex];
  }

  const stats = TEAM_MEMBERS.map(m=>{
    const used = leaves.filter(l=>l.memberId===m.id&&l.type!=="substitute").reduce((a,l)=>a+l.days,0);
    return {...m, used, remaining:TOTAL_ANNUAL-used, subLeft:subLeft(m.id)};
  });

  const filteredLeaves    = filterMember==="all" ? leaves    : leaves.filter(l=>l.memberId===Number(filterMember));
  const filteredExternals = filterMember==="all" ? externals : externals.filter(e=>e.memberId===Number(filterMember));

  const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
  const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); };

  const TABS = [
    {id:"calendar", label:"📅 캘린더"},
    {id:"schedule", label:"📋 일정 목록"},
    {id:"status",   label:"🏖️ 잔여 현황"},
    {id:"overtime", label:"🔁 대체 휴일"},
    {id:"stats",    label:"📊 통계"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F4F2EE", fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:18, left:"50%", transform:"translateX(-50%)", zIndex:2000,
          background:toast.type==="success"?"#1A1A2E":toast.type==="info"?"#555":"#E85D4A",
          color:"#fff", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:600,
          boxShadow:"0 4px 20px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background:"#1A1A2E", padding:"0 20px" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
          <div>
            <span style={{ fontSize:18, fontWeight:800, color:"#fff" }}>🌴 Leave</span>
            <span style={{ fontSize:11, color:"#8888BB", marginLeft:8 }}>팀 일정 관리</span>
          </div>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>setShowOT(true)}    style={{ background:"#2E2E4E", color:"#CCC",  border:"none", borderRadius:8, padding:"7px 12px", fontWeight:600, fontSize:11, cursor:"pointer" }}>+ 휴일근무</button>
            <button onClick={()=>setShowExt(true)}   style={{ background:"#00695C", color:"#fff",  border:"none", borderRadius:8, padding:"7px 12px", fontWeight:600, fontSize:11, cursor:"pointer" }}>+ 외부일정</button>
            <button onClick={()=>setShowLeave(true)} style={{ background:"#E85D4A", color:"#fff",  border:"none", borderRadius:8, padding:"7px 14px", fontWeight:700, fontSize:11, cursor:"pointer" }}>+ 휴가</button>
          </div>
        </div>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:"9px 14px", fontSize:12, fontWeight:tab===t.id?700:400,
              color:tab===t.id?"#fff":"#8888BB", whiteSpace:"nowrap", borderBottom:tab===t.id?"2px solid #E85D4A":"2px solid transparent" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"22px 14px" }}>

        {/* ── CALENDAR ── */}
        {tab==="calendar" && (
          <div style={{ background:"#fff", borderRadius:16, padding:"20px 16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <button onClick={prevMonth} style={{ background:"#F4F2EE", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:15 }}>‹</button>
              <span style={{ fontWeight:800, fontSize:16, color:"#1A1A2E" }}>{calYear}년 {MONTHS_KR[calMonth]}</span>
              <button onClick={nextMonth} style={{ background:"#F4F2EE", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:15 }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:2 }}>
              {DAYS_KR.map((d,i)=>(
                <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, padding:"4px 0",
                  color:i===0?"#E85D4A":i===6?"#4A90E2":"#888" }}>{d}</div>
              ))}
            </div>

            {/* Day cells — key fix: overflow:hidden on the cell itself */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
              {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day   = i+1;
                const events= getEventsForDay(calYear,calMonth,day);
                const isToday=calYear===2026&&calMonth===3&&day===20;
                const dow   =(firstDay+i)%7;
                return (
                  <div key={day} style={{
                    // fixed height so nothing can push it taller
                    height: 56,
                    borderRadius: 8,
                    padding: "3px",
                    background: isToday ? "#1A1A2E" : "#FAFAFA",
                    border: isToday ? "none" : "1px solid #EBEBEB",
                    // THE FIX: clip everything inside
                    overflow: "hidden",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}>
                    {/* Date number */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? "#fff" : dow===0 ? "#E85D4A" : dow===6 ? "#4A90E2" : "#444",
                      lineHeight: "13px",
                      flexShrink: 0,
                    }}>{day}</span>

                    {/* Event chips — max 2, rest shown as +N */}
                    <div style={{ display:"flex", flexDirection:"column", gap:1, overflow:"hidden", flex:1, minHeight:0 }}>
                      {events.slice(0,2).map(ev => <EventChip key={ev.id} ev={ev}/>)}
                      {events.length > 2 && (
                        <div style={{ fontSize:9, color:"#aaa", lineHeight:"13px", paddingLeft:2 }}>
                          +{events.length-2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #F0F0F0" }}>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:8 }}>
                <span style={{ fontSize:11, color:"#999", fontWeight:600, minWidth:36 }}>휴가</span>
                {LEAVE_TYPES.map(t=>(
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:t.color, flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"#666" }}>{t.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"#999", fontWeight:600, minWidth:36 }}>외부</span>
                {EXT_TYPES_FULL.map(t=>(
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:t.color, flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"#666" }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCHEDULE LIST ── */}
        {tab==="schedule" && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              <FilterBtn label="전체" active={filterMember==="all"} color="#1A1A2E" onClick={()=>setFilterMember("all")}/>
              {TEAM_MEMBERS.map(m=><FilterBtn key={m.id} label={m.name} active={filterMember===String(m.id)} color={m.color} onClick={()=>setFilterMember(String(m.id))}/>)}
            </div>

            <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E", marginBottom:10 }}>🏖️ 휴가</div>
            {filteredLeaves.length===0
              ? <div style={{ textAlign:"center", padding:"20px 0", color:"#bbb", fontSize:13, marginBottom:16 }}>등록된 휴가가 없어요.</div>
              : filteredLeaves.map(l=>{
                  const m2=getMember(l.memberId), t2=getTypeInfoFull(l.type);
                  return (
                    <div key={l.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", boxShadow:"0 1px 5px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:7 }}>
                      <Avatar m={m2} size={32} fs={11}/>
                      <div style={{ flex:1, minWidth:80 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E" }}>{m2?.name}</div>
                        <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{l.startDate}{l.startDate!==l.endDate?` ~ ${l.endDate}`:""} ({l.days}일) · {l.reason}</div>
                      </div>
                      <Tag bg={t2.bg} color={t2.color}>{t2.label}</Tag>
                      <DeleteBtn onClick={()=>deleteLeave(l.id)}/>
                    </div>
                  );
                })
            }

            <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E", margin:"18px 0 10px" }}>🗓️ 외부 일정</div>
            {filteredExternals.length===0
              ? <div style={{ textAlign:"center", padding:"20px 0", color:"#bbb", fontSize:13 }}>등록된 외부 일정이 없어요.</div>
              : filteredExternals.map(e=>{
                  const m2=getMember(e.memberId), t2=getTypeInfoFull(e.type);
                  return (
                    <div key={e.id} style={{ background:"#fff", borderRadius:12, padding:"12px 14px", boxShadow:"0 1px 5px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:7 }}>
                      <Avatar m={m2} size={32} fs={11}/>
                      <div style={{ flex:1, minWidth:80 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E" }}>{e.title}</div>
                        <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{m2?.name} · {e.startDate}{e.startDate!==e.endDate?` ~ ${e.endDate}`:""}{e.location?` · 📍${e.location}`:""}</div>
                      </div>
                      <Tag bg={t2.bg} color={t2.color}>{t2.label}</Tag>
                      <DeleteBtn onClick={()=>deleteExternal(e.id)}/>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── STATUS ── */}
        {tab==="status" && (
          <div>
            <InfoBanner color="#8B6000" bg="#FFF8ED" border="#F5A623">
              📌 <strong>월 1회 휴가 원칙</strong> — 연차·반차는 월 1회. 병가·대체휴일은 별도 적용.
            </InfoBanner>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12 }}>
              {stats.map(m=>{
                const pct=Math.round((m.used/TOTAL_ANNUAL)*100);
                const mk=`${calYear}-${String(calMonth+1).padStart(2,"0")}`;
                const usedThisMonth=monthlyCount(m.id,mk);
                return (
                  <div key={m.id} style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <Avatar m={m} size={38} fs={13}/>
                      <div style={{ flex:1 }}><div style={{ fontWeight:800, fontSize:14, color:"#1A1A2E" }}>{m.name}</div></div>
                      {usedThisMonth>=1 && <Tag bg="#FEF0EE" color="#E85D4A">이달 사용완료</Tag>}
                    </div>
                    <div style={{ height:7, background:"#F0F0F0", borderRadius:99, overflow:"hidden", marginBottom:8 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:m.color, borderRadius:99 }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:m.subLeft>0?8:0 }}>
                      <div style={{ textAlign:"center" }}><div style={{ fontSize:11, color:"#aaa" }}>사용</div><div style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.used}<span style={{ fontSize:11,color:"#aaa" }}>일</span></div></div>
                      <div style={{ textAlign:"center" }}><div style={{ fontSize:11, color:"#aaa" }}>잔여</div><div style={{ fontSize:20, fontWeight:800, color:"#1A1A2E" }}>{m.remaining}<span style={{ fontSize:11,color:"#aaa" }}>일</span></div></div>
                    </div>
                    {m.subLeft>0 && <div style={{ background:"#F5F0FF", borderRadius:8, padding:"6px 10px", fontSize:12, color:"#9B59B6", fontWeight:600 }}>🔁 대체휴일 {m.subLeft}일 사용 가능</div>}
                    <div style={{ marginTop:6, fontSize:11, color:"#bbb" }}>총 {TOTAL_ANNUAL}일 중 {pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── OVERTIME ── */}
        {tab==="overtime" && (
          <div>
            <InfoBanner color="#5B2D8E" bg="#F5F0FF" border="#C39EE0">
              🔁 <strong>대체 휴일 제도</strong> — 휴일 근무 등록 → 대체 휴일 적립 → 휴가 신청 시 '대체휴일' 선택으로 사용
            </InfoBanner>
            <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E", marginBottom:10 }}>팀원별 현황</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:20 }}>
              {TEAM_MEMBERS.map(m=>{
                const earned=overtimes.filter(o=>o.memberId===m.id).length;
                const used2=overtimes.filter(o=>o.memberId===m.id&&o.used).length;
                const left=earned-used2;
                return (
                  <div key={m.id} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar m={m} size={34} fs={12}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E" }}>{m.name}</div>
                      <div style={{ fontSize:11, color:"#888", marginTop:2 }}>적립 {earned}일 · 사용 {used2}일</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:22, fontWeight:800, color:left>0?"#9B59B6":"#CCC" }}>{left}</div>
                      <div style={{ fontSize:10, color:"#aaa" }}>잔여</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontWeight:700, fontSize:13, color:"#1A1A2E", marginBottom:10 }}>휴일 근무 내역</div>
            {overtimes.length===0
              ? <div style={{ textAlign:"center", padding:"24px 0", color:"#bbb", fontSize:13 }}>등록된 휴일 근무가 없어요.</div>
              : overtimes.map(o=>{
                  const m2=getMember(o.memberId);
                  return (
                    <div key={o.id} style={{ background:"#fff", borderRadius:12, padding:"12px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", marginBottom:7, display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar m={m2} size={30} fs={11}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:"#1A1A2E" }}>{m2?.name}</div>
                        <div style={{ fontSize:11, color:"#888" }}>{o.date} · {o.reason}</div>
                      </div>
                      <Tag bg={o.used?"#FFEBEE":"#E8F5E9"} color={o.used?"#C62828":"#388E3C"}>{o.used?"사용완료":"미사용"}</Tag>
                      <DeleteBtn onClick={()=>deleteOT(o.id)}/>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── STATS ── */}
        {tab==="stats" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
              {[
                {label:"전체 사용률", value:`${Math.round((stats.reduce((a,b)=>a+b.used,0)/(TEAM_MEMBERS.length*TOTAL_ANNUAL))*100)}%`, sub:`${stats.reduce((a,b)=>a+b.used,0)}/${TEAM_MEMBERS.length*TOTAL_ANNUAL}일`, color:"#E85D4A"},
                {label:"외부 일정",   value:`${externals.length}건`,                                                                    sub:"전체 등록",  color:"#00897B"},
                {label:"이달 휴가자", value:`${new Set(leaves.filter(l=>l.startDate.startsWith("2026-04")).map(l=>l.memberId)).size}명`, sub:"4월 기준",   color:"#4A90E2"},
                {label:"평균 잔여",   value:`${(stats.reduce((a,b)=>a+b.remaining,0)/stats.length).toFixed(1)}일`,                     sub:"팀원 평균",  color:"#7ED321"},
              ].map(c=>(
                <div key={c.label} style={{ background:"#fff", borderRadius:14, padding:"14px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{c.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:c.color }}>{c.value}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>{c.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#1A1A2E", marginBottom:14 }}>팀원별 연차 사용</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100, paddingBottom:4, borderBottom:"2px solid #F0F0F0" }}>
                {stats.map(m=>{
                  const h=Math.round((m.used/TOTAL_ANNUAL)*100);
                  return (
                    <div key={m.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:m.color }}>{m.used}</div>
                      <div style={{ width:"100%", height:`${Math.max(h,5)}%`, background:m.color, borderRadius:"4px 4px 0 0", minHeight:5 }}/>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:6 }}>
                {stats.map(m=><div key={m.id} style={{ flex:1, textAlign:"center", fontSize:11, color:"#888" }}>{m.name.slice(0,2)}</div>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── LEAVE MODAL ── */}
      {showLeave && (
        <Modal title="🏖️ 휴가 등록" onClose={()=>setShowLeave(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={labelStyle}>팀원</label>
              <select value={form.memberId} onChange={e=>setForm(f=>({...f,memberId:e.target.value}))} style={inputStyle}>
                {TEAM_MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>유형</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {LEAVE_TYPES.map(t=>(
                  <button key={t.id} onClick={()=>setForm(f=>({...f,type:t.id}))}
                    style={{ flex:1, minWidth:58, padding:"8px 4px", borderRadius:8, border:"1.5px solid", fontSize:12, fontWeight:600, cursor:"pointer",
                      borderColor:form.type===t.id?t.color:"#E8E8E8", background:form.type===t.id?t.bg:"#fff", color:form.type===t.id?t.color:"#888" }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {form.type==="substitute" && (
                <div style={{ marginTop:6, fontSize:11, color:"#9B59B6", background:"#F5F0FF", borderRadius:7, padding:"6px 10px" }}>
                  {subLeft(Number(form.memberId))>0?`✅ 대체 휴일 ${subLeft(Number(form.memberId))}일 사용 가능`:"❌ 사용 가능한 대체 휴일 없음"}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1 }}><label style={labelStyle}>시작일</label><input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} style={inputStyle}/></div>
              <div style={{ flex:1 }}><label style={labelStyle}>종료일</label><input type="date" value={form.endDate}   onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}   style={inputStyle}/></div>
            </div>
            <div><label style={labelStyle}>사유</label><textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} rows={3} placeholder="휴가 사유를 입력하세요" style={{...inputStyle,resize:"none"}}/></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button onClick={()=>setShowLeave(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #E8E8E8", background:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", color:"#555" }}>취소</button>
            <button onClick={submitLeave}              style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#E85D4A", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>등록하기</button>
          </div>
        </Modal>
      )}

      {/* ── EXT MODAL ── */}
      {showExt && (
        <Modal title="🗓️ 외부 일정 등록" onClose={()=>setShowExt(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={labelStyle}>팀원</label>
              <select value={extForm.memberId} onChange={e=>setExtForm(f=>({...f,memberId:e.target.value}))} style={inputStyle}>
                {TEAM_MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>유형</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {EXT_TYPES_FULL.map(t=>(
                  <button key={t.id} onClick={()=>setExtForm(f=>({...f,type:t.id}))}
                    style={{ flex:1, minWidth:68, padding:"8px 4px", borderRadius:8, border:"1.5px solid", fontSize:12, fontWeight:600, cursor:"pointer",
                      borderColor:extForm.type===t.id?t.color:"#E8E8E8", background:extForm.type===t.id?t.bg:"#fff", color:extForm.type===t.id?t.color:"#888" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div><label style={labelStyle}>일정 제목</label><input value={extForm.title} onChange={e=>setExtForm(f=>({...f,title:e.target.value}))} placeholder="예: 클라이언트 킥오프 미팅" style={inputStyle}/></div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1 }}><label style={labelStyle}>시작일</label><input type="date" value={extForm.startDate} onChange={e=>setExtForm(f=>({...f,startDate:e.target.value}))} style={inputStyle}/></div>
              <div style={{ flex:1 }}><label style={labelStyle}>종료일</label><input type="date" value={extForm.endDate}   onChange={e=>setExtForm(f=>({...f,endDate:e.target.value}))}   style={inputStyle}/></div>
            </div>
            <div><label style={labelStyle}>장소 (선택)</label><input value={extForm.location} onChange={e=>setExtForm(f=>({...f,location:e.target.value}))} placeholder="예: 강남 본사, 온라인" style={inputStyle}/></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button onClick={()=>setShowExt(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #E8E8E8", background:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", color:"#555" }}>취소</button>
            <button onClick={submitExt}             style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#00695C", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>등록하기</button>
          </div>
        </Modal>
      )}

      {/* ── OT MODAL ── */}
      {showOT && (
        <Modal title="🔁 휴일 근무 등록" onClose={()=>setShowOT(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={labelStyle}>팀원</label>
              <select value={otForm.memberId} onChange={e=>setOtForm(f=>({...f,memberId:e.target.value}))} style={inputStyle}>
                {TEAM_MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>근무일</label><input type="date" value={otForm.date}   onChange={e=>setOtForm(f=>({...f,date:e.target.value}))}   style={inputStyle}/></div>
            <div><label style={labelStyle}>사유</label>  <input              value={otForm.reason} onChange={e=>setOtForm(f=>({...f,reason:e.target.value}))} placeholder="예: 분기 마감 대응" style={inputStyle}/></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <button onClick={()=>setShowOT(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #E8E8E8", background:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", color:"#555" }}>취소</button>
            <button onClick={submitOT}              style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#9B59B6", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>등록하기</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
