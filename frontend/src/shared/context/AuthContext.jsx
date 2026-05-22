import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('guest');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check localStorage for cached role first (backend is source of truth)
        const cachedRole = localStorage.getItem('userRole');
        if (cachedRole) {
          setRole(cachedRole);
        } else {
          setRole('user');
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const cachedRole = localStorage.getItem('userRole');
        if (cachedRole) {
          setRole(cachedRole);
        } else {
          setRole('user');
        }
      } else {
        setRole('guest');
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    role,
    setRole, // Allow handlers to update role if fetched from backend
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    signOut: async () => {
      localStorage.removeItem('userRole');
      localStorage.removeItem('isLogin');
      localStorage.removeItem('nickname');
      localStorage.removeItem('avatar_url');
      localStorage.removeItem('mood');
      localStorage.removeItem('mood_date');
      localStorage.removeItem('has_rated_test');
      sessionStorage.removeItem('latest_diagnosis');
      sessionStorage.removeItem('pending_answers');
      sessionStorage.removeItem('quiz_active');
      sessionStorage.removeItem('quiz_draft');
      await supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#fcfbfe',
          fontFamily: "'Poppins', sans-serif"
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ddff',
            borderTop: '4px solid #8a5cff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
