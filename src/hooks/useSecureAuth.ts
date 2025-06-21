
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { RoleService, UserRole } from "@/services/roleService";
import { toast } from "sonner";

interface SecureAuthState {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
}

export function useSecureAuth() {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    role: null,
    isAdmin: false,
    loading: true,
    initialized: false
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Defer role checking to avoid blocking auth state updates
          setTimeout(async () => {
            try {
              const userRole = await RoleService.getCurrentUserRole();
              const isAdmin = userRole === 'admin';
              
              setAuthState({
                user: session.user,
                role: userRole,
                isAdmin,
                loading: false,
                initialized: true
              });
            } catch (error) {
              console.error('Error fetching user role:', error);
              setAuthState({
                user: session.user,
                role: 'user', // Default to user role on error
                isAdmin: false,
                loading: false,
                initialized: true
              });
            }
          }, 0);
        } else {
          setAuthState({
            user: null,
            role: null,
            isAdmin: false,
            loading: false,
            initialized: true
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        RoleService.getCurrentUserRole().then(userRole => {
          setAuthState({
            user: session.user,
            role: userRole,
            isAdmin: userRole === 'admin',
            loading: false,
            initialized: true
          });
        }).catch(error => {
          console.error('Error fetching user role:', error);
          setAuthState({
            user: session.user,
            role: 'user',
            isAdmin: false,
            loading: false,
            initialized: true
          });
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Check your email for the confirmation link!');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}
