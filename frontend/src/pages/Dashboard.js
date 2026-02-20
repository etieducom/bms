import React, { useState, useEffect } from 'react';
import { analyticsAPI, leadsAPI } from '@/api/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = {
  'New': '#3B82F6',
  'Contacted': '#8B5CF6',
  'Demo Booked': '#F59E0B',
  'Follow-up': '#06B6D4',
  'Converted': '#10B981',
  'Lost': '#EF4444',
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, trendsRes, leadsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrends(),
        leadsAPI.getAll(),
      ]);
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data);
      setRecentLeads(leadsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  const statusData = analytics?.status_breakdown
    ? Object.entries(analytics.status_breakdown).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#94A3B8',
      }))
    : [];

  const conversionRate = analytics
    ? ((analytics.status_breakdown?.['Converted'] || 0) / (analytics.total_leads || 1) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn" data-testid="dashboard">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-soft hover:shadow-lifted transition-shadow" data-testid="total-leads-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.total_leads || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-soft hover:shadow-lifted transition-shadow" data-testid="conversion-rate-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-soft hover:shadow-lifted transition-shadow" data-testid="converted-leads-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Converted</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics?.status_breakdown?.['Converted'] || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-soft hover:shadow-lifted transition-shadow" data-testid="lost-leads-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lost</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analytics?.status_breakdown?.['Lost'] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution */}
        <Card className="col-span-1 lg:col-span-5 border-slate-200 shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card className="col-span-1 lg:col-span-7 border-slate-200 shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.source_performance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="source" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="count" fill="#0F172A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="border-slate-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                data-testid={`recent-lead-${lead.id}`}
              >
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-slate-600">{lead.program}</p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${STATUS_COLORS[lead.status]}15`,
                      color: STATUS_COLORS[lead.status],
                    }}
                  >
                    {lead.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{lead.lead_source}</p>
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-center text-slate-500 py-8">No leads yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
