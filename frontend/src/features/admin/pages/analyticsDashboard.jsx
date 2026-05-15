import React from 'react';
import { Users, Star, Activity, Trash2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import '@/css/analyticsDashboard.css';

const DashboardAnalytics = () => {
  // Data untuk Grafik Bar dan Tabel
  const diseaseData = [
    { rank: 1, name: 'Depresi', cases: 245, percentage: '21.9%' },
    { rank: 2, name: 'Anxiety', cases: 198, percentage: '17.7%' },
    { rank: 3, name: 'Stress', cases: 176, percentage: '15.7%' },
    { rank: 4, name: 'Insomnia', cases: 142, percentage: '12.7%' },
    { rank: 5, name: 'PTSD', cases: 98, percentage: '8.8%' },
    { rank: 6, name: 'Bipolar', cases: 87, percentage: '7.8%' },
    { rank: 7, name: 'Social Isolation', cases: 75, percentage: '6.8%' },
    { rank: 8, name: 'Substance Use', cases: 54, percentage: '4.8%' },
    { rank: 9, name: 'Neurosis', cases: 43, percentage: '3.8%' },
  ];

  // Data bar chart di-reverse agar yang tertinggi ada di atas
  const barChartData = [...diseaseData].reverse();

  // Data untuk Grafik Pie
  const ageData = [
    { name: '13-17', value: 45, color: '#8b5cf6' },
    { name: '18-24', value: 312, color: '#c4b5fd' },
    { name: '25-34', value: 266, color: '#3b0764' },
    { name: '35-44', value: 145, color: '#f3e8ff' },
    { name: '45-54', value: 89, color: '#a855f7' },
    { name: '55+', value: 52, color: '#5b21b6' },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Analytics</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Users size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Total Pengguna</p>
          <h2 className="kpi-value">2,450</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Star size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Rating Website</p>
          <div className="kpi-value-row">
            <h2>4.6</h2>
            <div className="stars">★★★★<span className="star-half">★</span></div>
          </div>
          <p className="kpi-subtext">1,147 ulasan</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Activity size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Umur Terbanyak</p>
          <h2>18-24</h2>
          <p className="kpi-subtext">312 pengguna (34%)</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper"><Trash2 size={20} className="kpi-icon" /></div>
          <p className="kpi-label">Akun Terhapus</p>
          <h2>7.6%</h2>
          <p className="kpi-subtext">167 dari 2,450 pengguna</p>
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
