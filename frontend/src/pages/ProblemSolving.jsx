import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";
import "./LearningPages.css";
import "./ProblemSolving.css";
const listOf = d => Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];
const fields = [
 ["goal_answer","Problem goal","What exact result is the problem asking for?"],
 ["inputs_answer","Inputs","What information or data is given?"],
 ["outputs_answer","Expected output","What should the solution produce?"],
 ["constraints_answer","Constraints and edge cases","What limits or unusual cases must be considered?"],
 ["decomposition_answer","Breakdown","Break the problem into smaller ordered tasks."],
 ["pattern_answer","Reasoning pattern","What reusable pattern applies, and why?"],
 ["state_answer","State to track","What information must be remembered while solving?"],
 ["decision_answer","Decision condition","What condition changes the next action?"],
 ["verification_answer","Verification","Test a normal case and an edge case."],
 ["transfer_answer","Transfer the idea","Where else could this pattern be used?"],
];
const headers = () => ({"Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("accessToken") || ""}`});
export default function ProblemSolving() {
 const [problems,setProblems]=useState([]),[attempts,setAttempts]=useState([]),[profile,setProfile]=useState(null),[selected,setSelected]=useState(null),[answers,setAnswers]=useState({}),[steps,setSteps]=useState(["","",""]),[result,setResult]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[difficulty,setDifficulty]=useState("all"),[query,setQuery]=useState("");
 const root=`${API_BASE_URL}/problem-solving`;
 const load=async()=>{setLoading(true);setError("");try{const h=headers();const [p,a,r]=await Promise.all([fetch(`${root}/problems/`,{headers:h}),fetch(`${root}/attempts/`,{headers:h}),fetch(`${root}/profile/`,{headers:h})]);if([p,a,r].some(x=>x.status===401))throw Error("Your session has expired. Please log in again.");for(const [label,res] of [["Problems",p],["Attempts",a],["Reasoning profile",r]])if(!res.ok)throw Error(`${label} endpoint returned HTTP ${res.status}.`);const [pd,ad,rd]=await Promise.all([p.json(),a.json(),r.json()]);setProblems(listOf(pd));setAttempts(listOf(ad));setProfile(rd);}catch(e){setError(e.message||"Unable to load Problem Solving backend data.");}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const filtered=useMemo(()=>problems.filter(p=>(difficulty==="all"||String(p.difficulty)===difficulty)&&(!query||`${p.title} ${p.statement} ${p.pattern}`.toLowerCase().includes(query.toLowerCase()))),[problems,difficulty,query]);
 const open=(p)=>{setSelected(p);setResult(null);setError("");setAnswers({});setSteps(["","",""]);};
 const submit=async(e)=>{e.preventDefault();if(!selected)return;setSaving(true);setError("");try{const payload={problem:selected.id,...answers,logic_steps:steps.map(s=>s.trim()).filter(Boolean)};const res=await fetch(`${root}/attempts/`,{method:"POST",headers:headers(),body:JSON.stringify(payload)});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.detail||`Submission failed (HTTP ${res.status}).`);setResult(data);await load();}catch(e){setError(e.message||"Could not save this attempt.");}finally{setSaving(false);}};
 const skillNames={goal:"Goal",inputs:"Inputs",outputs:"Outputs",constraints:"Constraints",decomposition:"Breakdown",pattern:"Pattern",state:"State",decision:"Decision",verification:"Verification",transfer:"Transfer",logical_sequencing:"Logic steps"};
 if (selected) {
   const detailItems = [
     ["Input", selected.input_description], ["Expected output", selected.output_description],
     ["Constraints", selected.constraints], ["Goal hint", selected.goal_hint],
     ["Decomposition hint", selected.decomposition_hint], ["State hint", selected.state_hint],
     ["Decision hint", selected.decision_hint], ["Verification hint", selected.verification_hint],
     ["Transfer problem", selected.transfer_problem]
   ].filter(item => item[1]);
   return <main className="ps-fullscreen">
     <header className="ps-topbar">
       <button type="button" className="ps-top-link" onClick={()=>{setSelected(null);setResult(null);}}>← All problems</button>
       <div className="ps-top-title"><span>LEARNSMART / PROBLEM SOLVING</span><strong>{selected.title}</strong></div>
       <div className="ps-top-actions"><span className="ps-difficulty-pill">Difficulty {selected.difficulty}</span><button type="button" className="ps-tool-button" onClick={load} disabled={loading}>↻ Refresh</button></div>
     </header>
     {error && <div className="ps-work-error" role="alert">{error}</div>}
     <div className="ps-workspace">
       <aside className="ps-problem-pane">
         <div className="ps-pane-tabs"><span className="active">Statement</span><span>Hints & details</span></div>
         <div className="ps-problem-content">
           <div className="ps-kicker">{selected.pattern || "Reasoning practice"}</div>
           <h1>{selected.title}</h1>
           <p className="ps-statement">{selected.statement}</p>
           {detailItems.map(([label,value])=><section className="ps-detail-block" key={label}><h3>{label}</h3><p>{value}</p></section>)}
           {!detailItems.length && <p className="ps-muted">No extra statement details were supplied by the backend for this problem.</p>}
         </div>
       </aside>
       <section className="ps-solution-pane">
         <div className="ps-editor-toolbar"><div><span className="ps-live-dot"/> <strong>Solution workspace</strong><small>Saved to your authenticated profile when submitted</small></div><span className="ps-language-tag">Reasoning response</span></div>
         <form className="ps-solution-form" onSubmit={submit}>
           <p className="ps-form-note">Explain your approach in the fields below. Your response is evaluated by the backend's configured rubric; this page does not execute source code.</p>
           <div className="ps-answer-fields">{fields.map(([key,label,hint])=><label className="ps-work-field" key={key}><span>{label}</span><small>{hint}</small>{key==="pattern_answer"?<input value={answers[key]||""} onChange={e=>setAnswers(a=>({...a,[key]:e.target.value}))} placeholder="Describe the pattern…"/>:<textarea rows={key==="decomposition_answer"||key==="verification_answer"?4:3} value={answers[key]||""} onChange={e=>setAnswers(a=>({...a,[key]:e.target.value}))} placeholder={`Write your ${label.toLowerCase()}…`}/>}</label>)}</div>
           <section className="ps-logic-editor"><div className="ps-logic-title"><div><h3>Ordered logic steps</h3><p>List your algorithm steps in execution order.</p></div><button type="button" className="ps-tool-button" onClick={()=>setSteps(old=>[...old,""])}>+ Add step</button></div>{steps.map((step,i)=><div className="ps-code-step" key={i}><span>{String(i+1).padStart(2,"0")}</span><input value={step} onChange={e=>setSteps(old=>old.map((x,j)=>j===i?e.target.value:x))} placeholder={`Step ${i+1}`} /><button type="button" disabled={steps.length<=3} onClick={()=>setSteps(old=>old.filter((_,j)=>j!==i))} aria-label={`Remove step ${i+1}`}>×</button></div>)}</section>
           {result && <section className="ps-submission-result"><span>SUBMISSION SAVED · #{result.id}</span><h2>Backend score: {result.total_score}/10</h2><div className="ps-result-chips">{Object.entries(result.scores||{}).map(([key,value])=><span key={key}>{skillNames[key]||key}: <strong>{value}/10</strong></span>)}</div><h3>Feedback</h3>{(result.feedback||[]).length?<ul>{result.feedback.map((f,i)=><li key={i}><strong>{skillNames[f.skill]||f.skill}:</strong> {f.message}</li>)}</ul>:<p>Submission received by backend.</p>}</section>}
           <footer className="ps-submit-bar"><span>Changes are not saved until you submit.</span><button type="button" className="ps-tool-button" onClick={()=>{setSelected(null);setResult(null);}}>Cancel</button><button type="submit" className="ps-submit-button" disabled={saving}>{saving?"Submitting…":"Submit solution →"}</button></footer>
         </form>
       </section>
     </div>
   </main>;
 }
 return <main className="lp-page"><header className="lp-header"><div><div className="lp-kicker">THINK · BREAK DOWN · VERIFY</div><h1>Problem Solving</h1><p>Problems, submissions, feedback and your reasoning profile are loaded from the authenticated backend.</p></div><button className="lp-button lp-secondary" onClick={load} disabled={loading}>↻ Refresh</button></header>
 {error&&<div className="lp-alert lp-error">{error}</div>}
 <div className="lp-summary"><div><strong>{problems.length}</strong><span>Available problems</span></div><div><strong>{attempts.length}</strong><span>Saved attempts</span></div><div><strong>{profile?.attempt_count ?? 0}</strong><span>Profile attempts</span></div></div>
 {!selected ? <><div className="lp-filters"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search problems or patterns…"/><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">All difficulty levels</option><option value="1">Difficulty 1</option><option value="2">Difficulty 2</option><option value="3">Difficulty 3</option></select></div>
 {loading?<div className="lp-empty">Loading problems from backend…</div>:filtered.length===0?<div className="lp-empty"><h2>No problems returned</h2><p>Check that active Problem records exist in the backend.</p></div>:<div className="lp-list">{filtered.map(p=><article className="lp-card" key={p.id}><div className="lp-card-icon">{p.difficulty}</div><div className="lp-card-body"><div className="lp-kicker">{p.pattern||"Reasoning practice"}</div><h2>{p.title}</h2><p>{p.statement}</p><div className="lp-tags"><span>Difficulty {p.difficulty}</span><span>{attempts.filter(a=>Number(a.problem)===Number(p.id)).length} attempts</span></div></div><button className="lp-button" onClick={()=>open(p)}>Solve →</button></article>)}</div>}
 <section className="lp-panel"><h2>Your reasoning profile</h2><p className="lp-muted">Scores below come from the backend profile endpoint. A blank score means there is not yet enough attempt data.</p><div className="lp-skills">{Object.entries(profile?.skills||{}).map(([k,v])=><div key={k} className="lp-skill"><div><span>{skillNames[k]||k}</span><strong>{v==null?"—":`${v}/10`}</strong></div><div className="lp-track"><span style={{width:`${Math.max(0,Math.min(100,Number(v||0)*10))}%`}}/></div></div>)}</div>{profile?.focus_areas?.length>0&&<p className="lp-muted"><strong>Focus areas:</strong> {profile.focus_areas.map(x=>skillNames[x]||x).join(", ")}</p>}</section>
 <section className="lp-panel"><h2>Recent attempts</h2>{attempts.length===0?<p className="lp-muted">No attempts have been saved yet.</p>:<div className="lp-history">{attempts.slice(0,10).map(a=><div key={a.id} className="lp-history-row"><div><strong>{a.problem_title||problems.find(p=>Number(p.id)===Number(a.problem))?.title||`Problem #${a.problem}`}</strong><small>{a.created_at?new Date(a.created_at).toLocaleString():"Saved attempt"}</small></div><strong>{a.total_score}/10</strong></div>)}</div>}</section></>:<><button className="lp-back" onClick={()=>setSelected(null)}>← All problems</button><section className="lp-panel"><div className="lp-kicker">{selected.pattern} · Difficulty {selected.difficulty}</div><h2>{selected.title}</h2><p className="lp-problem-statement">{selected.statement}</p><div className="lp-hints"><h3>Hints from the backend</h3>{[["Goal",selected.goal_hint],["Inputs / outputs",`${selected.input_description||""}${selected.output_description?`\nOutput: ${selected.output_description}`:""}`],["Constraints",selected.constraints],["Decomposition",selected.decomposition_hint],["State",selected.state_hint],["Decision",selected.decision_hint],["Verification",selected.verification_hint],["Transfer problem",selected.transfer_problem]].filter(x=>x[1]).map(([k,v])=><p key={k}><strong>{k}:</strong> {v}</p>)}</div></section>
 <form className="lp-panel" onSubmit={submit}><h2>Your reasoning</h2><p className="lp-muted">Fill in your approach. The backend applies its configured rubric and returns scores and feedback; it is not a semantic proof of correctness.</p><div className="lp-answer-grid">{fields.map(([key,label,hint])=><label className="lp-field" key={key}><span>{label}</span><small>{hint}</small>{key==="pattern_answer"?<input value={answers[key]||""} onChange={e=>setAnswers(a=>({...a,[key]:e.target.value}))} />:<textarea rows={3} value={answers[key]||""} onChange={e=>setAnswers(a=>({...a,[key]:e.target.value}))}/>}</label>)}</div><div className="lp-steps"><h3>Ordered logic steps</h3>{steps.map((s,i)=><div className="lp-step" key={i}><span>{i+1}</span><input value={s} onChange={e=>setSteps(old=>old.map((x,j)=>i===j?e.target.value:x))} placeholder={`Step ${i+1}`}/><button type="button" className="lp-remove" disabled={steps.length<=3} onClick={()=>setSteps(old=>old.filter((_,j)=>i!==j))} aria-label={`Remove step ${i+1}`}>×</button></div>)}<button type="button" className="lp-button lp-secondary" onClick={()=>setSteps(old=>[...old,""])}>+ Add step</button></div><div className="lp-actions"><button type="button" className="lp-button lp-secondary" onClick={()=>setSelected(null)}>Cancel</button><button type="submit" className="lp-button" disabled={saving}>{saving?"Submitting…":"Submit to backend"}</button></div></form>
 {result&&<section className="lp-panel lp-result"><div className="lp-kicker">SAVED ATTEMPT #{result.id}</div><h2>Backend evaluation: {result.total_score}/10</h2><div className="lp-skills">{Object.entries(result.scores||{}).map(([k,v])=><div className="lp-skill" key={k}><div><span>{skillNames[k]||k}</span><strong>{v}/10</strong></div><div className="lp-track"><span style={{width:`${Number(v)*10}%`}}/></div></div>)}</div><h3>Feedback</h3>{(result.feedback||[]).length?<ul>{result.feedback.map((f,i)=><li key={i}><strong>{skillNames[f.skill]||f.skill}:</strong> {f.message}</li>)}</ul>:<p>All rubric checks passed for this submission.</p>}<button className="lp-button" onClick={()=>{setSelected(null);setResult(null);load();}}>Back to problems</button></section>}</>}
 </main>;
}
