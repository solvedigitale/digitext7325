// src/components/UserRoleManager.tsx
import React, { useState } from 'react';
import { ROLES, getPermissionsByRole } from '../constants/roles';
import supabase from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserRoleManagerProps {
  user: User;
  onUpdate?: (user: User) => void;
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ user, onUpdate }) => {
  const [role, setRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRoleChange = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Yeni rol ve izinleri ayarla
      const newRole = role === ROLES.ADMIN ? ROLES.AGENT : ROLES.ADMIN;
      const newPermissions = getPermissionsByRole(newRole);
      
      // Kullanıcı bilgilerini güncelle
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: newRole,
          permissions: newPermissions
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setRole(newRole);
      setSuccess(`Kullanıcı rolü ${newRole === ROLES.ADMIN ? 'Admin' : 'Agent'} olarak güncellendi`);
      
      if (onUpdate) {
        onUpdate({
          ...user,
          role: newRole
        });
      }
    } catch (err: any) {
      console.error('Rol güncelleme hatası:', err);
      setError(err.message || 'Rol güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Mevcut rol:</span>
        <span className={`text-sm px-2 py-1 rounded ${
          role === ROLES.ADMIN ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {role === ROLES.ADMIN ? 'Admin' : 'Agent'}
        </span>
      </div>
      
      <button
        onClick={handleRoleChange}
        disabled={isLoading}
        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
      >
        {isLoading ? 'İşleniyor...' : role === ROLES.ADMIN ? 'Agent Yap' : 'Admin Yap'}
      </button>
    </div>
  );
};