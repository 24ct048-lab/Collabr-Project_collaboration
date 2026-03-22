import { Link } from 'react-router-dom';

function ProjectCard({ project, onInterested, onPass, showActions }) {
  const creator = project.creatorId;
  const creatorName = creator && creator.name ? creator.name : 'Unknown';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">by {creatorName}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          project.status === 'open'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{project.description}</p>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map(function(tech, i) {
            return (
              <span
                key={i}
                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium"
              >
                {tech}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Link
          to={'/projects/' + project._id}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
        >
          View Q&amp;A →
        </Link>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={function() { onPass(project._id); }}
              className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Pass
            </button>
            <button
              onClick={function() { onInterested(project._id); }}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Interested
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;
