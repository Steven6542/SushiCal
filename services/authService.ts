import { supabase } from '../lib/supabaseClient';

export interface AuthUser {
    id: string;
    email?: string;
}

export interface UserProfile {
    id: string;
    language: string;
    currency: string;
}

/**
 * Convert username to internal email format
 * Users enter username, but we store as email internally for Supabase Auth
 */
const usernameToEmail = (username: string): string => {
    return `${username.toLowerCase()}@sushicalc.local`;
};

/**
 * Sign up a new user with username and password
 * @param username - User's chosen username
 * @param password - User's password (no restrictions)
 */
export const signUp = async (username: string, password: string) => {
    const email = usernameToEmail(username);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    // Create user profile with the actual username
    if (data.user) {
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: data.user.id,
                username: username,
                language: '简体中文',
                currency: '¥'
            });

        if (profileError) {
            console.error('Failed to create user profile:', profileError);
        }
    }

    return data;
};

/**
 * Sign in with username and password
 * @param username - User's username  
 * @param password - User's password
 */
export const signIn = async (username: string, password: string) => {
    const email = usernameToEmail(username);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return profile as UserProfile;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
};
