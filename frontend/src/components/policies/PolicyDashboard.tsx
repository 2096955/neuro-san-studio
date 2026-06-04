// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, FileSearch, Brain, Shield, MessageSquareWarning, Copyright, Zap, Lock, Plus, Filter, Scale, Gavel, Building2, Users2, Database, AlertTriangle, Globe
} from 'lucide-react';
import PageLayout from '../rai/routes/layouts/PageLayout';
import { Button } from '../ui';
import PolicyCard from './PolicyCard';

const PolicyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'internal' | 'regulatory'>('all');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'USA' | 'Europe'>('all');

  const policyCards = [
    {
      id: 1,
      title: "Bias Detection and Fairness Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "12 Requirements",
      description: "Comprehensive policy framework for detecting and mitigating algorithmic bias in AI systems. Establishes mandatory bias testing protocols, fairness metrics evaluation, and remediation procedures to ensure equitable AI outcomes across all demographic groups and use cases.",
      icon: UserCheck,
      iconColor: "text-green-600"
    },
    {
      id: 2,
      title: "PII Leakage Prevention Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "8 Requirements",
      description: "Data protection policy specifically designed to prevent personally identifiable information (PII) leakage in AI model outputs. Defines detection mechanisms, data anonymization standards, and incident response procedures for PII exposure events.",
      icon: FileSearch,
      iconColor: "text-purple-600"
    },
    {
      id: 3,
      title: "AI Hallucination Mitigation Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "6 Requirements",
      description: "Policy framework addressing AI model hallucinations and false information generation. Establishes validation protocols, fact-checking requirements, and confidence scoring mechanisms to minimize the risk of AI-generated misinformation.",
      icon: Brain,
      iconColor: "text-gray-600"
    },
    {
      id: 4,
      title: "Content Safety and Moderation Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "15 Requirements",
      description: "Comprehensive content safety policy governing AI-generated content moderation and filtering. Defines prohibited content categories, automated detection systems, and human review processes to ensure safe and appropriate AI outputs.",
      icon: Shield,
      iconColor: "text-green-600"
    },
    {
      id: 5,
      title: "Toxicity Detection and Prevention Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "9 Requirements",
      description: "Policy framework for identifying and preventing toxic language and harmful content in AI interactions. Establishes toxicity scoring thresholds, content filtering mechanisms, and user protection measures against harmful AI-generated content.",
      icon: MessageSquareWarning,
      iconColor: "text-gray-600"
    },
    {
      id: 6,
      title: "Copyright and Intellectual Property Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "11 Requirements",
      description: "Intellectual property protection policy for AI systems to prevent copyright infringement and unauthorized use of proprietary content. Defines content attribution requirements, fair use guidelines, and IP violation detection mechanisms.",
      icon: Copyright,
      iconColor: "text-purple-600"
    },
    {
      id: 7,
      title: "Injection Attack Prevention Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "7 Requirements",
      description: "Security policy addressing prompt injection and adversarial attacks on AI systems. Establishes input validation protocols, attack detection mechanisms, and response procedures to protect AI models from malicious manipulation attempts.",
      icon: Zap,
      iconColor: "text-gray-600"
    },
    {
      id: 8,
      title: "Privacy Protection and Data Governance Policy",
      organization: "Internal RAI Framework",
      type: "Internal Policy",
      policyType: "internal" as const,
      region: "",
      updated: "Oct 1, 2025",
      requirements: "13 Requirements",
      description: "Comprehensive privacy policy governing data collection, processing, and protection in AI systems. Defines user consent requirements, data retention limits, and privacy-preserving techniques to ensure compliance with global privacy regulations.",
      icon: Lock,
      iconColor: "text-green-600"
    },
    // US Regulatory Policies
    {
      id: 9,
      title: "Biometric Information Privacy Act",
      organization: "Illinois State Legislature",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jul 2, 2024",
      requirements: "+1",
      description: "The Biometric Information Privacy Act (BIPA), enacted by the State of Illinois, is designed to regulate the collection, use, safeguarding, handling, storage, retention, and destruction of biometric identifiers and biometric information. The Act addresses the growing use of...",
      icon: Users2,
      iconColor: "text-gray-600"
    },
    {
      id: 10,
      title: "H.R.7096 - National AI Research Resource Task Force Act of 2020",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "Under this bill, the National Science Foundation, in collaboration with the Office of Science and Technology Policy, is tasked with creating the National Artificial Intelligence Research Resource Task Force. The purpose of this task force is to examine the potential and...",
      icon: Scale,
      iconColor: "text-purple-600"
    },
    {
      id: 11,
      title: "H.R.7683 - AI Training Act",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "This bill mandates the Office of Management and Budget (OMB) to create an AI training program for the acquisition workforce within executive agencies, excluding certain cases. The program's goal is to equip the workforce with an understanding of AI capabilities and...",
      icon: Gavel,
      iconColor: "text-gray-600"
    },
    {
      id: 12,
      title: "H.R.2575 - AI in Government Act of 2020",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "This bill establishes the AI Center of Excellence under the General Services Administration with the following objectives: promoting the use of AI technologies within the federal government, enhancing coordination and expertise in AI adoption, and conducting activities to improv...",
      icon: Building2,
      iconColor: "text-green-600"
    },
    {
      id: 13,
      title: "United States National Artificial Intelligence Initiative (NAII)",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "The National AI Initiative Act of 2020 (DIVISION E, SEC. 5001) was enacted on January 1, 2021, with the aim of establishing a cohesive program throughout the US Federal government to expedite AI research and implementation for the United States' econom...",
      icon: Scale,
      iconColor: "text-purple-600"
    },
    {
      id: 14,
      title: "Title VIII of the Civil Rights Act 1964",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "Title VIII of the Civil Rights Act encompasses all employment practices of applicable employers, including recruitment, supervision, transfer, and employee evaluation. It principally forbids discrimination in employment on the grounds of race, colour, religion, sex (inclusive of...",
      icon: Gavel,
      iconColor: "text-gray-600"
    },
    {
      id: 15,
      title: "H.R.6216 - National Artificial Intelligence Initiative Act of 2020",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 21, 2024",
      requirements: "+1",
      description: "The bill establishes the National Artificial Intelligence Initiative, led by the National Artificial Intelligence Initiative Office under the Office of Science and Technology Policy (OSTP). It also creates a National AI Advisory Committee for federal program coordination...",
      icon: Scale,
      iconColor: "text-purple-600"
    },
    {
      id: 16,
      title: "The Age Discrimination in Employment",
      organization: "Congress of the United States",
      type: "Law",
      policyType: "regulatory" as const,
      region: "USA",
      updated: "Jun 18, 2024",
      requirements: "+1",
      description: "The Age Discrimination in Employment Act of 1967 (ADEA) protects certain applicants and employees 40 years of age and older from discrimination on the basis of age in hiring, promotion, discharge, compensation, or terms, conditions or privileges of employment. The...",
      icon: Users2,
      iconColor: "text-gray-600"
    },
    // EU Regulatory Policies
    {
      id: 17,
      title: "Artificial Intelligence Act (AI Act)",
      organization: "European Parliament and the Council of the...",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Sep 30, 2025",
      requirements: "+27",
      description: "The Artificial Intelligence Act, also known as AI Act, is an AI law by the European Union. The Act aims to establish a unified regulatory and legal framework for all sectors and types of artificial intelligence. The AI Act adopts a risk-based approach where the obligations for a...",
      icon: Scale,
      iconColor: "text-purple-600"
    },
    {
      id: 18,
      title: "The Digital Operational Resilience Act (DORA)",
      organization: "European Commission",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Jun 27, 2025",
      requirements: "+27",
      description: "The Digital Operational Resilience Act (DORA), proposed on 24 September 2020, lays down rules on the security of financial entities' networks and information systems. It covers a variety of regulated financial entities, such as banks, insurance companies, and investment...",
      icon: AlertTriangle,
      iconColor: "text-gray-600"
    },
    {
      id: 19,
      title: "New Product Liability Directive",
      organization: "European Commission",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Apr 3, 2025",
      requirements: "+27",
      description: "The New Product Liability Directive is set to replace the EU's Product Liability Directive (85/374/EEC) of 1985 by modernising strict liability rules for manufacturers and ensuring relevance in the digital age. The Directive addresses the development of new...",
      icon: Shield,
      iconColor: "text-green-600"
    },
    {
      id: 20,
      title: "Cyber Resilience Act (CRA)",
      organization: "European Parliament and the Council of the...",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Apr 3, 2025",
      requirements: "+27",
      description: "The Cyber Resilience Act (CRA) is an European Union regulation on horizontal cybersecurity requirements for products with digital elements. It applies to the cybersecurity of products with digital elements within the EU's internal market and would amend Regulation...",
      icon: Shield,
      iconColor: "text-green-600"
    },
    {
      id: 21,
      title: "European Health Data Space Regulation",
      organization: "European Commission",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Mar 5, 2025",
      requirements: "+27",
      description: "The Proposal for the European Health Data Space Regulation (EHDSR) was published on May 3, 2022, and it is currently in the midst of the legislative process. Once the Regulation enters into force, it will stand as a significant piece of European Union legislation govern...",
      icon: Database,
      iconColor: "text-gray-600"
    },
    {
      id: 22,
      title: "Digital Markets Act (DMA)",
      organization: "European Parliament and the Council of the...",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Oct 17, 2024",
      requirements: "+27",
      description: "The Digital Markets Act (DMA) aims to make the markets in the digital sector fairer and more contestable for both end users and businesses. The DMA establishes uniform rules to prevent unfair trading practices and ensure that consumers encounter when using large gatlin...",
      icon: Globe,
      iconColor: "text-purple-600"
    },
    {
      id: 23,
      title: "Medical Devices Regulation (MDR)",
      organization: "European Parliament and the Council of the...",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Oct 17, 2024",
      requirements: "+27",
      description: "Medical Devices Regulation, also known as MDR, is a European Union legislation regulating the placing on the market, making available on the market, or putting into service medical devices for human use and accessories for such medical devices. The Regulation applies...",
      icon: Shield,
      iconColor: "text-green-600"
    },
    {
      id: 24,
      title: "Data Act",
      organization: "European Parliament and the Council of the...",
      type: "Law",
      policyType: "regulatory" as const,
      region: "Europe",
      updated: "Oct 17, 2024",
      requirements: "+27",
      description: "The Data Act entered into force on January 2024. It provides harmonised rules on fair access and use of data. The Act regulates companies, specifically manufacturers of connected products and providers of related services, to share data collected through thei...",
      icon: Database,
      iconColor: "text-gray-600"
    }
  ];

  const filteredPolicies = policyCards.filter(policy => {
    const matchesType = selectedFilter === 'all' || policy.policyType === selectedFilter;
    const matchesRegion = selectedRegion === 'all' || policy.region === selectedRegion || (selectedRegion === 'USA' && policy.region === 'USA') || (selectedRegion === 'Europe' && policy.region === 'Europe');
    return matchesType && matchesRegion;
  });

  const handleCreatePolicy = () => {
    navigate('/rai?section=create-policy');
  };

  const filterButtons = [
    { key: 'all', label: 'All Policies', count: policyCards.length },
    { key: 'internal', label: 'Internal', count: policyCards.filter(p => p.policyType === 'internal').length },
    { key: 'regulatory', label: 'Regulatory', count: policyCards.filter(p => p.policyType === 'regulatory').length },
  ];

  const regionButtons = [
    { key: 'all', label: 'All Regions', count: policyCards.length },
    { key: 'USA', label: 'USA', count: policyCards.filter(p => p.region === 'USA').length },
    { key: 'Europe', label: 'Europe', count: policyCards.filter(p => p.region === 'Europe').length },
  ];

  return (
    <PageLayout>
      <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Type Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex gap-2">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilter === filter.key
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      selectedFilter === filter.key
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Region Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Region:</span>
              <div className="flex gap-2">
                {regionButtons.map((region) => (
                  <button
                    key={region.key}
                    onClick={() => setSelectedRegion(region.key as any)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedRegion === region.key
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {region.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      selectedRegion === region.key
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {region.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <Button
            label="Create Policy"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreatePolicy}
          />
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <PolicyCard
            key={policy.id}
            {...policy}
            onClick={() => {
              // Policy card detail view not implemented
            }}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default PolicyDashboard;
