import React from 'react';
import { FileText, type LucideIcon } from 'lucide-react';

export interface PolicyCardProps {
  id: number;
  title: string;
  organization: string;
  type: string;
  policyType: 'internal' | 'external' | 'regulatory' | 'standard';
  region?: string;
  updated: string;
  requirements?: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  onClick?: () => void;
}

const PolicyCard: React.FC<PolicyCardProps> = ({
  title,
  organization,
  type,
  policyType,
  region,
  updated,
  requirements,
  description,
  icon: IconComponent,
  iconColor,
  onClick
}) => {
  const getPolicyTypeStyles = () => {
    switch (policyType) {
      case 'internal':
        return 'ring-1 ring-green-200 shadow-green-100/50';
      case 'external':
        return 'ring-1 ring-blue-200 shadow-blue-100/50';
      case 'regulatory':
        return 'ring-1 ring-purple-200 shadow-purple-100/50';
      case 'standard':
        return 'ring-1 ring-orange-200 shadow-orange-100/50';
      default:
        return '';
    }
  };

  const getPolicyTypeBadge = () => {
    const badgeStyles = {
      internal: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      external: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      regulatory: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
      standard: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeStyles[policyType]}`}>
        {policyType.charAt(0).toUpperCase() + policyType.slice(1)}
      </span>
    );
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer group ${getPolicyTypeStyles()}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
          <IconComponent className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">Updated {updated}</span>
            <button
              type="button"
              className="text-xs text-gray-400 cursor-not-allowed"
              disabled
              title="Not implemented"
            >
              Follow
            </button>
          </div>
          {requirements && (
            <div className="text-xs text-gray-500 mb-2">{requirements}</div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-gray-700">
        {title}
      </h3>

      {/* Organization */}
      <p className="text-xs text-gray-600 mb-3">{organization}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {getPolicyTypeBadge()}
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
          <FileText className="w-3 h-3" />
          {type}
        </span>
        {region && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
            {region}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default PolicyCard;
