
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'user';

export class RoleService {
  static async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase.rpc('get_current_user_role');
      
      if (error) {
        console.error('Error getting user role:', error);
        return null;
      }
      
      return data as UserRole;
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return null;
    }
  }

  static async hasRole(role: UserRole): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: role
      });
      
      if (error) {
        console.error('Error checking role:', error);
        return false;
      }
      
      return data as boolean;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  static async assignRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

      if (error) {
        console.error('Error assigning role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignRole:', error);
      return false;
    }
  }

  static async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user roles:', error);
        return [];
      }

      return data.map(item => item.role as UserRole);
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      return [];
    }
  }
}
