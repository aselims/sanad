import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Lightbulb,
  Briefcase,
  Users,
  UserCheck,
  DollarSign,
  PieChart,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  icon: React.ReactNode;
  collapsed?: boolean;
}

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

export const VentureStudioSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const sidebarSections: SidebarSection[] = [
    {
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      items: [
        {
          title: 'Overview',
          path: '/',
          icon: <Home className="w-4 h-4" />,
          description: 'Main platform overview'
        },
        ...(user?.role === 'admin' ? [{
          title: 'Admin Dashboard',
          path: '/admin',
          icon: <Settings className="w-4 h-4" />,
          description: 'Idea review & management',
          badge: 'Admin'
        }] : [])
      ]
    },
    {
      title: 'Ideas & Innovation',
      icon: <Lightbulb className="w-5 h-5" />,
      items: [
        {
          title: 'Browse Ideas',
          path: '/ideas',
          icon: <Search className="w-4 h-4" />,
          description: 'Discover innovative ideas'
        },
        {
          title: 'Submit New Idea',
          path: '/submit-idea',
          icon: <Lightbulb className="w-4 h-4" />,
          description: 'New 5-step submission wizard'
        },
        {
          title: 'Find Co-Founders',
          path: '/find-cofounders',
          icon: <Users className="w-4 h-4" />,
          description: 'Match with co-founders'
        }
      ]
    },
    {
      title: 'Project Management',
      icon: <Briefcase className="w-5 h-5" />,
      items: [
        {
          title: 'Projects Dashboard',
          path: '/projects',
          icon: <Briefcase className="w-4 h-4" />,
          description: 'Manage project portfolio'
        },
        {
          title: 'Create Project',
          path: '/projects/new',
          icon: <Target className="w-4 h-4" />,
          description: 'Convert idea to project'
        }
      ]
    },
    {
      title: 'Team & Collaboration',
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          title: 'Teams',
          path: '/teams',
          icon: <Users className="w-4 h-4" />,
          description: 'Form and manage teams'
        },
        {
          title: 'Mentors',
          path: '/mentors',
          icon: <UserCheck className="w-4 h-4" />,
          description: 'Find mentors & experts'
        },
        {
          title: 'Innovators',
          path: '/innovators',
          icon: <Zap className="w-4 h-4" />,
          description: 'Browse innovator profiles'
        }
      ]
    },
    {
      title: 'Funding & Investment',
      icon: <DollarSign className="w-5 h-5" />,
      items: [
        {
          title: 'Investors Directory',
          path: '/investors',
          icon: <DollarSign className="w-4 h-4" />,
          description: 'Connect with investors'
        },
        {
          title: 'Investment Dashboard',
          path: '/investments',
          icon: <PieChart className="w-4 h-4" />,
          description: 'Track investment pipeline'
        },
        {
          title: 'Investor Onboarding',
          path: '/investors/onboarding',
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Become an investor'
        }
      ]
    },
    {
      title: 'Legacy Workspace',
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          title: 'All Collaborations',
          path: '/workspace',
          icon: <Search className="w-4 h-4" />,
          description: 'Original workspace view'
        },
        {
          title: 'Challenges',
          path: '/workspace?filter=challenges',
          icon: <Target className="w-4 h-4" />,
          description: 'Innovation challenges'
        },
        {
          title: 'Partnerships',
          path: '/workspace?filter=partnerships',
          icon: <Users className="w-4 h-4" />,
          description: 'Business partnerships'
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path) || location.search.includes(path.split('?')[1] || '');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Venture Studio</h2>
            <p className="text-sm text-gray-500">Navigation Hub</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full mb-3 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center space-x-2">
                {section.icon}
                <span>{section.title}</span>
              </div>
              {collapsedSections[section.title] ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {!collapsedSections[section.title] && (
              <div className="space-y-1 ml-2">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};