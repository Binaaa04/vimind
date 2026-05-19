import React, { useState, useEffect } from 'react';
import { Users, Star, Activity, Trash2, MapPin, Smile, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from "@/shared/api/client";
import '@/css/analyticsDashboard.css';

/* ---------- helpers ---------- */
const renderStars = (rating) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<span key={i} className="star-filled">★</span>);
    else if (i === full && hasHalf) stars.push(<span key={i} className="star-half">★</span>);
    else stars.push(<span key={i} className="star-empty">★</span>);
  }
  return <div className="stars">{stars}</div>;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="label">{payload[0].payload.name}</p>
      <p className="value">{payload[0].value} kasus</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="label">{payload[0].name}</p>
      <p className="value">{payload[0].value} pengguna</p>
    </div>
  );
};

/* ========== Component ========== */
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

  /* loading */
  if (loading) return (
    <div className="analytics-loading">
      <div className="spinner" />
      <span>Memuat data analytics...</span>
    </div>
  );

  /* error */
  if (!data) return (
    <div className="analytics-error">
      <AlertCircle size={40} color="#7c3aed" />
      <h3>Gagal Memuat Data</h3>
      <p>Silakan coba refresh halaman.</p>
    </div>
  );

  const diseaseData = data.disease_list || [];
  const barChartData = [...diseaseData].reverse();
  const ageData = data.age_list || [];

  const deletedPercentage = data.total_users > 0
    ? ((data.deleted_accounts / data.total_users) * 100).toFixed(1)
    : 0;

  /* how tall should the bar chart be? */
  const barHeight = Math.max(280, barChartData.length * 40);
  /* Y-axis label width — enough to fit names but not too wide */
  const yAxisWidth = 160;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Analytics</h1>

      {/* ─── KPI Cards ─── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Users size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Total Pengguna</p>
          <h2 className="kpi-value">
            {data.total_users}
            <span className="weekly-badge">{data.weekly_active} aktif minggu ini</span>
          </h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Star size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Rating Website</p>
          <div className="kpi-value-row">
            <h2>{data.average_rating.toFixed(1)}</h2>
            {renderStars(data.average_rating)}
          </div>
          <p className="kpi-subtext">{data.total_feedbacks} ulasan</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Activity size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Rentang Umur Terbanyak</p>
          <h2>{data.age_range || '-'}</h2>
        </div>



        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><MapPin size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Wilayah Terbanyak</p>
          <h2 style={{ fontSize: data.top_region ? '1.15rem' : undefined }}>{data.top_region || '-'}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Trash2 size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Akun Terhapus</p>
          <h2>{deletedPercentage}%</h2>
          <p className="kpi-subtext">{data.deleted_accounts} dari {data.total_users} pengguna</p>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Penyakit Paling Sering Dialami</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f0ff" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                  width={yAxisWidth}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                <Bar dataKey="cases" radius={[0, 6, 6, 0]} barSize={18}>
                  {barChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === barChartData.length - 1 ? '#7c3aed' : '#a78bfa'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Distribusi Rentang Umur</h3>
          {ageData.length > 0 ? (
            <div className="chart-wrapper pie-chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ageData}
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    paddingAngle={3}
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="pie-legend">
                {ageData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pie-empty-state">
              <Activity size={40} />
              <span>Belum ada data umur pengguna</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Table ─── */}
      <div className="table-card">
        <h3 className="chart-title">Detail Penyakit</h3>
        <table className="disease-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Peringkat</th>
              <th>Penyakit</th>
              <th className="text-right" style={{ width: 120 }}>Jumlah Kasus</th>
              <th className="text-right" style={{ width: 120 }}>Persentase</th>
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
            {diseaseData.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  Belum ada data diagnosis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
