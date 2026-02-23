import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 如果指定了必需的角色，检查用户是否属于这些角色
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((requiredRole) =>
        user?.roles?.some((role) => role === requiredRole),
      );

      if (!hasRequiredRole) {
        navigate('/', { replace: true });
        return;
      }
    }

    // 用户已授权
    setAuthorized(true);
  }, [user, requiredRoles, navigate]);

  // 只有在授权通过后才渲染子组件
  return authorized ? children : null;
};

export default ProtectedRoute;
