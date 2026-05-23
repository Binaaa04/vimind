import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Shield, User } from 'lucide-react';
import { adminGetUsers } from '@/features/admin/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminGetUsers();
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner" />
        <span>Memuat data user...</span>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      {/* Header */}
      <div className="admin-users-header">
        <h1>Manajemen Data User</h1>
        <div className="user-count-badge">
          <Users size={16} />
          Total User:
          <span className="count-number">{users.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="users-search-bar">
        <Search size={18} color="#9ca3af" />
        <input
          type="text"
          placeholder="Cari email, nama, atau role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="users-table-container">
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tgl Daftar</th>
                <th>Email</th>
                <th>Nama</th>
                <th>Role</th>
                <th>Tgl Lahir</th>
                <th>Wilayah</th>
                <th>Aktif Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td className="user-date">{formatDate(u.created_at) || <span className="users-empty-cell">-</span>}</td>
                  <td className="user-email">{u.email}</td>
                  <td className="user-name">{u.name || <span className="users-empty-cell">Belum diisi</span>}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="user-date">{formatDate(u.birth_date) || <span className="users-empty-cell">-</span>}</td>
                  <td className="user-region">{u.last_region || <span className="users-empty-cell">-</span>}</td>
                  <td className="user-active">{formatDateTime(u.last_active_at) || <span className="users-empty-cell">-</span>}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="users-empty-state">
                      <Users size={44} color="#d1d5db" />
                      <p>{search ? 'Tidak ditemukan user yang cocok.' : 'Belum ada data user.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
