import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { feedAtom } from '../atoms/feedAtom';
import { getFeed, recordSwipe } from '../api/index';
import ProjectCard from '../components/ProjectCard';

function FeedPage() {
  const [feed, setFeed] = useAtom(feedAtom);
  const navigate = useNavigate();

  useEffect(function() {
    if (feed.length === 0) {
      getFeed()
        .then(function(res) { setFeed(res.data); })
        .catch(function(err) { console.error('Failed to load feed:', err.message); });
    }
  }, []);

  function handleSwipe(projectId, action) {
    recordSwipe(projectId, action)
      .then(function() {
        setFeed(function(prev) {
          return prev.filter(function(p) { return p._id !== projectId; });
        });
      })
      .catch(function(err) { console.error('Swipe failed:', err.message); });
  }

  function handleInterested(projectId) { handleSwipe(projectId, 'interested'); }
  function handlePass(projectId) { handleSwipe(projectId, 'pass'); }

  if (feed.length === 0) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
      }}>
        <div className="animate-float" style={{
          background: 'var(--surface-container)',
          border: '1px solid rgba(184, 181, 255, 0.08)',
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 0 40px rgba(184, 181, 255, 0.08)',
        }}>🎉</div>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--on-surface)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}>You're all caught up!</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--secondary)', lineHeight: 1.65, maxWidth: '320px' }}>
          No more projects in your feed. Check back later or post your own from Dashboard.
        </p>
        <button
          onClick={function() { navigate('/dashboard'); }}
          className="btn-primary"
          style={{ marginTop: '1.75rem' }}
        >
          + Post a Project
        </button>
      </div>
    );
  }

  const topProject = feed[0];

  return (
    <div style={{
      maxWidth: '560px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem 4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Feed counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        background: 'var(--surface-container)',
        borderRadius: '2rem',
        padding: '0.375rem 1rem',
        border: '1px solid var(--outline-variant)',
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
          {feed.length} project{feed.length !== 1 ? 's' : ''} in your feed
        </span>
      </div>

      {/* Project card */}
      <div className="animate-fade-up" style={{ width: '100%' }}>
        <ProjectCard
          project={topProject}
          onInterested={handleInterested}
          onPass={handlePass}
          showActions={false}
        />
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: '2rem',
        gap: '2rem',
      }}>
        {/* Pass */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { handlePass(topProject._id); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-surface-variant)',
              fontSize: '1.375rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.background = 'var(--surface-high)';
              e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)';
              e.currentTarget.style.color = 'var(--error)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.background = 'var(--surface-container)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
              e.currentTarget.style.color = 'var(--on-surface-variant)';
            }}
          >
            ✕
          </button>
          <span className="label-sm" style={{ color: 'var(--secondary)' }}>SKIP</span>
        </div>

        {/* Interested (larger, center) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { handleInterested(topProject._id); }}
            className="animate-pulse-ring"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.75rem',
              boxShadow: '0 8px 30px rgba(46, 31, 196, 0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(46, 31, 196, 0.6)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(46, 31, 196, 0.45)';
            }}
          >
            ⚡
          </button>
          <span className="label-sm" style={{ color: 'var(--primary)' }}>INTERESTED</span>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { navigate('/projects/' + topProject._id); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-surface-variant)',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.background = 'var(--surface-high)';
              e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(184, 181, 255, 0.3)';
              e.currentTarget.style.color = 'var(--primary-dim)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.background = 'var(--surface-container)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
              e.currentTarget.style.color = 'var(--on-surface-variant)';
            }}
          >
            →
          </button>
          <span className="label-sm" style={{ color: 'var(--secondary)' }}>DETAILS</span>
        </div>
      </div>

      {feed.length > 1 && (
        <p style={{
          color: 'var(--secondary)',
          fontSize: '0.75rem',
          marginTop: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{
            display: 'flex',
            gap: '3px',
          }}>
            {Array.from({ length: Math.min(feed.length - 1, 4) }).map(function(_, i) {
              return (
                <span key={i} style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--surface-bright)',
                }} />
              );
            })}
          </span>
          +{feed.length - 1} more after this
        </p>
      )}
    </div>
  );
}

export default FeedPage;
