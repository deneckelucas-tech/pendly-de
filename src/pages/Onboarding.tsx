import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/route-setup', { replace: true });
  }, [navigate]);
  return null;
}
