import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { feedAtom } from '../atoms/feedAtom';
import { getFeed, recordSwipe } from '../api/index';
import ProjectCard from '../components/ProjectCard';

function FeedPage() {
  const [feed, setFeed] = useAtom(feedAtom);

  useEffect(function() {
    if (feed.length === 0) {
      getFeed()
        .then(function(res) {
          setFeed(res.data);
        })
        .catch(function(err) {
          console.error('Failed to load feed:', err.message);
        });
    }
  }, []);

  function handleSwipe(projectId, action) {
    recordSwipe(projectId, action)
      .then(function() {
        setFeed(function(prev) {
          return prev.filter(function(p) { return p._id !== projectId; });
        });
      })
      .catch(function(err) {
        console.error('Swipe failed:', err.message);
      });
  }

  function handleInterested(projectId) {
    handleSwipe(projectId, 'interested');
  }

  function handlePass(projectId) {
    handleSwipe(projectId, 'pass');
  }

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">You're all caught up!</h2>
        <p className="text-sm text-gray-500">No more projects to review. Check back later or post your own from the Dashboard.</p>
      </div>
    );
  }

  const topProject = feed[0];

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <p className="text-sm text-gray-400 mb-6">{feed.length} project{feed.length !== 1 ? 's' : ''} in your feed</p>
      <ProjectCard
        project={topProject}
        onInterested={handleInterested}
        onPass={handlePass}
        showActions={true}
      />
      {feed.length > 1 && (
        <p className="text-xs text-gray-400 mt-4">+{feed.length - 1} more after this</p>
      )}
    </div>
  );
}

export default FeedPage;
