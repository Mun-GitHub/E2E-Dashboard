import { useState } from 'react';
import { X, CheckCircle2, Clock, Circle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { SuiteData, TestScenario } from '../types';

interface SuiteDetailPanelProps {
  suite: SuiteData;
  journeys: TestScenario[];
  onClose: () => void;
}

interface JourneyItemProps {
  journey: TestScenario;
  isFirst: boolean;
}

function JourneyItem({ journey, isFirst }: JourneyItemProps) {
  const [showDetails, setShowDetails] = useState(isFirst);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'not started': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const parseSteps = (stepsText: string): string[] => {
    if (!stepsText) return [];
    return stepsText
      .split(/\d+\.\s+/)
      .filter(Boolean)
      .map(step => step.trim());
  };

  const parseOutcomes = (outcomesText: string): string[] => {
    if (!outcomesText) return [];
    return outcomesText
      .split(/(?:\d+\.\s+|[-•]\s+)/)
      .filter(Boolean)
      .map(outcome => outcome.trim());
  };

  const parseTestTypes = (testType: string): string[] => {
    if (!testType) return [];
    return testType.split(/[,;]/).map(t => t.trim()).filter(Boolean);
  };

  const parseStartingPoints = (points: string): string[] => {
    if (!points) return [];
    return points
      .split(/(?:[-•]\s+)/)
      .filter(Boolean)
      .map(p => p.trim());
  };

  return (
    <div className="border-b border-[#27272a] last:border-0">
      {/* Journey Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {journey.journeyShortDescription || journey.journeyId}
            </p>
            <p className="text-xs text-[#71717a] mt-0.5">
              Journey ID: {journey.journeyId}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {journey.priority && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(journey.priority)}`}>
                {journey.priority.toLowerCase()} priority
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(journey.automationStatus)}`}>
              {journey.automationStatus}
            </span>
          </div>
        </div>

        {/* View Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-sm text-[#a1a1aa] hover:text-white transition-colors mt-2"
        >
          {showDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          View Details
        </button>

        {/* Collapsible Details */}
        {showDetails && (
          <div className="mt-4 space-y-4 pl-1">
            {/* Primary Goal */}
            {journey.primaryUserGoal && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Primary Goal
                </h4>
                <p className="text-sm text-[#e4e4e7] leading-relaxed">
                  {journey.primaryUserGoal}
                </p>
              </div>
            )}

            {/* High-Level Steps */}
            {journey.highLevelSteps && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  High-Level Steps
                </h4>
                <ol className="space-y-1">
                  {parseSteps(journey.highLevelSteps).map((step, i) => (
                    <li key={i} className="text-sm text-[#e4e4e7] flex gap-2">
                      <span className="text-[#71717a] flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Success Outcomes */}
            {journey.successOutcome && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Success Outcomes
                </h4>
                <ul className="space-y-1">
                  {parseOutcomes(journey.successOutcome).map((outcome, i) => (
                    <li key={i} className="text-sm text-[#e4e4e7] flex gap-2">
                      <span className="text-[#71717a] flex-shrink-0">•</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential Starting Points */}
            {journey.potentialStartingPoints && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Potential Starting Points
                </h4>
                <ul className="space-y-1">
                  {parseStartingPoints(journey.potentialStartingPoints).map((point, i) => (
                    <li key={i} className="text-sm text-[#e4e4e7] flex gap-2">
                      <span className="text-[#71717a] flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tear Down Steps */}
            {journey.tearDownSteps && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Tear Down Steps
                </h4>
                <p className="text-sm text-[#e4e4e7]">
                  {journey.tearDownSteps}
                </p>
              </div>
            )}

            {/* Test Types */}
            {journey.testType && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Test Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parseTestTypes(journey.testType).map((type, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-[#27272a] text-[#e4e4e7] rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Jira Ticket */}
            {journey.jiraTicket && (
              <div>
                <h4 className="text-xs font-medium text-[#71717a] mb-1.5">
                  Jira Ticket
                </h4>
                <a
                  href={`https://jira.example.com/browse/${journey.jiraTicket}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {journey.jiraTicket}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SuiteDetailPanel({ suite, journeys, onClose }: SuiteDetailPanelProps) {
  const automationPercentage = suite.totalJourneys > 0 
    ? Math.round((suite.done / suite.totalJourneys) * 100) 
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-[480px] bg-[#0d0d0f] border-l border-[#27272a] shadow-2xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white uppercase tracking-wide">
                {suite.name}
              </h2>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                {automationPercentage}% Automated
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#27272a] rounded transition-colors"
            >
              <X size={20} className="text-[#71717a]" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-[#27272a]">
          <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#a1a1aa]">Completed</span>
              <CheckCircle2 size={14} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{suite.done}</div>
            <div className="text-[10px] text-[#71717a] mt-1">
              Journeys that have been fully automated
            </div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#a1a1aa]">In Progress</span>
              <Clock size={14} className="text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">{suite.inProgress}</div>
            <div className="text-[10px] text-[#71717a] mt-1">
              Journeys currently being developed
            </div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#a1a1aa]">Not Started</span>
              <Circle size={14} className="text-[#71717a]" />
            </div>
            <div className="text-2xl font-bold text-[#71717a]">{suite.notStarted}</div>
            <div className="text-[10px] text-[#71717a] mt-1">
              Journeys that haven't been automated yet
            </div>
          </div>
        </div>

        {/* Journey Details Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-white mb-1">Journey Details</h3>
            <p className="text-xs text-[#71717a]">{journeys.length} journeys in this suite</p>
          </div>

          {/* Journey List with Inline Details */}
          <div>
            {journeys.map((journey, idx) => (
              <JourneyItem
                key={journey.journeyId || idx}
                journey={journey}
                isFirst={idx === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
