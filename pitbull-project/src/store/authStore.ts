// src/store/authStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: {
    id: string;
    name: string;
    belt: string;
    isAdmin: boolean;
  } | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name: string, belt: string, adminCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Check if there's a session
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        set({ user: data.session.user });
        await get().loadProfile();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, name: string, belt: string, adminCode?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Check if the admin code is correct
    const isAdmin = adminCode === 'pitbullRoee2025';

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            belt,
            is_admin: isAdmin,
          },
        ]);

      if (profileError) throw profileError;

      set({ 
        user: authData.user,
        profile: {
          id: authData.user.id,
          name,
          belt,
          isAdmin: isAdmin,
        }
      });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    set({ user: data.user });
    await get().loadProfile();
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    if (data) {
      set({ 
        profile: {
          id: data.id,
          name: data.name,
          belt: data.belt,
          isAdmin: data.is_admin || false,
        }
      });
    }
  },
}));
