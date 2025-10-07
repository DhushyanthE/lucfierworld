/**
 * Admin Setup Utility
 * 
 * This utility helps set up the first admin user in the system.
 * Run this once after deploying to create your admin account.
 * 
 * SECURITY NOTE: This should only be used during initial setup.
 * After creating the first admin, remove this file or restrict its access.
 */

import { supabase } from '@/integrations/supabase/client';

export async function makeUserAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (error) {
      console.error('Error creating admin role:', error);
      return false;
    }

    console.log('Admin role created successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Failed to create admin role:', error);
    return false;
  }
}

/**
 * Make the current logged-in user an admin
 * This will only work if there are no other admins (bootstrapping scenario)
 */
export async function bootstrapFirstAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user logged in');
      return false;
    }

    // Check if any admins exist
    const { data: existingAdmins } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      console.error('Admin already exists. Cannot bootstrap.');
      return false;
    }

    // Create first admin using service role (needs to be done via edge function)
    const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
      body: { user_id: user.id }
    });

    if (error) {
      console.error('Error bootstrapping admin:', error);
      return false;
    }

    console.log('First admin bootstrapped successfully');
    return true;
  } catch (error) {
    console.error('Failed to bootstrap admin:', error);
    return false;
  }
}
