import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Explanation } from '../lib/api';
import { cn, getUrgencyColor, getUrgencyBadgeColor, getUrgencyLabel, formatConfidence } from '../lib/utils';

interface FindingCardProps {
  finding: Explanation;
}

export function FindingCard({ finding }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "glass-card p-4 border-l-4 slide-up hover:shadow-xl transition-all duration-300 cursor-pointer",
      getUrgencyColor(finding.urgency)
    )}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              Tooth #{finding.tooth_number}
            </h3>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              getUrgencyBadgeColor(finding.urgency)
            )}>
              {getUrgencyLabel(finding.urgency)}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-700 mb-1">
            {finding.condition.replace(/_/g, ' ').toUpperCase()}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            {finding.explanation}
          </p>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 fade-in">
              <p className="text-sm text-gray-700 italic">
                <span className="font-semibold">Recommendation:</span> {finding.recommendation}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Confidence: {formatConfidence(finding.confidence)}
              </p>
            </div>
          )}
        </div>

        <button
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
    </div>
  );
}
