import { useState, useEffect } from 'react';
import {
  getMyProjects,
  createProject,
  getIncomingMatches,
  acceptMatch,
  updateProjectStatus,
  getUnansweredQuestions,
  answerQuestion,
  getMyApplications
} from '../api/index';
import EditProjectModal from '../components/EditProjectModal';

function DashboardPage() {
  const [myProjects, setMyProjects] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [editProject, setEditProject] = useState(null);
  const [acceptMatchId, setAcceptMatchId] = useState(null);
  const [acceptMessage, setAcceptMessage] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerLoading, setAnswerLoading] = useState({});

  useEffect(function() {
    loadMyProjects();
    loadMatches();
    loadApplications();
    loadUnanswered();
  }, []);

  function loadMyProjects() {
    getMyProjects()
      .then(function(res) { setMyProjects(res.data); })
      .catch(function(err) { console.error('Failed to load projects:', err.message); });
  }

  function loadMatches() {
    getIncomingMatches()
      .then(function(res) { setMatches(res.data); })
      .catch(function(err) { console.error('Failed to load matches:', err.message); });
  }

  function loadApplications() {
    getMyApplications()
      .then(function(res) { setApplications(res.data); })
      .catch(function(err) { console.error('Failed to load applications:', err.message); });
  }

  function loadUnanswered() {
    getUnansweredQuestions()
      .then(function(res) { setUnanswered(res.data); })
      .catch(function(err) { console.error('Failed to load Q&A:', err.message); });
  }

  function handleCreateProject(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    const techArray = techStack.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t.length > 0; });
    createProject({ title, description, techStack: techArray, imageUrl, groupLink })
      .then(function(res) {
        setMyProjects(function(prev) { return [res.data, ...prev]; });
        setTitle(''); setDescription(''); setTechStack(''); setImageUrl(''); setGroupLink('');
        setShowForm(false);
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Failed to create project';
        setFormError(msg);
      })
      .finally(function() { setFormLoading(false); });
  }

  function handleToggleStatus(project) {
    const newStatus = project.status === 'open' ? 'closed' : 'open';
    updateProjectStatus(project._id, newStatus)
      .then(function(res) {
        setMyProjects(function(prev) {
          return prev.map(function(p) { return p._id === res.data._id ? res.data : p; });
        });
      })
      .catch(function(err) { console.error('Status update failed:', err.message); });
  }

  function handleSavedProject(updated) {
    setMyProjects(function(prev) {
      return prev.map(function(p) { return p._id === updated._id ? updated : p; });
    });
  }

  function openAcceptModal(matchId) { setAcceptMatchId(matchId); setAcceptMessage(''); }
  function closeAcceptModal() { setAcceptMatchId(null); setAcceptMessage(''); setAcceptLoading(false); }

  function confirmAccept() {
    if (!acceptMatchId) { return; }
    setAcceptLoading(true);
    acceptMatch(acceptMatchId, { messageFromOwner: acceptMessage })
      .then(function(res) {
        setMatches(function(prev) {
          return prev.map(function(m) { return m._id === res.data._id ? res.data : m; });
        });
        closeAcceptModal();
      })
      .catch(function(err) { console.error('Accept failed:', err.message); setAcceptLoading(false); });
  }

  function setAnswerDraft(id, value) {
    setAnswerDrafts(function(prev) { return Object.assign({}, prev, { [id]: value }); });
  }

  function submitAnswer(questionId) {
    const text = (answerDrafts[questionId] || '').trim();
    if (!text) { return; }
    setAnswerLoading(function(prev) { return Object.assign({}, prev, { [questionId]: true }); });
    answerQuestion(questionId, text)
      .then(function() {
        setUnanswered(function(prev) { return prev.filter(function(q) { return q._id !== questionId; }); });
        setAnswerDrafts(function(prev) { const next = Object.assign({}, prev); delete next[questionId]; return next; });
      })
      .catch(function(err) { console.error('Answer failed:', err.message); })
      .finally(function() {
        setAnswerLoading(function(prev) { const next = Object.assign({}, prev); delete next[questionId]; return next; });
      });
  }

  const pendingMatches = matches.filter(function(m) { return m.status === 'pending'; });
  const acceptedMatches = matches.filter(function(m) { return m.status === 'accepted'; });

  const tabs = [
    { key: 'projects', label: 'My Projects' },
    { key: 'qa', label: 'Q&A', badge: unanswered.length, badgeType: 'primary' },
    { key: 'interested', label: 'Interested Users', badge: pendingMatches.length, badgeType: 'error' },
    { key: 'applications', label: 'My Applications' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.75rem 4rem', position: 'relative' }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(255, 117, 89, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Edit project modal */}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={function() { setEditProject(null); }}
          onSaved={handleSavedProject}
        />
      )}

      {/* Accept modal */}
      {acceptMatchId && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgba(8, 9, 12, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={function(e) { if (e.target === e.currentTarget) { closeAcceptModal(); } }}
        role="presentation"
        >
          <div className="animate-scale-in" style={{
            background: 'var(--surface-container)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid rgba(255,77,77,0.08)',
            boxShadow: 'var(--shadow-float)',
          }}
          onClick={function(e) { e.stopPropagation(); }}
          >
            <h3 className="title-md" style={{ color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
              Add an optional message
            </h3>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
              This note is shown to the applicant with your group link after they're accepted.
            </p>
            <label className="input-label">Message (optional)</label>
            <textarea
              value={acceptMessage}
              onChange={function(e) { setAcceptMessage(e.target.value); }}
              rows={3}
              placeholder="e.g. Join our Discord — intro yourself in #intros"
              className="input-field"
              style={{ resize: 'none', marginBottom: '1.25rem', marginTop: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeAcceptModal} className="btn-ghost">Cancel</button>
              <button type="button" onClick={confirmAccept} disabled={acceptLoading} className="btn-primary">
                {acceptLoading ? 'Confirming…' : 'Confirm accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
        <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '0.625rem' }}>COLLABR STUDIO</p>
        <h1 className="display-md" style={{ color: 'var(--on-surface)', marginBottom: '0.625rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem' }}>
          Manage your active creative cycles and talent pipeline.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        background: 'var(--surface-container)',
        borderRadius: '0.875rem',
        padding: '0.25rem',
        gap: '0.25rem',
        marginBottom: '2.5rem',
        border: '1px solid var(--outline-variant)',
        position: 'relative',
        zIndex: 1,
      }}>
        {tabs.map(function(tab) {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={function() { setActiveTab(tab.key); }}
              style={{
                padding: '0.4375rem 1rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: active ? 'var(--surface-highest)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--secondary)',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                boxShadow: active ? 'inset 0 0 0 1px rgba(255,77,77,0.1)' : 'none',
              }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: tab.badgeType === 'error' ? 'var(--error)' : 'var(--primary-container)',
                  color: tab.badgeType === 'error' ? 'white' : 'var(--primary)',
                  fontSize: '0.625rem',
                  padding: '0.125rem 0.4375rem',
                  borderRadius: '99px',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── My Projects tab ── */}
      {activeTab === 'projects' && (
        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
          }}>
            <h2 className="title-lg" style={{ color: 'var(--on-surface)' }}>Your Projects</h2>
            <button
              onClick={function() { setShowForm(function(prev) { return !prev; }); }}
              className={showForm ? 'btn-ghost' : 'btn-primary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              {showForm ? 'Cancel' : '+ New Project'}
            </button>
          </div>

          {/* Create project form */}
          {showForm && (
            <form
              onSubmit={handleCreateProject}
              className="animate-scale-in"
              style={{
                background: 'var(--surface-container)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid rgba(255, 77, 77, 0.06)',
                boxShadow: 'var(--shadow-ambient)',
              }}
            >
              <div style={{ marginBottom: '-0.375rem' }}>
                <h3 className="title-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>New Project</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>Fill in the details to publish your project.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Project Title</label>
                  <input type="text" value={title}
                    onChange={function(e) { setTitle(e.target.value); }}
                    required placeholder="Give it a memorable name" className="input-field" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Description</label>
                  <textarea value={description}
                    onChange={function(e) { setDescription(e.target.value); }}
                    required rows={3} placeholder="What are you building? Who is it for?"
                    className="input-field" style={{ resize: 'none' }} />
                </div>
                <div>
                  <label className="input-label">Tech Stack</label>
                  <input type="text" value={techStack}
                    onChange={function(e) { setTechStack(e.target.value); }}
                    placeholder="React, Node.js, Python…" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Group Link (Optional)</label>
                  <input type="url" value={groupLink}
                    onChange={function(e) { setGroupLink(e.target.value); }}
                    placeholder="Discord, WhatsApp…" className="input-field" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Project Image URL (Optional)</label>
                  <input type="url" value={imageUrl}
                    onChange={function(e) { setImageUrl(e.target.value); }}
                    placeholder="https://images.unsplash.com/…" className="input-field" />
                  {imageUrl && (
                    <div style={{
                      marginTop: '0.75rem',
                      height: '100px',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      background: 'var(--surface-high)',
                    }}>
                      <img src={imageUrl} alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={function(e) { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div style={{
                  background: 'var(--error-dim)',
                  color: 'var(--error)',
                  borderRadius: '0.75rem',
                  padding: '0.625rem 0.9375rem',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  gap: '0.5rem',
                  border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  <span>⚠</span> {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading
                    ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Creating…</>
                    : 'Publish Project'
                  }
                </button>
                <button type="button" onClick={function() { setShowForm(false); }} className="btn-ghost">Cancel</button>
              </div>
            </form>
          )}

          {/* Projects grid */}
          {myProjects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--surface-container)',
              borderRadius: '1.25rem',
              border: '1px solid var(--outline-variant)',
            }}>
              <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🚀</div>
              <p style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No projects yet
              </p>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                Post your first project and start finding collaborators.
              </p>
              <button onClick={function() { setShowForm(true); }} className="btn-primary">
                + New Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {myProjects.map(function(project, index) {
                return (
                  <div
                    key={project._id}
                    className="animate-fade-up"
                    style={{
                      background: 'var(--surface-container)',
                      borderRadius: '1.125rem',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 77, 77, 0.04)',
                      boxShadow: 'var(--shadow-ambient)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s ease',
                      animationDelay: (index * 0.05) + 's',
                      opacity: 0,
                      animationFillMode: 'forwards',
                    }}
                    onMouseEnter={function(e) { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={function(e) { e.currentTarget.style.boxShadow = 'var(--shadow-ambient)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {project.imageUrl && (
                      <div style={{ width: '100%', height: '130px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={function(e) { e.target.style.display = 'none'; }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, transparent 40%, rgba(8,9,12,0.6) 100%)',
                        }} />
                      </div>
                    )}
                    <div style={{ padding: '1.125rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.75rem' }}>
                        <h3 style={{
                          fontFamily: "'Cabinet Grotesk', sans-serif",
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--on-surface)',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.3,
                        }}>
                          {project.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={function() { setEditProject(project); }}
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '0.5rem',
                              background: 'var(--surface-high)',
                              border: '1px solid var(--outline-variant)',
                              color: 'var(--secondary)',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--on-surface)'; }}
                            onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--secondary)'; }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <p style={{
                        color: 'var(--on-surface-variant)',
                        fontSize: '0.8125rem',
                        marginBottom: '0.875rem',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}>
                        {project.description}
                      </p>
                      {project.techStack && project.techStack.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                          {project.techStack.map(function(tech, i) {
                            return <span key={i} className="tag">{tech}</span>;
                          })}
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid rgba(60,68,85,0.18)', paddingTop: '0.875rem', display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={function() { handleToggleStatus(project); }}
                          style={{
                            padding: '0.3125rem 0.75rem',
                            borderRadius: '99px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            fontFamily: "'Satoshi', sans-serif",
                            border: 'none',
                            cursor: 'pointer',
                            background: project.status === 'open' ? 'var(--success-dim)' : 'var(--surface-high)',
                            color: project.status === 'open' ? 'var(--success)' : 'var(--secondary)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {project.status === 'open' ? '● Open — Mark Closed' : '○ Closed — Reopen'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Q&A tab ── */}
      {activeTab === 'qa' && (
        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 className="title-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
              Unanswered Questions
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
              Questions on your open projects that still need a reply.
            </p>
          </div>

          {unanswered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
              <p style={{ fontWeight: 500, color: 'var(--on-surface-variant)' }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {unanswered.map(function(q) {
                const projectTitle = q.projectId && q.projectId.title ? q.projectId.title : 'Project';
                const asker = q.authorId && q.authorId.name ? q.authorId.name : 'Someone';
                const isLoading = !!answerLoading[q._id];
                return (
                  <div key={q._id} style={{
                    background: 'var(--surface-container)',
                    borderRadius: '1rem',
                    padding: '1.375rem',
                    border: '1px solid rgba(255,77,77,0.05)',
                    boxShadow: 'var(--shadow-ambient)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="tag">{projectTitle}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>from {asker}</span>
                    </div>
                    <p style={{ color: 'var(--on-surface)', fontSize: '0.9375rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {q.text}
                    </p>
                    <label className="input-label">Your Answer</label>
                    <textarea
                      value={answerDrafts[q._id] !== undefined ? answerDrafts[q._id] : ''}
                      onChange={function(e) { setAnswerDraft(q._id, e.target.value); }}
                      rows={2}
                      placeholder="Write a helpful reply…"
                      className="input-field"
                      style={{ resize: 'none', marginBottom: '0.875rem', marginTop: '0.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={function() { submitAnswer(q._id); }}
                      disabled={isLoading || !(answerDrafts[q._id] || '').trim()}
                      className="btn-primary"
                    >
                      {isLoading ? 'Posting…' : 'Post answer'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Interested Users tab ── */}
      {activeTab === 'interested' && (
        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 className="title-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
              Applicant Pipeline
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
              People who expressed interest in your projects.
            </p>
          </div>

          {matches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👀</div>
              <p style={{ fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
                No one has expressed interest yet.
              </p>
              <p style={{ fontSize: '0.875rem' }}>Keep your projects open and share them!</p>
            </div>
          )}

          {pendingMatches.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
                Pending ({pendingMatches.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingMatches.map(function(match) {
                  const applicant = match.applicantId;
                  const project = match.projectId;
                  return (
                    <div
                      key={match._id}
                      style={{
                        background: 'var(--surface-container)',
                        borderRadius: '1rem',
                        padding: '1.25rem 1.375rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        border: '1px solid rgba(255, 77, 77, 0.05)',
                        boxShadow: 'var(--shadow-ambient)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flex: 1 }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary-dim), var(--primary-container))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {applicant.name ? applicant.name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="title-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                            {applicant.name}
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>
                            Interested in: <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>{project.title}</span>
                          </p>
                          {applicant.bio && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                              {applicant.bio}
                            </p>
                          )}
                          {applicant.skills && applicant.skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.625rem' }}>
                              {applicant.skills.map(function(skill, i) {
                                return <span key={i} className="tag">{skill}</span>;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={function() { openAcceptModal(match._id); }}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', flexShrink: 0 }}
                      >
                        Accept
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {acceptedMatches.length > 0 && (
            <div>
              <h3 className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
                Accepted ({acceptedMatches.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {acceptedMatches.map(function(match) {
                  const applicant = match.applicantId;
                  const project = match.projectId;
                  return (
                    <div key={match._id} style={{
                      background: 'var(--success-dim)',
                      borderRadius: '1rem',
                      padding: '1.25rem 1.375rem',
                      border: '1px solid rgba(61, 214, 140, 0.15)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <p className="title-md" style={{ color: 'var(--on-surface)' }}>{applicant.name}</p>
                        <span className="tag-success">Matched ✓</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                        Joined: <span style={{ color: 'var(--on-surface-variant)' }}>{project.title}</span>
                      </p>
                      <div style={{
                        background: 'rgba(8, 9, 12, 0.3)',
                        borderRadius: '0.625rem',
                        padding: '0.625rem 0.875rem',
                        display: 'inline-flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Email:</span>
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                          {applicant.email}
                        </span>
                      </div>
                      {match.messageFromOwner && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.625rem', fontStyle: 'italic' }}>
                          "{match.messageFromOwner}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── My Applications tab ── */}
      {activeTab === 'applications' && (
        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 className="title-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
              My Applications
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
              Projects you've expressed interest in.
            </p>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
                No applications yet.
              </p>
              <p style={{ fontSize: '0.875rem' }}>Go to the Discover feed and swipe Interested!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map(function(match) {
                const project = match.projectId;
                return (
                  <div key={match._id} style={{
                    background: 'var(--surface-container)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: '1px solid rgba(255, 77, 77, 0.05)',
                  }}>
                    <div>
                      <p className="title-md" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                        {project ? project.title : 'Unknown project'}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>
                        by {project && project.creatorId ? project.creatorId.name : 'Unknown'}
                      </p>
                    </div>
                    <span className={
                      match.status === 'accepted' ? 'tag-success' : 'tag'
                    } style={{ flexShrink: 0 }}>
                      {match.status === 'accepted' ? 'Accepted ✓' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
