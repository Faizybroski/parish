import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string, expectedRole: 'admin' | 'user') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('🚀 SignUp called with:', { email, role: metadata?.role });
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: metadata?.first_name,
          last_name: metadata?.last_name,
          instagram_username: metadata?.instagram_username,
          linkedin_username: metadata?.linkedin_username,
          role: 'user', // Always assign 'user' role during signup
          approval_status: 'pending'
        }
      }
    });
    
    console.log('📝 SignUp result:', { error });
    return { error };
  };

  const signIn = async (email: string, password: string, expectedRole: 'admin' | 'user'| 'superadmin') => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,

    });
    
    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: { message: 'Invalid login attempt' } };
    }

    // If login successful, redirect based on user role
      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) return { error: profileError };

      const articleMap: Record<'admin' | 'user', string> = {
        admin: 'an admin',
        user: 'a user',
      };

      if (profile?.role !== expectedRole) {
        await supabase.auth.signOut();
        return { error: { message: `${email} is not ${articleMap[expectedRole]}` } };
      }
      
      setTimeout(() => {
        switch (profile.role) {
          case 'superadmin':
            window.location.href = '/superadmin/dashboard';
            break;
          case 'admin':
            window.location.href = '/admin/dashboard';
            break;
          case 'user':
          default:
            window.location.href = '/user/dashboard';
            break;
        }
      }, 100); // Small delay to ensure auth state is updated
    
    return { error };
  }
    
  

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};