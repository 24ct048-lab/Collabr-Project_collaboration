import { useState, useEffect } from 'react';
import { updateProject } from '../api/index';

function EditProjectModal({ project, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(function() {
    if (!project) {
      return;
    }
    setTitle(project.title || '');
    setDescription(project.description || '');
    setTechStack(
      project.techStack && project.techStack.length > 0
        ? project.techStack.join(', ')
        : ''
    );
    setImageUrl(project.imageUrl || '');
    setGroupLink(project.groupLink || '');
    setError('');
  }, [project]);

  useEffect(function() {
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return function() {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!project) {
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const techArray = techStack
      .split(',')
      .map(function(t) {
        return t.trim();
      })
      .filter(function(t) {
        return t.length > 0;
      });

    updateProject(project._id, {
      title: title.trim(),
      description: description.trim(),
      techStack: techArray,
      imageUrl: imageUrl.trim(),
      groupLink: groupLink.trim()
    })
      .then(function(res) {
        onSaved(res.data);
        onClose();
      })
      .catch(function(err) {
        const msg =
          err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : 'Failed to update project';
        setError(msg);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(12, 14, 18, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={function(e) {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--surface-container)',
          borderRadius: '1rem',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--outline-variant)'
        }}
        onClick={function(e) {
          e.stopPropagation();
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <h2 className="title-md" style={{ color: 'var(--on-surface)' }}>
            Manage Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
          >
            Close
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label className="input-label">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={function(e) {
                setTitle(e.target.value);
              }}
              required
              placeholder="Enter a catchy title"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              value={description}
              onChange={function(e) {
                setDescription(e.target.value);
              }}
              required
              rows={3}
              placeholder="What are you building?"
              className="input-field"
              style={{ resize: 'none' }}
            />
          </div>
          <div>
            <label className="input-label">Tech Stack</label>
            <input
              type="text"
              value={techStack}
              onChange={function(e) {
                setTechStack(e.target.value);
              }}
              placeholder="React, Node.js (comma-separated)"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Project Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={function(e) {
                setImageUrl(e.target.value);
              }}
              placeholder="https://..."
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Group Link (Optional)</label>
            <input
              type="url"
              value={groupLink}
              onChange={function(e) {
                setGroupLink(e.target.value);
              }}
              placeholder="Discord, WhatsApp, or Telegram link"
              className="input-field"
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--error-dim)',
              color: 'var(--error)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              marginTop: '1rem'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProjectModal;
