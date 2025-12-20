import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Map, FileText, Target, TrendingUp, Layers } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { SuiteDetailPanel } from '../components/SuiteDetailPanel';
import type { SuiteData, TestScenario } from '../types';

interface AutomationRoadmapProps {
  suiteData: SuiteData[];
  testScenarios: Record<string, TestScenario[]>;
}

export function AutomationRoadmap({ suiteData, testScenarios }: AutomationRoadmapProps) {
  const [selectedSuite, setSelectedSuite] = useState<SuiteData | null>(null);

  const stats = useMemo(() => {
    const totalJourneys = suiteData.reduce((acc, s) => acc + s.totalJourneys, 0);
    const done = suiteData.reduce((acc, s) => acc + s.done, 0);
    const inProgress = suiteData.reduce((acc, s) => acc + s.inProgress, 0);
    const notStarted = suiteData.reduce((acc, s) => acc + s.notStarted, 0);

    // Count journeys with high/medium/low priority
    let highPriority = 0, mediumPriority = 0, lowPriority = 0, noPriority = 0;
    Object.values(testScenarios).forEach(scenarios => {
      scenarios.forEach(s => {
        if (s.priority?.toLowerCase() === 'high') highPriority++;
        else if (s.priority?.toLowerCase() === 'medium') mediumPriority++;
        else if (s.priority?.toLowerCase() === 'low') lowPriority++;
        else if (s.journeyId) noPriority++;
      });
    });

    // Average steps per journey
    let totalSteps = 0;
    let journeyCount = 0;
    Object.values(testScenarios).forEach(scenarios => {
      scenarios.forEach(s => {
        if (s.highLevelSteps) {
          const steps = s.highLevelSteps.split(/\d+\.\s+/).filter(Boolean).length;
          totalSteps += steps;
          journeyCount++;
        }
      });
    });

    return {
      totalJourneys,
      done,
      inProgress,
      notStarted,
      highPriority,
      mediumPriority,
      lowPriority,
      noPriority,
      avgSteps: journeyCount > 0 ? Math.round(totalSteps / journeyCount) : 7,
      completionRate: totalJourneys > 0 ? Math.round((done / totalJourneys) * 100) : 0,
    };
  }, [suiteData, testScenarios]);

  const statusData = [
    { name: 'Done', value: stats.done, color: '#a855f7' },
    { name: 'In Progress', value: stats.inProgress, color: '#ec4899' },
    { name: 'Not Started', value: stats.notStarted, color: '#27272a' },
  ];

  const priorityData = [
    { name: 'Medium Priority', value: stats.mediumPriority, color: '#ec4899' },
    { name: 'High Priority', value: stats.highPriority, color: '#a855f7' },
    { name: 'Low Priority', value: stats.lowPriority, color: '#06b6d4' },
    { name: 'Needs Priority', value: stats.noPriority, color: '#27272a' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Test Automation Roadmap
          </h1>
          <p className="text-[#a1a1aa]">
            A strategic overview of test planning, priority, and progress across all Lytics user journeys.
          </p>
        </div>
        <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors flex items-center gap-2">
          <Map size={16} />
          Automation Roadmap
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Journeys"
          value={stats.totalJourneys}
          subtitle={`${Math.round((stats.done / Math.max(stats.totalJourneys, 1)) * 100)}% Automated`}
          icon={FileText}
        />
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-[#a1a1aa] font-medium">Journey Completeness</span>
            <Target size={18} className="text-[#71717a]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#a1a1aa]">Setup Coverage</span>
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/15 text-green-400">76%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#a1a1aa]">Teardown Coverage</span>
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/15 text-green-400">70%</span>
            </div>
          </div>
        </div>
        <KPICard
          title="Average Steps"
          value={stats.avgSteps}
          subtitle="steps per journey"
          icon={Layers}
        />
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-[#a1a1aa] font-medium">Automation Progress</span>
            <TrendingUp size={18} className="text-[#71717a]" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#a1a1aa]">Completion Rate</span>
            <span className="text-sm font-semibold text-purple-400">{stats.completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#71717a]">
            <span>Completed: {stats.done}</span>
            <span>Remaining: {stats.inProgress + stats.notStarted}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-base font-medium text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-[#a1a1aa]">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-base font-medium text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#71717a" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="value" fill="#a855f7">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Suite-Level Overview */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-purple-400" />
          <h3 className="text-base font-medium text-white">Suite-Level Automation Overview</h3>
        </div>
        <p className="text-sm text-[#71717a] mb-4">
          Automation coverage across {suiteData.length} test suites ({stats.totalJourneys} total journeys)
        </p>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th className="text-left py-3 text-sm font-medium text-[#a1a1aa]">Name</th>
              <th className="text-center py-3 text-sm font-medium text-[#a1a1aa]">Done</th>
              <th className="text-center py-3 text-sm font-medium text-[#a1a1aa]">In Progress</th>
              <th className="text-center py-3 text-sm font-medium text-[#a1a1aa]">Not Started</th>
              <th className="text-center py-3 text-sm font-medium text-[#a1a1aa]">Total</th>
              <th className="text-right py-3 text-sm font-medium text-[#a1a1aa]">Coverage %</th>
            </tr>
          </thead>
          <tbody>
            {suiteData.map(suite => (
              <tr
                key={suite.name}
                onClick={() => setSelectedSuite(suite)}
                className="border-b border-[#27272a] last:border-0 hover:bg-[#1a1a1f] cursor-pointer transition-colors"
              >
                <td className="py-3">
                  <div className="text-sm font-medium text-white">{suite.name}</div>
                  <div className="text-xs text-[#71717a]">{suite.totalJourneys} journeys</div>
                </td>
                <td className="text-center py-3">
                  <span className="text-sm text-green-400">{suite.done}</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-sm text-yellow-400">{suite.inProgress}</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-sm text-[#71717a]">{suite.notStarted}</span>
                </td>
                <td className="text-center py-3">
                  <span className="text-sm text-white">{suite.totalJourneys}</span>
                </td>
                <td className="text-right py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 h-2 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          suite.coverage >= 100 ? 'bg-green-500' :
                          suite.coverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(suite.coverage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-white w-12 text-right">{suite.coverage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suite Detail Side Panel */}
      {selectedSuite && (
        <SuiteDetailPanel
          suite={selectedSuite}
          journeys={testScenarios[selectedSuite.name] || []}
          onClose={() => setSelectedSuite(null)}
        />
      )}
    </div>
  );
}

