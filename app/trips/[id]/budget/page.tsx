'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Calendar,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import Navbar from '@/components/navigation/Navbar';

const COLORS = ['#0F3D3E', '#E89B3D', '#D96C4F', '#4F8068', '#7D8581'];

export default function TripBudgetPage({
  params,
}: {
  params: { id: string };
}) {
  const tripId = params.id;
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set default daily budget threshold
  const dailyBudgetLimit = 150; 

  useEffect(() => {
    fetchBudgetData();
  }, [tripId]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const tripRes = await fetch(`/api/trips/${tripId}`);
      if (!tripRes.ok) throw new Error('Failed to load trip details');
      const tripData = await tripRes.json();
      setTrip(tripData);

      const expRes = await fetch(`/api/trips/${tripId}/expenses`);
      if (!expRes.ok) throw new Error('Failed to load expenses');
      const expData = await expRes.json();
      setExpenses(expData);

      // Set default date for expense form
      if (tripData.startDate) {
        setExpenseDate(new Date(tripData.startDate).toISOString().split('T')[0]);
      }
    } catch (e: any) {
      setError(e.message || 'Error loading budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !expenseDate) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          currency: 'USD',
          description,
          expenseDate,
        }),
      });

      if (!res.ok) throw new Error('Failed to save expense');

      setAmount('');
      setDescription('');
      fetchBudgetData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Navbar />
        <div className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-3xl p-6 text-center max-w-md mx-auto my-12">
          <h3 className="font-serif text-lg font-bold">Failed to load budget dashboard</h3>
          <p className="text-xs mt-1">{error}</p>
          <button onClick={fetchBudgetData} className="mt-4 bg-brand-accent text-white px-5 py-2 rounded-full text-xs font-bold uppercase">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 1. Calculate general durations and totals
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // 2. Accumulate expenses from database (custom expenses + activity estimated costs)
  const categoryTotals: Record<string, number> = {
    TRANSPORT: 0,
    ACCOMMODATION: 0,
    ACTIVITY: 0,
    FOOD: 0,
    OTHER: 0,
  };

  let totalExpenses = 0;

  // Custom expenses from database
  expenses.forEach((exp: any) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    totalExpenses += exp.amount;
  });

  // Scheduled activity costs
  let itineraryItemsCount = 0;
  trip.stops.forEach((stop: any) => {
    stop.itineraryItems.forEach((item: any) => {
      const cost = item.customCost !== null ? item.customCost : item.activity.estimatedCost;
      categoryTotals['ACTIVITY'] += cost;
      totalExpenses += cost;
      itineraryItemsCount++;
    });
  });

  const costPerDay = totalExpenses / totalDays;

  // 3. Compile cost per city stop
  const cityCostBreakdown = trip.stops.map((stop: any) => {
    let stopCost = 0;
    stop.itineraryItems.forEach((item: any) => {
      stopCost += item.customCost !== null ? item.customCost : item.activity.estimatedCost;
    });
    return {
      name: stop.city.name,
      amount: stopCost,
    };
  });

  // 4. Compile category breakdown data for Recharts Pie
  const pieData = Object.keys(categoryTotals)
    .map((cat) => ({
      name: cat.charAt(0) + cat.slice(1).toLowerCase(),
      value: categoryTotals[cat],
    }))
    .filter((d) => d.value > 0);

  // 5. Compile daily spending charts data
  const dateTotals: Record<string, number> = {};
  
  // Set day values to 0 initially
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(trip.startDate);
    d.setDate(d.getDate() + i);
    dateTotals[d.toISOString().split('T')[0]] = 0;
  }

  // Accumulate custom expenses onto their respective dates
  expenses.forEach((exp: any) => {
    const dateStr = new Date(exp.expenseDate).toISOString().split('T')[0];
    if (dateTotals[dateStr] !== undefined) {
      dateTotals[dateStr] += exp.amount;
    }
  });

  // Accumulate activity costs onto their respective dates
  trip.stops.forEach((stop: any) => {
    stop.itineraryItems.forEach((item: any) => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      const cost = item.customCost !== null ? item.customCost : item.activity.estimatedCost;
      if (dateTotals[dateStr] !== undefined) {
        dateTotals[dateStr] += cost;
      }
    });
  });

  const barData = Object.keys(dateTotals).map((dateStr, idx) => ({
    day: `Day ${idx + 1}`,
    amount: dateTotals[dateStr],
    date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Check if any day exceeds the budget threshold
  const exceededDays = barData.filter((d) => d.amount > dailyBudgetLimit);
  const isOverBudget = exceededDays.length > 0;

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href={`/trips/${tripId}/builder`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Builder</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-brand-border/60">
          <div>
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Financial Analysis
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-dark mt-1">
              Budget Analytics
            </h1>
            <p className="text-sm font-semibold text-brand-muted mt-2">
              {trip.title} ({totalDays} Days)
            </p>
          </div>
          <div className="bg-brand-surface border border-brand-border/60 px-5 py-3 rounded-2xl shadow-premium">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Total Estimated cost</span>
            <span className="text-2xl font-bold text-brand-primary font-mono">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* Over-budget Warning banner */}
        {isOverBudget && (
          <div className="bg-brand-accent/15 border border-brand-accent/30 rounded-3xl p-5 mb-8 flex gap-3.5 items-start text-left">
            <AlertTriangle className="w-6 h-6 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-dark">You are above your daily budget limit!</h4>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed font-semibold">
                Some days on this trip exceed your configured daily spending target of{' '}
                <strong className="text-brand-primary">{formatCurrency(dailyBudgetLimit)}</strong>. Review the daily spending graph below to optimize activities or accommodations.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {exceededDays.map((d) => (
                  <span key={d.day} className="bg-brand-accent/20 text-brand-accent text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {d.day} ({formatCurrency(d.amount)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Cost per day</span>
            <h3 className="text-3xl font-serif font-bold text-brand-dark mt-1">{formatCurrency(costPerDay)}/day</h3>
            <p className="text-[10px] text-brand-muted font-semibold mt-1">Average calculated across {totalDays} days</p>
          </div>

          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">City Count</span>
            <h3 className="text-3xl font-serif font-bold text-brand-dark mt-1">{trip.stops.length} Cities</h3>
            <p className="text-[10px] text-brand-muted font-semibold mt-1">Stops: {trip.stops.map((s: any) => s.city.name).join(', ') || 'None'}</p>
          </div>

          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-5 shadow-premium">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Logged Expenses</span>
            <h3 className="text-3xl font-serif font-bold text-brand-dark mt-1">{expenses.length + itineraryItemsCount} Items</h3>
            <p className="text-[10px] text-brand-muted font-semibold mt-1">Includes custom logs + itinerary activity costs</p>
          </div>
        </div>

        {/* Recharts Graphical Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donut Chart (Category) */}
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium flex flex-col justify-between h-[380px]">
            <div className="flex gap-1.5 items-center pb-2 border-b border-brand-border/40 mb-4">
              <PieIcon className="w-4 h-4 text-brand-primary" />
              <h3 className="font-serif text-sm font-bold text-brand-dark">Category Distribution</h3>
            </div>
            
            {pieData.length === 0 ? (
              <div className="flex-grow flex items-center justify-center">
                <span className="text-xs text-brand-muted">No expenses recorded. Log custom items below.</span>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart (Daily Spending) */}
          <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium flex flex-col justify-between h-[380px]">
            <div className="flex gap-1.5 items-center pb-2 border-b border-brand-border/40 mb-4">
              <BarChart2 className="w-4 h-4 text-brand-primary" />
              <h3 className="font-serif text-sm font-bold text-brand-dark">Daily Spending Timeline</h3>
            </div>

            <div className="flex-grow flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} labelFormatter={(label, payload) => {
                    const data = payload[0]?.payload;
                    return data ? `${data.day} (${data.date})` : label;
                  }} />
                  <Bar dataKey="amount" fill="#0F3D3E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expenses Input Form & Logs Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium h-fit">
            <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Log Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  required
                >
                  <option value="TRANSPORT">Transport</option>
                  <option value="ACCOMMODATION">Accommodation</option>
                  <option value="FOOD">Food</option>
                  <option value="ACTIVITY">Activity</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="e.g. Grand Plaza Hotel Booking"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    placeholder="120.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-background border border-brand-border rounded-xl text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-brand-surface text-[10px] font-bold uppercase tracking-wider rounded-full shadow-premium flex justify-center items-center cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Add Expense'
                )}
              </button>
            </form>
          </div>

          {/* City cost list & ledger (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* City costs */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Cost breakdown by city stop</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cityCostBreakdown.map((city: any) => (
                  <div key={city.name} className="flex justify-between items-center p-3.5 bg-brand-background rounded-2xl border border-brand-border/30">
                    <span className="font-serif font-bold text-sm text-brand-primary">{city.name}</span>
                    <span className="font-mono text-sm font-bold text-brand-dark">{formatCurrency(city.amount)}</span>
                  </div>
                ))}
                {cityCostBreakdown.length === 0 && (
                  <p className="text-xs text-brand-muted italic py-4 col-span-2">No city stops scheduled.</p>
                )}
              </div>
            </div>

            {/* Custom Expense Ledger List */}
            <div className="bg-brand-surface border border-brand-border/60 rounded-3xl p-6 shadow-premium">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Expense ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-brand-border/60 text-brand-muted uppercase tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp: any) => (
                      <tr key={exp.id} className="border-b border-brand-border/30 hover:bg-brand-background/40 transition-colors">
                        <td className="py-3 font-mono">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                        <td className="py-3 text-brand-dark">{exp.description}</td>
                        <td className="py-3">
                          <span className="bg-brand-primary/5 text-brand-primary text-[9px] px-2 py-0.5 rounded-full border border-brand-primary/10">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-brand-primary">{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-brand-muted italic">
                          No custom expenses logged yet. Log lodging or meals in the form.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
