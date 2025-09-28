import  { useState, useMemo } from 'react'
import { useGet } from '../../Hook/API/useApiGet';
import { useMutate } from '../../Hook/API/useApiMutate';
import { 
  ArrowLeft, 
  User, 
  Save, 
  X, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square,
  MinusSquare,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import ReusableForm from './ReusableForm';

interface Permission {
  id: number;
  name: string;
}

interface PermissionSection {
  section: string;
  subsections: {
    subsection: string;
    actions: Permission[];
  }[];
}


export default function AddRole({ onBack }: { onBack: () => void }) {
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: permissionsResponse, isLoading, error, refetch } = useGet<Permission[]>({
    endpoint: `/api/role-permissions/permissions/`,
    queryKey: ['all-permissions'],
  });

  const { mutate: createRole, isLoading: isCreating } = useMutate<Record<string, unknown>>({
    endpoint: '/api/business/roles/',
    method: 'post',
    onSuccess: () => {
      onBack(); 
    },
  });

  // تحديث حقول الفورم لتشمل section و subsection و action
  const formFields = [
    { name: 'section', label: 'Section', required: true, type: 'text' },
    { name: 'subsection', label: 'Subsection', required: true, type: 'text' },
    { name: 'action', label: 'Action', required: true, type: 'text' },
  ];

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  // Organize permissions in structured format
  const organizedPermissions = useMemo((): PermissionSection[] => {
    if (!permissionsResponse) return [];

    const sectionsMap = new Map<string, Map<string, Permission[]>>();

    permissionsResponse.forEach(permission => {
      const [section, subsection] = permission.name.split('.');
      
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, new Map());
      }
      
      const subsectionMap = sectionsMap.get(section)!;
      if (!subsectionMap.has(subsection)) {
        subsectionMap.set(subsection, []);
      }
      
      subsectionMap.get(subsection)!.push(permission);
    });

    const result: PermissionSection[] = [];
    sectionsMap.forEach((subsections, section) => {
      const sectionData: PermissionSection = {
        section,
        subsections: []
      };

      subsections.forEach((actions, subsection) => {
        sectionData.subsections.push({
          subsection,
          actions: actions.sort((a, b) => a.name.localeCompare(b.name))
        });
      });

      sectionData.subsections.sort((a, b) => a.subsection.localeCompare(b.subsection));
      result.push(sectionData);
    });

    return result.sort((a, b) => a.section.localeCompare(b.section));
  }, [permissionsResponse]);

  // Filter permissions based on search term and section filter
  const filteredPermissions = useMemo(() => {
    if (!organizedPermissions) return [];

    return organizedPermissions.filter(section => {
      // Filter by section if selected
      if (filterSection && section.section !== filterSection) return false;
      
      // Filter by search term
      if (searchTerm) {
        const matchesSearch = section.subsections.some(subsection =>
          subsection.actions.some(permission =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subsection.subsection.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.section.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [organizedPermissions, searchTerm, filterSection]);

  // Get unique sections for filter dropdown
  const uniqueSections = useMemo(() => {
    if (!organizedPermissions) return [];
    return organizedPermissions.map(section => section.section);
  }, [organizedPermissions]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleSubsection = (subsectionPermissions: Permission[]) => {
    const allSelected = subsectionPermissions.every(p => selectedPermissions.includes(p.id));
    
    if (allSelected) {
      setSelectedPermissions(prev => 
        prev.filter(id => !subsectionPermissions.some(p => p.id === id))
      );
    } else {
      const newPermissions = subsectionPermissions.map(p => p.id);
      setSelectedPermissions(prev => {
        const filtered = prev.filter(id => !subsectionPermissions.some(p => p.id === id));
        return [...filtered, ...newPermissions];
      });
    }
  };

  const toggleSectionAll = (section: PermissionSection) => {
    const allPermissions = section.subsections.flatMap(sub => sub.actions.map(p => p.id));
    const allSelected = allPermissions.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !allPermissions.includes(id)));
    } else {
      setSelectedPermissions(prev => {
        const filtered = prev.filter(id => !allPermissions.includes(id));
        return [...filtered, ...allPermissions];
      });
    }
  };

  const handleSubmit = () => {
    if (!roleName.trim()) {
      setShowAlert(true);
      return;
    }

    const roleData = {
      role_name: roleName,
      role_permissions: selectedPermissions  
    };

    createRole(roleData);
  };

  const getSectionStats = (section: PermissionSection) => {
    const totalPermissions = section.subsections.reduce((acc, sub) => acc + sub.actions.length, 0);
    const selectedInSection = section.subsections.reduce((acc, sub) => 
      acc + sub.actions.filter(p => selectedPermissions.includes(p.id)).length, 0
    );
    return { total: totalPermissions, selected: selectedInSection };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSection('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading permissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-red-800">Error loading permissions: {error.message}</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isFormValid = roleName.trim() !== '' && selectedPermissions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">

        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>
          Add Role
        </h1>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
        className="bg-primary cursor-pointer hover:bg-blue-900 text-white px-8 py-4 rounded-lg flex items-center gap-3 transition-colors duration-200 text-sm font-medium"
      >
        <Plus  className='text-md'/>
        Add permission
      </button>
              </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {showAlert && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex justify-between items-center">
            <p className="text-yellow-800">Please enter a role name and select at least one permission</p>
            <button 
              onClick={() => setShowAlert(false)}
              className="text-yellow-600 hover:text-yellow-800"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="relative max-w-md">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., Administrator, Editor, Viewer"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Permissions Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Select permissions to assign to this role</p>
          </div>
          <div className={`inline-flex items-center px-3 py-2 rounded-full border text-sm font-medium ${
            selectedPermissions.length > 0 
              ? 'border-blue-200 bg-blue-50 text-blue-700' 
              : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {selectedPermissions.length} permissions selected
          </div>
        </div>

      

        {/* Search and Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                aria-label="Filter by section"
              >
                <option value="">All Sections</option>
                {uniqueSections.map(section => (
                  <option key={section} value={section} className="capitalize">
                    {section}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {(searchTerm || filterSection) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Permissions List */}
        <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No permissions found matching your criteria.</p>
            </div>
          ) : (
            filteredPermissions.map((section) => {
              const stats = getSectionStats(section);
              const allSelected = stats.selected === stats.total;
              const someSelected = stats.selected > 0 && stats.selected < stats.total;

              return (
                <div 
                  key={section.section} 
                  className="border-b border-gray-200 last:border-b-0 bg-white"
                >
                  {/* Section Header */}
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={allSelected}
                          onChange={() => toggleSectionAll(section)}
                        />
                        <div className="flex items-center">
                          {allSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : someSelected ? (
                            <MinusSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </label>
                      <div>
                        <span className="font-semibold text-gray-800 capitalize text-lg">
                          {section.section}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.subsections.length} subsections • {stats.total} permissions
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats.selected > 0 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {stats.selected}/{stats.total} selected
                      </span>
                      <button 
                        onClick={() => toggleSection(section.section)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      >
                        {expandedSections[section.section] ? 
                          <ChevronUp className="h-5 w-5" /> : 
                          <ChevronDown className="h-5 w-5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Section Content */}
                  {expandedSections[section.section] && (
                    <div className="px-4 pb-4 bg-gray-50">
                      {section.subsections.map((subsection) => {
                        const subsectionPermissions = subsection.actions;
                        const allSubSelected = subsectionPermissions.every(p => selectedPermissions.includes(p.id));
                        const someSubSelected = subsectionPermissions.some(p => selectedPermissions.includes(p.id));

                        return (
                          <div 
                            key={subsection.subsection} 
                            className={`mb-4 border rounded-lg ${
                              someSubSelected 
                                ? 'border-blue-200 bg-blue-25' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {/* Subsection Header */}
                            <div className={`flex justify-between items-center p-4 ${
                              someSubSelected ? 'bg-blue-50' : 'bg-gray-50'
                            }`}>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={allSubSelected}
                                  onChange={() => toggleSubsection(subsectionPermissions)}
                                />
                                <div className="flex items-center">
                                  {allSubSelected ? (
                                    <CheckSquare className="h-5 w-5 text-blue-600 mr-3" />
                                  ) : someSubSelected ? (
                                    <MinusSquare className="h-5 w-5 text-blue-600 mr-3" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400 mr-3" />
                                  )}
                                  <div>
                                    <span className="font-medium text-gray-800 capitalize text-base">
                                      {subsection.subsection}
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {subsectionPermissions.length} permissions available
                                    </p>
                                  </div>
                                </div>
                              </label>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                allSubSelected 
                                  ? 'bg-green-100 text-green-800' 
                                  : someSubSelected 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {subsectionPermissions.filter(p => selectedPermissions.includes(p.id)).length}/{subsectionPermissions.length}
                              </span>
                            </div>

                            {/* Permissions Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                              {subsectionPermissions.map((permission) => (
                                <label 
                                  key={permission.id}
                                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <div className="ml-3">
                                    <span className={`text-sm font-medium capitalize ${
                                      selectedPermissions.includes(permission.id) 
                                        ? 'text-blue-600' 
                                        : 'text-gray-700'
                                    }`}>
                                      {permission.name.split('.').pop()?.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                      {permission.name}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <button 
          onClick={onBack}
          disabled={isCreating}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!isFormValid || isCreating}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Role...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Role
            </>
          )}
        </button>
      </div>

      {isCreateModalOpen && (
        <ReusableForm
          title="Permission"
          fields={formFields}
          endpoint="/api/role-permissions/permissions/"
          method="post"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          submitButtonText="Create Permission"
          key="create-form"
        />
      )}
    </div>
  );
}