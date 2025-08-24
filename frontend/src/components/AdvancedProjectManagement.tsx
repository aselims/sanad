import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Link,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

interface ProjectResource {
  id: string;
  name: string;
  type: string;
  status: string;
  budgetAllocated: number;
  budgetUsed: number;
  utilizationPercentage: number;
  isCritical: boolean;
  assignedTo?: { email: string };
}

interface ProjectRisk {
  id: string;
  title: string;
  category: string;
  probability: string;
  impact: string;
  status: string;
  riskScore: number;
  priorityLevel: number;
  owner?: { email: string };
  potentialCostImpact?: number;
}

interface ProjectDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  accessLevel: string;
  fileSize: number;
  viewCount: number;
  downloadCount: number;
  createdBy: { email: string };
  createdAt: string;
  isConfidential: boolean;
}

interface ProjectUpdate {
  id: string;
  title: string;
  type: string;
  healthStatus?: string;
  overallProgressPercentage?: number;
  scheduleVarianceDays?: number;
  budgetVariancePercentage?: number;
  activeBlockers: number;
  resolvedIssues: number;
  createdAt: string;
  createdBy: { email: string };
  requiresAttention: boolean;
}

interface MilestoneDependency {
  id: string;
  type: string;
  status: string;
  lagDays: number;
  isHardConstraint: boolean;
  predecessorMilestone: { id: string; title: string };
  successorMilestone: { id: string; title: string };
}

interface Props {
  projectId: string;
}

const AdvancedProjectManagement: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [dependencies, setDependencies] = useState<MilestoneDependency[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [
        resourcesRes,
        risksRes,
        documentsRes,
        updatesRes,
        dependenciesRes,
        healthRes
      ] = await Promise.all([
        fetch(`/api/project-resources/project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/project-risks/project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/project-documents/project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/project-updates/project/${projectId}?limit=20`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/milestone-dependencies/project/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/project-updates/project/${projectId}/health`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const resourcesData = await resourcesRes.json();
      const risksData = await risksRes.json();
      const documentsData = await documentsRes.json();
      const updatesData = await updatesRes.json();
      const dependenciesData = await dependenciesRes.json();
      const healthData = await healthRes.json();

      setResources(resourcesData.resources || []);
      setRisks(risksData.risks || []);
      setDocuments(documentsData.documents || []);
      setUpdates(updatesData.updates || []);
      setDependencies(dependenciesData.dependencies || []);
      setHealthMetrics(healthData);

    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string): string => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      fair: 'text-yellow-600 bg-yellow-100',
      at_risk: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getRiskPriorityColor = (level: number): string => {
    if (level <= 2) return 'text-red-600 bg-red-100';
    if (level === 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Project Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive project health monitoring, resource management, and analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {healthMetrics?.currentHealth && (
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gray-400" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(healthMetrics.currentHealth.status)}`}>
                  {healthMetrics.currentHealth.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">Score: {healthMetrics.currentHealth.score}/100</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'resources', name: 'Resources', icon: Users },
              { id: 'risks', name: 'Risks', icon: Shield },
              { id: 'documents', name: 'Documents', icon: FileText },
              { id: 'updates', name: 'Updates', icon: Activity },
              { id: 'dependencies', name: 'Dependencies', icon: Link }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Health Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Health Trends</h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Health trend chart would go here</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="ml-2 text-sm font-medium text-blue-900">Progress</span>
                      </div>
                      <p className="mt-1 text-2xl font-semibold text-blue-900">
                        {updates[0]?.overallProgressPercentage || 0}%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="ml-2 text-sm font-medium text-green-900">Budget Status</span>
                      </div>
                      <p className="mt-1 text-2xl font-semibold text-green-900">
                        {updates[0]?.budgetVariancePercentage ? 
                          `${updates[0].budgetVariancePercentage > 0 ? '+' : ''}${updates[0].budgetVariancePercentage}%` : 
                          'On Track'
                        }
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="ml-2 text-sm font-medium text-red-900">Active Issues</span>
                      </div>
                      <p className="mt-1 text-2xl font-semibold text-red-900">
                        {risks.filter(r => r.status === 'active').length + 
                         updates.reduce((sum, u) => sum + u.activeBlockers, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold">{resources.length}</h4>
                      <p className="text-sm text-gray-600">Resources</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold">{risks.length}</h4>
                      <p className="text-sm text-gray-600">Risks</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold">{documents.length}</h4>
                      <p className="text-sm text-gray-600">Documents</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Link className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold">{dependencies.length}</h4>
                      <p className="text-sm text-gray-600">Dependencies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Project Resources</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </button>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {resource.name}
                                {resource.isCritical && (
                                  <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {resource.assignedTo?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resource.type.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            resource.status === 'in_use' ? 'bg-green-100 text-green-800' :
                            resource.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                            resource.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {resource.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>${resource.budgetUsed.toLocaleString()} / ${resource.budgetAllocated.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {((resource.budgetUsed / resource.budgetAllocated) * 100).toFixed(1)}% used
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${resource.utilizationPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">{resource.utilizationPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Risk Management</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {risks.map((risk) => (
                  <div key={risk.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{risk.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskPriorityColor(risk.priorityLevel)}`}>
                            Priority {risk.priorityLevel}
                          </span>
                          <span className="text-sm text-gray-500">Risk Score: {risk.riskScore}</span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span className="capitalize">{risk.category}</span>
                          <span>•</span>
                          <span className="capitalize">{risk.probability} probability</span>
                          <span>•</span>
                          <span className="capitalize">{risk.impact} impact</span>
                          {risk.potentialCostImpact && (
                            <>
                              <span>•</span>
                              <span>${risk.potentialCostImpact.toLocaleString()} potential cost</span>
                            </>
                          )}
                        </div>
                        {risk.owner && (
                          <div className="mt-1 text-sm text-gray-500">
                            Owner: {risk.owner.email}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          risk.status === 'active' ? 'bg-red-100 text-red-800' :
                          risk.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                          risk.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {risk.status.replace('_', ' ')}
                        </span>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {documents.map((document) => (
                  <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 flex items-center">
                            {document.title}
                            {document.isConfidential && (
                              <Shield className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            document.status === 'approved' ? 'bg-green-100 text-green-800' :
                            document.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            document.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {document.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span className="capitalize">{document.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>•</span>
                          <span>{document.viewCount} views</span>
                          <span>•</span>
                          <span>{document.downloadCount} downloads</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Created by {document.createdBy.email} on {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Project Updates</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Update
                </button>
              </div>

              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{update.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            update.type === 'health_check' ? 'bg-blue-100 text-blue-800' :
                            update.type === 'risk_alert' ? 'bg-red-100 text-red-800' :
                            update.type === 'milestone_progress' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.type.replace('_', ' ')}
                          </span>
                          {update.requiresAttention && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          {update.healthStatus && (
                            <>
                              <span className="capitalize">Health: {update.healthStatus.replace('_', ' ')}</span>
                              <span>•</span>
                            </>
                          )}
                          {update.overallProgressPercentage !== null && (
                            <>
                              <span>Progress: {update.overallProgressPercentage}%</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Blockers: {update.activeBlockers}</span>
                          <span>•</span>
                          <span>Resolved: {update.resolvedIssues}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          By {update.createdBy.email} on {new Date(update.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Milestone Dependencies</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dependency
                </button>
              </div>

              <div className="space-y-4">
                {dependencies.map((dependency) => (
                  <div key={dependency.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <span className="text-blue-800 font-medium text-sm">
                          {dependency.predecessorMilestone.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {dependency.type === 'finish_to_start' && <ArrowRight className="h-4 w-4 text-gray-400" />}
                        {dependency.type === 'start_to_start' && <ArrowDown className="h-4 w-4 text-gray-400" />}
                        <span className="text-xs text-gray-500 capitalize">
                          {dependency.type.replace('_', ' ')}
                        </span>
                        {dependency.lagDays !== 0 && (
                          <span className="text-xs text-gray-500">
                            ({dependency.lagDays > 0 ? '+' : ''}{dependency.lagDays} days)
                          </span>
                        )}
                      </div>
                      <div className="bg-green-100 p-2 rounded-lg">
                        <span className="text-green-800 font-medium text-sm">
                          {dependency.successorMilestone.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          dependency.status === 'satisfied' ? 'bg-green-100 text-green-800' :
                          dependency.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          dependency.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dependency.status}
                        </span>
                        {dependency.isHardConstraint && (
                          <span className="text-xs text-red-600 font-medium">Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedProjectManagement;