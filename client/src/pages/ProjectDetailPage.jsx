import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getQuestions, postQuestion } from '../api/index';

function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;
  const user = useAtomValue(userAtom);

  const [project, setProject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    Promise.all([
      getProjectById(projectId),
      getQuestions(projectId),
    ])
      .then(function(results) {
        setProject(results[0].data);
        setQuestions(results[1].data);
      })
      .catch(function(err) {
        setError('Failed to load project');
        console.error(err.message);
      })
      .finally(function() { setLoading(false); });
  }, [projectId]);

  function handlePostQuestion(e) {
    e.preventDefault();
    if (!questionText.trim()) { return; }
    setPosting(true);
    postQuestion(projectId, questionText)
      .then(function(res) {
        setQuestions(function(prev) { return [...prev, res.data]; });
        setQuestionText('');
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error : 'Failed to post question';
        setError(msg);
      })
      .finally(function() { setPosting(false); });
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--secondary)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px' }} />
        <p>Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>{error || 'Project not found'}</p>
        <Link to="/feed" style={{ color: 'var(--primary-dim)', textDecoration: 'none' }}>← Back to Feed</Link>
      </div>
    );
  }

  const creator = project.creatorId;

  return (
    <div className="animate-fade-up" style={{ maxWidth: '740px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Back link */}
      <Link to="/feed" style={{
        color: 'var(--primary-dim)',
        fontSize: '0.875rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginBottom: '1.75rem',
        fontWeight: 500,
        transition: 'color 0.2s',
      }}
      onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--primary)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--primary-dim)'; }}
      >
        ← Back to Feed
      </Link>

      {/* Hero image */}
      {project.imageUrl && (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          marginBottom: '1.75rem',
          background: 'var(--surface-high)',
          boxShadow: 'var(--shadow-ambient)',
        }}>
          <img
            src={project.imageUrl}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={function(e) { e.target.style.display = 'none'; }}
          />
          {/* Cinematic gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(8,9,12,0.75) 0%, rgba(8,9,12,0.1) 50%, transparent 100%)',
          }} />
          {/* Title overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.75rem',
            right: '1.75rem',
          }}>
            <h1 style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.03em',
              textShadow: '0 2px 16px rgba(0,0,0,0.5)',
              marginBottom: '0.375rem',
            }}>
              {project.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={project.status === 'open' ? 'tag-success' : 'tag'}
                style={{ backdropFilter: 'blur(8px)' }}>
                {project.status === 'open' ? '● Open' : 'Closed'}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)' }}>
                by {creator ? creator.name : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Project info card */}
      <div style={{
        background: 'var(--surface-container)',
        borderRadius: '1.25rem',
        padding: '1.875rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(255, 77, 77, 0.04)',
        boxShadow: 'var(--shadow-ambient)',
      }}>
        {/* Title row (shown when no image) */}
        {!project.imageUrl && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.375rem', gap: '1rem' }}>
            <h1 className="headline" style={{ color: 'var(--on-surface)' }}>{project.title}</h1>
            <span className={project.status === 'open' ? 'tag-success' : 'tag'} style={{ flexShrink: 0, marginTop: '0.25rem' }}>
              {project.status === 'open' ? '● Open' : 'Closed'}
            </span>
          </div>
        )}
        {!project.imageUrl && (
          <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            by <span style={{ color: 'var(--on-surface-variant)' }}>{creator ? creator.name : 'Unknown'}</span>
          </p>
        )}

        <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          {project.description}
        </p>

        {/* Tech stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: project.groupLink ? '1.25rem' : 0,
          }}>
            {project.techStack.map(function(tech, i) {
              return <span key={i} className="tag">{tech}</span>;
            })}
          </div>
        )}

        {/* Group link */}
        {project.groupLink && (
          <div style={{ marginTop: '1.25rem' }}>
            <p className="input-label" style={{ marginBottom: '0.75rem' }}>Team / Group</p>
            <a
              href={project.groupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              Open invite link →
            </a>
          </div>
        )}

        {/* Creator bio */}
        {creator && creator.bio && (
          <div style={{
            borderTop: '1px solid rgba(60, 68, 85, 0.2)',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
          }}>
            <p className="input-label" style={{ marginBottom: '0.625rem' }}>About the creator</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <div style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-dim), var(--primary-container))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {creator.name ? creator.name[0].toUpperCase() : '?'}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  {creator.name}
                </p>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {creator.bio}
                </p>
                {creator.skills && creator.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.625rem' }}>
                    {creator.skills.map(function(s, i) { return <span key={i} className="tag">{s}</span>; })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Q&A section */}
      <div style={{
        background: 'var(--surface-container)',
        borderRadius: '1.25rem',
        padding: '1.875rem',
        border: '1px solid rgba(255, 77, 77, 0.04)',
        boxShadow: 'var(--shadow-ambient)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--on-surface)',
            letterSpacing: '-0.01em',
          }}>
            Public Q&amp;A
          </h2>
          {questions.length > 0 && (
            <span style={{
              background: 'rgba(255, 77, 77, 0.1)',
              color: 'var(--primary-dim)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.1875rem 0.5625rem',
              borderRadius: '99px',
              border: '1px solid rgba(255, 77, 77, 0.15)',
            }}>
              {questions.length}
            </span>
          )}
        </div>

        {/* Question form */}
        <form onSubmit={handlePostQuestion} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          marginBottom: '2rem',
          background: 'var(--surface-high)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}>
          <label className="input-label" style={{ marginBottom: '0.25rem' }}>Ask a question</label>
          <textarea
            value={questionText}
            onChange={function(e) { setQuestionText(e.target.value); }}
            rows={2}
            placeholder="What would you like to know about this project?"
            style={{ resize: 'none' }}
            className="input-field"
          />
          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.8125rem', display: 'flex', gap: '0.375rem' }}>
              <span>⚠</span> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={posting || !questionText.trim()}
            className="btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {posting ? 'Posting…' : 'Post Question'}
          </button>
        </form>

        {/* Questions list */}
        {questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
              No questions yet
            </p>
            <p style={{ fontSize: '0.8125rem' }}>Be the first to ask!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map(function(q, index) {
              const authorName = q.authorId && q.authorId.name ? q.authorId.name : 'Anonymous';
              const authorIdStr = q.authorId && q.authorId._id != null ? String(q.authorId._id) : '';
              const userIdStr = user && user.id != null ? String(user.id) : '';
              const isOwn = user && authorIdStr && userIdStr && authorIdStr === userIdStr;
              const date = new Date(q.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              });
              const hasAnswer = q.answer && String(q.answer).trim() !== '';
              return (
                <div key={q._id} className="animate-fade-up" style={{
                  background: 'var(--surface-high)',
                  borderRadius: '0.875rem',
                  padding: '1rem 1.125rem',
                  animationDelay: (index * 0.04) + 's',
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        background: isOwn
                          ? 'linear-gradient(135deg, var(--primary-dim), var(--primary-container))'
                          : 'var(--surface-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: isOwn ? 'white' : 'var(--secondary)',
                      }}>
                        {isOwn ? 'Y' : authorName[0].toUpperCase()}
                      </span>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: isOwn ? 'var(--primary-dim)' : 'var(--on-surface)',
                      }}>
                        {isOwn ? 'You' : authorName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--secondary)' }}>{date}</span>
                  </div>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{q.text}</p>
                  {hasAnswer && (
                    <div className="qa-answer">
                      <p className="qa-answer-label">Creator reply</p>
                      <p className="qa-answer-text">{q.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailPage;
