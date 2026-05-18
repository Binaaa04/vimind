import React, { useState, useEffect } from 'react';
import { adminGetUsers } from '@/features/admin/api';
import { supabase } from '@/services/supabaseClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await adminGetUsers(session.user.email);
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manajemen Data User</h1>
        <div style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#a78bfa', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          Total User: {users.length}
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a78bfa' }}>Memuat data user...</div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Tgl Daftar</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Nama</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Tgl Lahir</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Wilayah IP</th>
                <th style={{ padding: '16px', color: '#a78bfa', fontWeight: '600' }}>Aktif Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px', color: '#d1d5db' }}>{u.created_at || '-'}</td>
                  <td style={{ padding: '16px' }}>{u.email}</td>
                  <td style={{ padding: '16px', color: '#f3f4f6' }}>{u.name || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      background: u.role === 'admin' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: u.role === 'admin' ? '#c4b5fd' : '#d1d5db'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#9ca3af' }}>{u.birth_date || '-'}</td>
                  <td style={{ padding: '16px', color: '#9ca3af' }}>{u.last_region || '-'}</td>
                  <td style={{ padding: '16px', color: '#8b5cf6', fontWeight: '500' }}>{u.last_active_at || '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Belum ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
