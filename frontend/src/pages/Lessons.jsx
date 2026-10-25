import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";
import "./LearningPages.css";

const listOf = (data) => Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` });

export default function Lessons({ onBack, onOpenCourse }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const headers = authHeaders();
      const [lr, cr, pr] = await Promise.all([
        fetch(`${API_BASE_URL}/lessons/`, { headers }),
        fetch(`${API_BASE_URL}/courses/`, { headers }),
        fetch(`${API_BASE_URL}/progress/`, { headers }),
      ]);
      if ([lr, cr, pr].some(r => r.status === 401)) throw new Error("Your session has expired. Please log in again.");
      if (!lr.ok) throw new Error(`Lessons could not be loaded (HTTP ${lr.status}).`);
      if (!cr.ok) throw new Error(`Courses could not be loaded (HTTP ${cr.status}).`);
      if (!pr.ok) throw new Error(`Your lesson progress could not be loaded (HTTP ${pr.status}).`);
      const [ld, cd, pd] = await Promise.all([lr.json(), cr.json(), pr.json()]);
      setLessons(listOf(ld).sort((a,b) => Number(a.course)-Number(b.course) || Number(a.order)-Number(b.order)));
      setCourses(listOf(cd)); setProgress(listOf(pd));
    } catch (e) { setError(e.message || "Could not connect to the learning API."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const courseName = (id) => courses.find(c => Number(c.id) === Number(id))?.title || `Course ${id ?? "unassigned"}`;
  const progressFor = (lesson) => progress.find(p => Number(p.lesson) === Number(lesson.id));
  const filtered = useMemo(() => lessons.filter(l => {
    const q = search.trim().toLowerCase();
    return (!q || `${l.title || ""} ${l.content || ""} ${courseName(l.course)}`.toLowerCase().includes(q)) && (courseFilter === "all" || String(l.course) === courseFilter);
  }), [lessons, search, courseFilter, courses]);
  const completedCount = lessons.filter(l => progressFor(l)?.completed).length;

  const markComplete = async (lesson) => {
    const existing = progressFor(lesson);
    setSavingId(lesson.id); setError(""); setNotice("");
    try {
      const response = await fetch(existing ? `${API_BASE_URL}/progress/${existing.id}/` : `${API_BASE_URL}/progress/`, {
        method: existing ? "PATCH" : "POST", headers: authHeaders(),
        body: JSON.stringify(existing ? { completed: true } : { lesson: lesson.id, completed: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || `Progress save failed (HTTP ${response.status}).`);
      setProgress(old => existing ? old.map(p => Number(p.id) === Number(existing.id) ? data : p) : [...old, data]);
      setNotice(`“${lesson.title}” was marked complete and saved to your account.`);
    } catch (e) { setError(e.message || "Could not save lesson progress."); }
    finally { setSavingId(null); }
  };

  if (selected) {
    const status = progressFor(selected);
    const courseLessons = lessons.filter(l => Number(l.course) === Number(selected.course)).sort((a,b) => Number(a.order)-Number(b.order));
    const idx = courseLessons.findIndex(l => Number(l.id) === Number(selected.id));
    return <main className="lp-page">
      <button className="lp-back" onClick={() => setSelected(null)}>← All lessons</button>
      <div className="lp-lesson-detail">
        <div className="lp-kicker">{courseName(selected.course)} · Lesson {selected.order ?? idx + 1}</div>
        <h1>{selected.title || "Untitled lesson"}</h1>
        <div className="lp-detail-meta"><span>Difficulty: {selected.difficulty ?? "Not specified"}</span><span className={status?.completed ? "lp-done" : "lp-pending"}>{status?.completed ? "✓ Completed" : "Not completed yet"}</span></div>
        <article className="lp-content">{selected.content || "No lesson content has been added by the instructor yet."}</article>
        {error && <div className="lp-alert lp-error">{error}</div>}{notice && <div className="lp-alert lp-success">{notice}</div>}
        <div className="lp-actions">
          <button className="lp-button lp-secondary" onClick={() => setSelected(courseLessons[idx - 1])} disabled={idx <= 0}>← Previous lesson</button>
          <button className="lp-button" onClick={() => markComplete(selected)} disabled={Boolean(status?.completed) || savingId === selected.id}>{savingId === selected.id ? "Saving…" : status?.completed ? "✓ Completed" : "Mark as complete"}</button>
          <button className="lp-button lp-secondary" onClick={() => setSelected(courseLessons[idx + 1])} disabled={idx < 0 || idx >= courseLessons.length - 1}>Next lesson →</button>
        </div>
      </div>
    </main>;
  }

  return <main className="lp-page">
    <header className="lp-header"><div><div className="lp-kicker">YOUR LEARNING LIBRARY</div><h1>Lessons</h1><p>Open a lesson to read the content and save your progress.</p></div><button className="lp-button lp-secondary" onClick={load} disabled={loading}>{loading ? "Loading…" : "↻ Refresh"}</button></header>
    <div className="lp-summary"><div><strong>{lessons.length}</strong><span>Total lessons</span></div><div><strong>{completedCount}</strong><span>Completed</span></div><div><strong>{lessons.length ? Math.round(completedCount / lessons.length * 100) : 0}%</strong><span>Completion</span></div></div>
    <div className="lp-filters"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons or content…" aria-label="Search lessons"/><select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} aria-label="Filter by course"><option value="all">All courses</option>{courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}</select></div>
    {error && <div className="lp-alert lp-error">{error}</div>}{notice && <div className="lp-alert lp-success">{notice}</div>}
    {loading ? <div className="lp-empty">Loading lessons from your account…</div> : filtered.length === 0 ? <div className="lp-empty"><h2>No lessons found</h2><p>{lessons.length ? "Try changing your search or course filter." : "There are no lessons returned by the backend yet. Ask your instructor to add lessons."}</p></div> : <div className="lp-list">{filtered.map((lesson, i) => { const p = progressFor(lesson); return <article className="lp-card" key={lesson.id}><div className="lp-card-icon">{p?.completed ? "✓" : String(lesson.order || i + 1).padStart(2,"0")}</div><div className="lp-card-body"><div className="lp-kicker">{courseName(lesson.course)}</div><h2>{lesson.title || `Lesson ${i + 1}`}</h2><p>{String(lesson.content || "Lesson content has not been added yet.").replace(/\s+/g," ").slice(0,190)}{String(lesson.content || "").length > 190 ? "…" : ""}</p><div className="lp-tags"><span>Difficulty {lesson.difficulty ?? "—"}</span><span>{p?.completed ? "Completed" : "In progress"}</span></div></div><button className="lp-button" onClick={() => { setSelected(lesson); setNotice(""); setError(""); }}>Open lesson →</button></article>; })}</div>}
  </main>;
}
