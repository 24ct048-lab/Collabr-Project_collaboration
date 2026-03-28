import { useEffect, useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { feedAtom } from '../atoms/feedAtom';
import { getFeed, recordSwipe } from '../api/index';

/*
  Feed — Tinder/Bumble/Insta hybrid
  • Full-height immersive card with gradient overlay
  • Card stack (next card visible behind)
  • Animated swipe: skip = slide left, interested = slide right
  • Big thumb-friendly action buttons
  • Quick-info pill strip along bottom of image
*/

function FeedPage() {
  const [feed, setFeed] = useAtom(feedAtom);
  const [swipeDir, setSwipeDir] = useState(null); // 'left' | 'right'
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(function() {
    if (feed.length === 0) {
      getFeed()
        .then(function(res) { setFeed(res.data); })
        .catch(function(err) { console.error('Failed to load feed:', err.message); });
    }
  }, []);

  function triggerSwipe(dir, projectId, action) {
    setSwipeDir(dir);
    setTimeout(function() {
      recordSwipe(projectId, action).catch(function(err) { console.error(err.message); });
      setFeed(function(prev) { return prev.filter(function(p) { return p._id !== projectId; }); });
      setSwipeDir(null);
    }, 380);
  }

  function handleInterested(projectId) { triggerSwipe('right', projectId, 'interested'); }
  function handlePass(projectId) { triggerSwipe('left', projectId, 'pass'); }

  /* ── Empty state ── */
  if (feed.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 3.75rem)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div className="animate-float" style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(184,181,255,0.12) 0%, rgba(46,31,196,0.12) 100%)',
          border: '1px solid rgba(184,181,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.75rem',
          marginBottom: '2rem',
          boxShadow: '0 0 60px rgba(184,181,255,0.08)',
        }}>🎉</div>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
          fontWeight: 700,
          color: 'var(--on-surface)',
          letterSpacing: '-0.025em',
          marginBottom: '0.75rem',
        }}>
          You've seen it all
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: '300px', marginBottom: '2rem' }}>
          Your feed is empty. Revisit tomorrow or publish your own project.
        </p>
        <button onClick={function() { navigate('/dashboard'); }} className="btn-primary">
          + Post a Project
        </button>
      </div>
    );
  }

  const topProject = feed[0];
  const nextProject = feed[1];
  const creator = topProject.creatorId;
  const creatorName = creator && creator.name ? creator.name : 'Unknown';
  const creatorInitial = creatorName[0].toUpperCase();

  /* Placeholder gradient when no image */
  const gradients = [
    'linear-gradient(135deg, #1a1040 0%, #2e1fc4 60%, #0c0e12 100%)',
    'linear-gradient(135deg, #0a2040 0%, #0d5c63 60%, #0c0e12 100%)',
    'linear-gradient(135deg, #1a0b30 0%, #6b21a8 60%, #0c0e12 100%)',
    'linear-gradient(135deg, #0b2a1e 0%, #065f46 60%, #0c0e12 100%)',
  ];
  const placeholderGradient = gradients[feed.length % gradients.length];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: 'calc(100vh - 3.75rem)',
      padding: '1.5rem 1rem 2rem',
      position: 'relative',
    }}>

      {/* ── Card stack container ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        marginTop: '0.5rem',
      }}>

        {/* Behind card (next project, peeking) */}
        {nextProject && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%) scale(0.95)',
            width: '100%',
            height: '520px',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            background: nextProject.imageUrl ? 'var(--surface-high)' : placeholderGradient,
            zIndex: 0,
            filter: 'brightness(0.7)',
          }}>
            {nextProject.imageUrl && (
              <img src={nextProject.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        )}

        {/* Main card */}
        <div
          ref={cardRef}
          className={
            swipeDir === 'left' ? 'animate-swipe-left' :
            swipeDir === 'right' ? 'animate-swipe-right' :
            'animate-card-reveal'
          }
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '520px',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            background: topProject.imageUrl ? 'var(--surface-high)' : placeholderGradient,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 4px 24px rgba(184,181,255,0.06)',
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          {/* Image */}
          {topProject.imageUrl && (
            <img
              src={topProject.imageUrl}
              alt={topProject.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={function(e) { e.target.style.display = 'none'; }}
            />
          )}

          {/* Swipe overlay indicators */}
          {swipeDir === 'right' && (
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              zIndex: 10,
              background: 'rgba(61, 214, 140, 0.95)',
              color: 'white',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: '1.125rem',
              letterSpacing: '0.1em',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '3px solid white',
              transform: 'rotate(-12deg)',
            }}>
              INTERESTED ⚡
            </div>
          )}
          {swipeDir === 'left' && (
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 10,
              background: 'rgba(248, 113, 113, 0.95)',
              color: 'white',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: '1.125rem',
              letterSpacing: '0.1em',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '3px solid white',
              transform: 'rotate(12deg)',
            }}>
              SKIP ✕
            </div>
          )}

          {/* Top gradient + status */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to bottom, rgba(8,9,12,0.7) 0%, transparent 100%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-start',
            padding: '1rem',
            gap: '0.5rem',
          }}>
            {/* Status pill */}
            <span style={{
              background: topProject.status === 'open'
                ? 'rgba(61,214,140,0.9)'
                : 'rgba(255,255,255,0.15)',
              color: 'white',
              backdropFilter: 'blur(8px)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.625rem',
              borderRadius: '99px',
            }}>
              {topProject.status === 'open' ? '● Open' : 'Closed'}
            </span>
          </div>

          {/* Bottom gradient + info */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(8,9,12,0.97) 0%, rgba(8,9,12,0.8) 50%, transparent 100%)',
            padding: '2.5rem 1.375rem 1.375rem',
            zIndex: 2,
          }}>
            {/* Tech tags */}
            {topProject.techStack && topProject.techStack.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                {topProject.techStack.slice(0, 4).map(function(tech, i) {
                  return (
                    <span key={i} style={{
                      background: 'rgba(184,181,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--primary)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.5625rem',
                      borderRadius: '99px',
                      border: '1px solid rgba(184,181,255,0.2)',
                    }}>
                      {tech}
                    </span>
                  );
                })}
                {topProject.techStack.length > 4 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '99px',
                  }}>
                    +{topProject.techStack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}>
              {topProject.title}
            </h2>

            {/* Creator row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-dim), var(--primary-container))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}>
                {creatorInitial}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 500 }}>
                {creatorName}
              </span>
              {creator && creator.skills && creator.skills.length > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                  · {creator.skills[0]}
                </span>
              )}
            </div>

            {/* Description preview */}
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              {topProject.description}
            </p>

            {/* View details link */}
            <button
              onClick={function() { navigate('/projects/' + topProject._id); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-dim)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--primary-dim)'; }}
            >
              View full details →
            </button>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '2rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Skip */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { handlePass(topProject._id); }}
            disabled={!!swipeDir}
            title="Skip"
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '50%',
              background: 'var(--surface-container)',
              border: '1.5px solid rgba(248,113,113,0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.375rem',
              color: 'var(--error)',
              boxShadow: '0 4px 20px rgba(248,113,113,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(248,113,113,0.3)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.background = 'var(--surface-container)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(248,113,113,0.15)';
            }}
          >
            ✕
          </button>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
            SKIP
          </span>
        </div>

        {/* Details — center, medium */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { navigate('/projects/' + topProject._id); }}
            title="View Details"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--surface-container)',
              border: '1.5px solid var(--outline-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
              color: 'var(--on-surface-variant)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.background = 'var(--surface-high)';
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.color = 'var(--primary-dim)';
              e.currentTarget.style.borderColor = 'rgba(184,181,255,0.3)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.background = 'var(--surface-container)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = 'var(--on-surface-variant)';
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
            }}
          >
            →
          </button>
          <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
            INFO
          </span>
        </div>

        {/* Interested — large, glowing */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={function() { handleInterested(topProject._id); }}
            disabled={!!swipeDir}
            title="Interested"
            className={!swipeDir ? 'animate-pulse-ring' : ''}
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #b8b5ff 0%, #2e1fc4 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white',
              boxShadow: '0 8px 32px rgba(46,31,196,0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.transform = 'scale(1.12)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(46,31,196,0.7)';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(46,31,196,0.5)';
            }}
          >
            ⚡
          </button>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary)' }}>
            INTERESTED
          </span>
        </div>
      </div>

      {/* ── Stack indicator dots ── */}
      {feed.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginTop: '1.5rem',
        }}>
          {Array.from({ length: Math.min(feed.length, 5) }).map(function(_, i) {
            return (
              <span key={i} style={{
                width: i === 0 ? '20px' : '6px',
                height: '6px',
                borderRadius: '99px',
                background: i === 0 ? 'var(--primary)' : 'var(--surface-bright)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            );
          })}
          {feed.length > 5 && (
            <span style={{ color: 'var(--secondary)', fontSize: '0.6875rem', marginLeft: '0.25rem' }}>
              +{feed.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FeedPage;
