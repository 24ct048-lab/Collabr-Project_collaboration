import { useEffect, useState } from 'react';
import { getMyProjects, createProject, getIncomingMatches, acceptMatch, updateProjectStatus } from '../api/index';
import ProjectCard from '../components/ProjectCard';

function DashboardPage() {
  const [myProjects, setMyProjects] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [revealedEmails, setRevealedEmails] = useState({});

  useEffect(function() {
    loadMyProjects();
    loadMatches();
  }, []);

  function loadMyProjects() {
    getMyProjects()
      .then(function(res) {
        setMyProjects(res.data);
      })
      .catch(function(err) {
        console.error('Failed to load projects:', err.message);
      });
  }

  function loadMatches() {
    getIncomingMatches()
      .then(function(res) {
        setMatches(res.data);
      })
      .catch(function(err) {
        console.error('Failed to load matches:', err.message);
      });
  }

  function handleCreateProject(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const techArray = techStack
      .split(',')
      .map(function(t) { return t.trim(); })
      .filter(function(t) { return t.length > 0; });

    createProject({ title: title, description: description, techStack: techArray })
      .then(function(res) {
        setMyProjects(function(prev) { return [res.data, ...prev]; });
        setTitle('');
        setDescription('');
        setTechStack('');
        setShowForm(false);
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Failed to create project';
        setFormError(msg);
      })
      .finally(function() {
        setFormLoading(false);
      });
  }

  function handleToggleStatus(project) {
    const newStatus = project.status === 'open' ? 'closed' : 'open';
    updateProjectStatus(project._id, newStatus)
      .then(function(res) {
        setMyProjects(function(prev) {
          return prev.map(function(p) {
            if (p._id === res.data._id) { return res.data; }
            return p;
          });
        });
      })
      .catch(function(err) {
        console.error('Status update failed:', err.message);
      });
  }

  function handleAccept(matchId) {
    acceptMatch(matchId)
      .then(function(res) {
        setMatches(function(prev) {
          return prev.map(function(m) {
            if (m._id === res.data._id) { return res.data; }
            return m;
          });
        });
        setRevealedEmails(function(prev) {
          const updated = Object.assign({}, prev);
          updated[matchId] = true;
          return updated;
        });
      })
      .catch(function(err) {
        console.error('Accept failed:', err.message);
      });
  }

  const pendingMatches = matches.filter(function(m) { return m.status === 'pending'; });
  const acceptedMatches = matches.filter(function(m) { return m.status === 'accepted'; });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Tabs */}
      <div className="flex border border-gray-200 rounded-lg p-1 mb-8 w-fit">
        <button
          onClick={function() { setActiveTab('projects'); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          My Projects
        </button>
        <button
          onClick={function() { setActiveTab('interested'); }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'interested' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Interested Users
          {pendingMatches.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {pendingMatches.length}
            </span>
          )}
        </button>
      </div>

      {/* My Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">Your Projects</h2>
            <button
              onClick={function() { setShowForm(function(prev) { return !prev; }); }}
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {showForm ? 'Cancel' : '+ New Project'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateProject} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={function(e) { setTitle(e.target.value); }}
                  required
                  placeholder="Project title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={function(e) { setDescription(e.target.value); }}
                  required
                  rows={3}
                  placeholder="What are you building?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={function(e) { setTechStack(e.target.value); }}
                  placeholder="React, Node.js, MongoDB (comma-separated)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className="bg-indigo-600 text-white px-5 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
              >
                {formLoading ? 'Creating…' : 'Create Project'}
              </button>
            </form>
          )}

          {myProjects.length === 0 && (
            <p className="text-sm text-gray-500 py-4">You haven't posted any projects yet.</p>
          )}

          <div className="space-y-4">
            {myProjects.map(function(project) {
              return (
                <div key={project._id} className="relative">
                  <ProjectCard project={project} showActions={false} />
                  <button
                    onClick={function() { handleToggleStatus(project); }}
                    className={`mt-2 text-xs px-3 py-1 rounded-full font-medium border transition-colors ${
                      project.status === 'open'
                        ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {project.status === 'open' ? 'Mark as Closed' : 'Reopen'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interested Users Tab */}
      {activeTab === 'interested' && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4">People Interested in Your Projects</h2>

          {matches.length === 0 && (
            <p className="text-sm text-gray-500 py-4">No one has expressed interest yet.</p>
          )}

          {pendingMatches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Pending</h3>
              <div className="space-y-3">
                {pendingMatches.map(function(match) {
                  const applicant = match.applicantId;
                  const project = match.projectId;
                  return (
                    <div key={match._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{applicant.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Interested in: <span className="font-medium text-gray-700">{project.title}</span>
                        </p>
                        {applicant.bio && (
                          <p className="text-xs text-gray-500 mt-1">{applicant.bio}</p>
                        )}
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {applicant.skills.map(function(skill, i) {
                              return (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{skill}</span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={function() { handleAccept(match._id); }}
                        className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium shrink-0"
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Accepted</h3>
              <div className="space-y-3">
                {acceptedMatches.map(function(match) {
                  const applicant = match.applicantId;
                  const project = match.projectId;
                  return (
                    <div key={match._id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{applicant.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Matched on: <span className="font-medium text-gray-700">{project.title}</span>
                          </p>
                          <p className="text-sm text-green-700 font-medium mt-2">
                            📧 {applicant.email}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Matched</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
