import { useState, useEffect } from 'react';
import { getIdeas, createIdea } from '../api/index';

function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('explore');

  useEffect(function() {
    getIdeas()
      .then(function(res) { setIdeas(res.data); })
      .catch(function(err) { console.error(err); })
      .finally(function() { setListLoading(false); });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    const tagsArray = tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    createIdea({ title: title, description: description, tags: tagsArray })
      .then(function(res) {
        setIdeas(function(prev) { return [res.data, ...prev]; });
        setTitle('');
        setDescription('');
        setTags('');
        setActiveSection('explore');
      })
      .catch(function(err) {
        setFormError(err.response && err.response.data && err.response.data.error
          ? err.response.data.error : 'Failed to share idea');
      })
      .finally(function() { setFormLoading(false); });
  }

  /* Gradient accent colors for idea cards */
  const cardAccents = [
    'rgba(184, 181, 255, 0.06)',
    'rgba(61, 214, 140, 0.05)',
    'rgba(251, 191, 36, 0.05)',
    'rgba(248, 113, 113, 0.05)',
    'rgba(99, 179, 237, 0.05)',
    'rgba(167, 139, 250, 0.05)',
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.75rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-2rem',
          left: '-1rem',
          width: '300px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(46,31,196,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '0.625rem' }}>COLLABR STUDIO</p>
        <h1 className="display-md" style={{ color: 'var(--on-surface)', marginBottom: '0.625rem' }}>
          Idea Vault
          <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>⚡</span>
        </h1>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem', maxWidth: '480px', lineHeight: 1.65 }}>
          Cast your spark into the vault. No clutter — just the essence of your next project idea.
        </p>
      </div>

      {/* Section toggle */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--surface-container)',
        borderRadius: '0.875rem',
        padding: '0.25rem',
        marginBottom: '2rem',
        border: '1px solid var(--outline-variant)',
        gap: '0.25rem',
      }}>
        {[
          { key: 'explore', label: 'Explore Ideas' },
          { key: 'share', label: 'Share a Spark ⚡' },
        ].map(function(item) {
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={function() { setActiveSection(item.key); }}
              style={{
                padding: '0.4375rem 1.125rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: active ? 'var(--surface-highest)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--secondary)',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: active ? 'inset 0 0 0 1px rgba(184,181,255,0.1)' : 'none',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Share section */}
      {activeSection === 'share' && (
        <form onSubmit={handleSubmit} className="animate-scale-in" style={{
          background: 'var(--surface-container)',
          borderRadius: '1.25rem',
          padding: '2rem',
          maxWidth: '580px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.375rem',
          border: '1px solid rgba(184, 181, 255, 0.06)',
          boxShadow: 'var(--shadow-ambient)',
        }}>
          <div style={{ marginBottom: '-0.5rem' }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: '0.375rem',
            }}>
              Drop your spark
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
              Share the raw essence of your idea — no pitch deck needed.
            </p>
          </div>

          <div>
            <label className="input-label">THE HOOK</label>
            <input
              type="text"
              className="input-field"
              placeholder="What's the lightning bolt?"
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              required
            />
          </div>

          <div>
            <label className="input-label">THE VISION</label>
            <textarea
              className="input-field"
              rows={4}
              style={{ resize: 'none' }}
              placeholder="Paint the picture…"
              value={description}
              onChange={function(e) { setDescription(e.target.value); }}
              required
            />
          </div>

          <div>
            <label className="input-label">TAGS</label>
            <input
              type="text"
              className="input-field"
              placeholder="AI, Social, Fintech (comma-separated)"
              value={tags}
              onChange={function(e) { setTags(e.target.value); }}
            />
          </div>

          {formError && (
            <div style={{
              background: 'var(--error-dim)',
              color: 'var(--error)',
              borderRadius: '0.75rem',
              padding: '0.625rem 0.9375rem',
              fontSize: '0.8125rem',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              display: 'flex',
              gap: '0.5rem',
            }}>
              <span>⚠</span> {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.8125rem' }}
          >
            {formLoading
              ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Releasing…</>
              : 'Release to Vault ⚡'
            }
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic', marginTop: '-0.5rem' }}>
            Your idea will be shared with the community.
          </p>
        </form>
      )}

      {/* Explore section */}
      {activeSection === 'explore' && (
        <div className="animate-fade-up">
          {listLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: '28px', height: '28px' }} />
            </div>
          ) : ideas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--surface-container)',
              borderRadius: '1.25rem',
              border: '1px solid var(--outline-variant)',
            }}>
              <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>💡</div>
              <p style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No ideas yet
              </p>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                Be the first to share one!
              </p>
              <button onClick={function() { setActiveSection('share'); }} className="btn-primary">
                Share a Spark ⚡
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}>
                <p className="label-md" style={{ color: 'var(--secondary)' }}>
                  {ideas.length} idea{ideas.length !== 1 ? 's' : ''} in the vault
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.125rem',
              }}>
                {ideas.map(function(idea, index) {
                  const date = new Date(idea.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  });
                  const accentColor = cardAccents[index % cardAccents.length];
                  return (
                    <div
                      key={idea._id}
                      className="animate-fade-up"
                      style={{
                        background: 'var(--surface-container)',
                        borderRadius: '1rem',
                        padding: '1.375rem',
                        transition: 'all 0.25s ease',
                        border: '1px solid rgba(184, 181, 255, 0.04)',
                        cursor: 'default',
                        position: 'relative',
                        overflow: 'hidden',
                        animationDelay: (index * 0.04) + 's',
                        opacity: 0,
                        animationFillMode: 'forwards',
                      }}
                      onMouseEnter={function(e) {
                        e.currentTarget.style.background = 'var(--surface-high)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={function(e) {
                        e.currentTarget.style.background = 'var(--surface-container)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Accent glow corner */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '80px',
                        height: '80px',
                        background: `radial-gradient(ellipse at 100% 0%, ${accentColor} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                      }} />

                      <h3 className="title-md" style={{
                        color: 'var(--on-surface)',
                        marginBottom: '0.5rem',
                        lineHeight: 1.35,
                        letterSpacing: '-0.01em',
                      }}>
                        {idea.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--on-surface-variant)',
                        lineHeight: 1.65,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: idea.tags && idea.tags.length > 0 ? '0.875rem' : '1rem',
                      }}>
                        {idea.description}
                      </p>

                      {idea.tags && idea.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                          {idea.tags.map(function(tag) {
                            return <span key={tag} className="tag">{tag}</span>;
                          })}
                        </div>
                      )}

                      <div style={{
                        borderTop: '1px solid rgba(60, 68, 85, 0.18)',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '1.375rem',
                            height: '1.375rem',
                            borderRadius: '50%',
                            background: 'var(--surface-bright)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: 'var(--secondary)',
                          }}>
                            {idea.authorId && idea.authorId.name ? idea.authorId.name[0].toUpperCase() : '?'}
                          </span>
                          <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
                            {idea.authorId && idea.authorId.name ? idea.authorId.name : 'Unknown'}
                          </span>
                        </div>
                        <span style={{ color: 'var(--secondary)', fontSize: '0.6875rem' }}>{date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IdeasPage;
