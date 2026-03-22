import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { useEffect, useState } from 'react';
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
      getQuestions(projectId)
    ])
      .then(function(results) {
        setProject(results[0].data);
        setQuestions(results[1].data);
      })
      .catch(function(err) {
        setError('Failed to load project');
        console.error(err.message);
      })
      .finally(function() {
        setLoading(false);
      });
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
          ? err.response.data.error
          : 'Failed to post question';
        setError(msg);
      })
      .finally(function() {
        setPosting(false);
      });
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">{error || 'Project not found'}</p>
        <Link to="/feed" className="text-indigo-500 text-sm mt-2 inline-block hover:underline">← Back to Feed</Link>
      </div>
    );
  }

  const creator = project.creatorId;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/feed" className="text-sm text-indigo-500 hover:text-indigo-700 mb-4 inline-block transition-colors">
        ← Back to Feed
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">by {creator ? creator.name : 'Unknown'}</p>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{project.description}</p>

        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(function(tech, i) {
              return (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium">
                  {tech}
                </span>
              );
            })}
          </div>
        )}

        {creator && creator.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">About the creator</p>
            <p className="text-sm text-gray-600">{creator.bio}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Public Q&amp;A <span className="text-gray-400 font-normal">({questions.length})</span>
        </h2>

        <form onSubmit={handlePostQuestion} className="mb-5">
          <textarea
            value={questionText}
            onChange={function(e) { setQuestionText(e.target.value); }}
            rows={2}
            placeholder="Ask a question about this project…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-2"
          />
          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={posting || !questionText.trim()}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
          >
            {posting ? 'Posting…' : 'Post Question'}
          </button>
        </form>

        {questions.length === 0 && (
          <p className="text-sm text-gray-400">No questions yet. Be the first to ask!</p>
        )}

        <div className="space-y-3">
          {questions.map(function(q) {
            const authorName = q.authorId && q.authorId.name ? q.authorId.name : 'Anonymous';
            const isOwn = user && q.authorId && q.authorId._id === user.id;
            const date = new Date(q.timestamp).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
            return (
              <div key={q._id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isOwn ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {isOwn ? 'You' : authorName}
                  </span>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
                <p className="text-sm text-gray-800">{q.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
