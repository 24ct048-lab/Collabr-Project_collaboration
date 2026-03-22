import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const user = useAtomValue(userAtom);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
