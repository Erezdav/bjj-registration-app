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
  try {
    // Check if the admin code is correct
    const isAdmin = adminCode === 'pitbullRoee2025';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // The critical part - create a profile with a BIGINT id
      // Since Supabase auth uses UUID, we need a different approach
      
      // Option 1: Generate a numeric ID for the profile
      // Get the highest current id in profiles table
      const { data: maxIdData } = await supabase
        .from('profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      // Calculate new ID
      const newId = maxIdData && maxIdData.length > 0 
        ? Number(maxIdData[0].id) + 1 
        : 1;
      
      // Insert the profile with the new numeric ID
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: newId,  // Use a numeric ID
            email: email,  // Store the email for reference
            name,
            belt,
            is_admin: isAdmin,
          },
        ]);

      if (profileError) throw profileError;

      set({ 
        user: authData.user,
        profile: {
          id: newId,  // Use the numeric ID
          name,
          belt,
          isAdmin: isAdmin,
        }
      });
    }
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}
  signIn: async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Find the profile by email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, belt, is_admin')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Error finding profile:', profileError);
      throw new Error('Could not find user profile. Please try again.');
    }

    set({ 
      user: data.user, 
      profile: {
        id: profileData.id,  // This is the numeric ID
        name: profileData.name,
        belt: profileData.belt,
        isAdmin: profileData.is_admin || false,
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

 loadProfile: async () => {
  const { user } = get();
  if (!user) return;

  try {
    // Find the profile by email
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
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
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}
  },
}));
