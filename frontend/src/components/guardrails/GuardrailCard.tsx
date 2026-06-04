// Copyright (c) 2024 Windsurf AI
// 
// This file is part of Windsurf project.
// It is subject to the license terms in the LICENSE file found in the top-level
// directory of this distribution and at:
// https://github.com/windsurfai/windsurf/blob/main/LICENSE.txt
//
// No part of Windsurf, including this file, may be copied, modified,
// propagated, or distributed except according to the terms contained in the
// LICENSE file.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '../ui';

interface GuardrailCardProps {
  id: number;
  title: string;
  category: 'Security' | 'Privacy' | 'Compliance' | 'Moderation' | 'Integrity';
  status: 'active' | 'inactive' | 'new';
  description: string;
  associatedPolicies: string[];
  detectionType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: string;
  triggerCount: number;
  icon: LucideIcon;
  iconColor: string;
  onClick?: () => void;
}

const GuardrailCard: React.FC<GuardrailCardProps> = ({
  title,
  category,
  status,
  description,
  associatedPolicies,
  detectionType,
  riskLevel,
  lastTriggered,
  triggerCount,
  icon: Icon,
  iconColor,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'new':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryColors = {
      'Security': 'text-red-600',
      'Privacy': 'text-blue-600', 
      'Compliance': 'text-green-600',
      'Moderation': 'text-purple-600',
      'Integrity': 'text-orange-600'
    };
    return categoryColors[category as keyof typeof categoryColors] || 'text-gray-600';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{detectionType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(status)}>
            {status === 'new' && '✨ '}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Category and Risk Level */}
      <div className="flex items-center gap-3 mb-3">
        <Badge className={`${getCategoryIcon(category)} bg-gray-50 text-gray-700 border-gray-200`}>
          {category}
        </Badge>
        <Badge className={getRiskLevelColor(riskLevel)}>
          Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Associated Policies */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Associated Policies:</p>
        <div className="flex flex-wrap gap-1">
          {associatedPolicies.slice(0, 3).map((policy, index) => (
            <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              {policy}
            </Badge>
          ))}
          {associatedPolicies.length > 3 && (
            <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
              +{associatedPolicies.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Triggers: <span className="font-medium text-gray-900">{triggerCount}</span></span>
          {lastTriggered && (
            <span>Last: <span className="font-medium text-gray-900">{lastTriggered}</span></span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Click to configure
        </div>
      </div>
    </div>
  );
};

export default GuardrailCard;
