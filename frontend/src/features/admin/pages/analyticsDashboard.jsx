import React, { useState, useEffect } from 'react';
import { Users, Star, Activity, Trash2, MapPin, Smile } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from "@/shared/api/client";
import '@/css/analyticsDashboard.css';

const DashboardAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading analytics...</div>;
  if (!data) return <div style={{ color: 'white', padding: '20px' }}>Gagal memuat data.</div>;

  const diseaseData = data.disease_list || [];
  const barChartData = [...diseaseData].reverse();
  const ageData = data.age_list || [];

  const deletedPercentage = data.total_users > 0 
    ? ((data.deleted_accounts / data.total_users) * 100).toFixed(1) 
    : 0;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Analytics</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Users size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Total Pengguna (Aktif Mingguan)</p>
          <h2 className="kpi-value">{data.total_users} <span style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)'}}>({data.weekly_active})</span></h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Star size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Rating Website</p>
          <div className="kpi-value-row">
            <h2>{data.average_rating.toFixed(1)}</h2>
            <div className="stars">★★★★<span className="star-half">★</span></div>
          </div>
          <p className="kpi-subtext">{data.total_feedbacks} ulasan</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Activity size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Umur Terbanyak</p>
          <h2>{data.age_range || '-'}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Smile size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Mood Terbanyak</p>
          <h2>{data.most_mood || '-'}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><MapPin size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Wilayah Terbanyak</p>
          <h2 style={{ fontSize: '1.2rem', marginTop: '10px' }}>{data.top_region || '-'}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Trash2 size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Akun Terhapus</p>
          <h2>{deletedPercentage}%</h2>
          <p className="kpi-subtext">{data.deleted_accounts} dari {data.total_users} pengguna</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Penyakit Paling Sering Dialami</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#8b5cf6', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={true} tickLine={false} tick={{fill: '#8b5cf6', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3e8ff'}} />
                <Bar dataKey="cases" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Distribusi Rentang Umur</h3>
          <div className="chart-wrapper pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ageData}
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="pie-legend">
              {ageData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-card">
        <h3 className="chart-title">Detail Penyakit</h3>
        <table className="disease-table">
          <thead>
            <tr>
              <th>Peringkat</th>
              <th>Penyakit</th>
              <th className="text-right">Jumlah Kasus</th>
              <th className="text-right">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {diseaseData.map((row) => (
              <tr key={row.rank}>
                <td>
                  <span className="rank-badge">{row.rank}</span>
                </td>
                <td className="disease-name">{row.name}</td>
                <td className="text-right font-bold text-purple">{row.cases}</td>
                <td className="text-right text-gray">{row.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
