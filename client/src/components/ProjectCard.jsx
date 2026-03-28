import { Link } from 'react-router-dom';

function ProjectCard({ project, onInterested, onPass, showActions }) {
  const creator = project.creatorId;
  const creatorName = creator && creator.name ? creator.name : 'Unknown';

  return (
    <div style={{
      background: 'var(--surface-container)',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-ambient)',
      width: '100%',
      maxWidth: '480px',
      transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      border: '1px solid rgba(184, 181, 255, 0.04)',
    }}
    onMouseEnter={function(e) {
      e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      e.currentTarget.style.transform = 'translateY(-3px)';
    }}
    onMouseLeave={function(e) {
      e.currentTarget.style.boxShadow = 'var(--shadow-ambient)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Image hero */}
      {project.imageUrl ? (
        <div style={{
          width: '100%',
          height: '220px',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--surface-high)',
        }}>
          <img
            src={project.imageUrl}
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={function(e) { e.target.style.transform = 'scale(1.04)'; }}
            onMouseLeave={function(e) { e.target.style.transform = 'scale(1)'; }}
            onError={function(e) { e.target.style.display = 'none'; }}
          />
          {/* cinematic gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,9,12,0.1) 0%, rgba(8,9,12,0.7) 100%)',
          }} />
          {/* Tags overlay */}
          <div style={{
            position: 'absolute',
            top: '0.875rem',
            left: '0.875rem',
            display: 'flex',
            gap: '0.375rem',
            flexWrap: 'wrap',
          }}>
            {project.techStack && project.techStack.slice(0, 2).map(function(tech, i) {
              return (
                <span key={i} style={{
                  background: 'rgba(8, 9, 12, 0.7)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--primary)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.325rem',
                  border: '1px solid rgba(184, 181, 255, 0.15)',
                }}>
                  {tech}
                </span>
              );
            })}
          </div>
          {/* Status badge */}
          <div style={{
            position: 'absolute',
            top: '0.875rem',
            right: '0.875rem',
          }}>
            <span className={project.status === 'open' ? 'tag-success' : 'tag'}
              style={{ backdropFilter: 'blur(8px)', background: project.status === 'open' ? 'rgba(61,214,140,0.18)' : 'rgba(8,9,12,0.6)' }}>
              {project.status === 'open' ? '● Open' : 'Closed'}
            </span>
          </div>
        </div>
      ) : (
        /* No image — show a gradient placeholder */
        <div style={{
          width: '100%',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(46, 31, 196, 0.2) 0%, rgba(184, 181, 255, 0.05) 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '0.875rem',
            right: '0.875rem',
          }}>
            <span className={project.status === 'open' ? 'tag-success' : 'tag'}>
              {project.status === 'open' ? '● Open' : 'Closed'}
            </span>
          </div>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '1.25rem 1.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--on-surface)',
              letterSpacing: '-0.02em',
              marginBottom: '0.1875rem',
              lineHeight: 1.3,
            }}>
              {project.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 400 }}>
              by <span style={{ color: 'var(--on-surface-variant)' }}>{creatorName}</span>
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--on-surface-variant)',
          lineHeight: '1.65',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {project.description}
        </p>

        {/* Tech stack for no-image cards */}
        {!project.imageUrl && project.techStack && project.techStack.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            {project.techStack.map(function(tech, i) {
              return <span key={i} className="tag">{tech}</span>;
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.875rem',
          borderTop: '1px solid rgba(60, 68, 85, 0.18)',
        }}>
          <Link
            to={'/projects/' + project._id}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--primary-dim)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'color 0.15s ease, gap 0.15s ease',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.gap = '0.5rem';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.color = 'var(--primary-dim)';
              e.currentTarget.style.gap = '0.25rem';
            }}
          >
            View Details →
          </Link>

          {showActions && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={function() { onPass(project._id); }}
                className="btn-ghost"
                style={{ padding: '0.4375rem 1rem', fontSize: '0.8125rem' }}
              >
                Pass
              </button>
              <button
                onClick={function() { onInterested(project._id); }}
                className="btn-primary"
                style={{ padding: '0.4375rem 1.125rem', fontSize: '0.8125rem' }}
              >
                ⚡ Interested
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
