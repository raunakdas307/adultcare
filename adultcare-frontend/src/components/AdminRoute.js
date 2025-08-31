import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading'); 

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setStatus('deny');
      return;
    }
    (async () => {
      try {
        const me = await axios.get('http://127.0.0.1:8000/api/users/me/', {
          headers: { Authorization: `Token ${token}` },
        });
        setStatus(me.data?.role === 'admin' ? 'allow' : 'deny');
      } catch {
        setStatus('deny');
      }
    })();
  }, []);

  if (status === 'loading') return null; 
  if (status === 'deny') return <Navigate to="/login" replace />;
  return children;
}
