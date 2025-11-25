import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { StaffProfile } from '@/components/StaffProfile';
import { StudentProfile } from '@/components/StudentProfile';
import { FileText, MessageSquare, Building, LogOut, ChevronLeft, Calendar, BookOpen, Users, TrendingUp, Ban, AlertTriangle, BarChart3 } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MainAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail' | 'branch' | 'filtered' | 'staff-list' | 'staff-profile' | 'student-list' | 'student-profile'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'total' | 'open' | 'fixed' | 'brocamp' | 'online' | 'cancelled' | 'exclusive' | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('today');
  const [studentFilter, setStudentFilter] = useState<'all' | 'top_credit' | 'banned'>('all');
  const [staffFilter, setStaffFilter] = useState<'all' | 'top_credit' | 'negative' | 'most_handled'>('all');

  // Redirect if not main admin
  useEffect(() => {
    if (profile && profile.role !== 'main_admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  // Read URL parameters and set state
  useEffect(() => {
    const view = searchParams.get('view');
    const id = searchParams.get('id');
    
    if (view === 'detail' && id) {
      setSelectedView('detail');
      setSelectedComplaintId(id);
    } else if (view === 'complaints') {
      setSelectedView('complaints');
    } else if (view === 'branch') {
      const branch = searchParams.get('branch');
      if (branch) {
        setSelectedView('branch');
        setSelectedBranch(branch);
      }
    }
  }, [searchParams]);


  // Get date ranges
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.toISOString();
  };

  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'yearly':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return '1970-01-01';
    }
  };

  // Stats based on time range
  const { data: stats } = useQuery({
    queryKey: ['main-admin-stats', timeRange],
    queryFn: async () => {
      const rangeStart = getTimeRangeDate();
      
      const query = supabase
        .from('complaints')
        .select('id, status, student_type, branch');
      
      if (timeRange !== 'lifetime') {
        query.gte('created_at', rangeStart);
      }

      const { data: complaints } = await query;

      return {
        total: complaints?.length || 0,
        open: complaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        brocamp: complaints?.filter(c => c.student_type === 'brocamp').length || 0,
        online: complaints?.filter(c => c.branch === 'Online').length || 0,
        cancelled: complaints?.filter(c => c.status === 'cancelled').length || 0,
        exclusive: complaints?.filter(c => c.student_type === 'exclusive').length || 0,
      };
    },
  });

  // Branch-specific stats for selected branch
  const { data: branchRangeStats } = useQuery({
    queryKey: ['branch-range-stats', selectedBranch, timeRange],
    queryFn: async () => {
      if (!selectedBranch) return null;
      
      const rangeStart = getTimeRangeDate();
      
      const query = supabase
        .from('complaints')
        .select('id, status, created_at, title, category, branch, student_type')
        .eq('branch', selectedBranch);
      
      if (timeRange !== 'lifetime') {
        query.gte('created_at', rangeStart);
      }

      const { data: complaints } = await query.order('created_at', { ascending: false });

      return {
        total: complaints?.length || 0,
        logged: complaints?.filter(c => c.status === 'logged').length || 0,
        noted: complaints?.filter(c => c.status === 'noted').length || 0,
        in_process: complaints?.filter(c => c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        cancelled: complaints?.filter(c => c.status === 'cancelled').length || 0,
        rejected: complaints?.filter(c => c.status === 'rejected').length || 0,
        brocamp: complaints?.filter(c => c.student_type === 'brocamp').length || 0,
        online: selectedBranch === 'Online' ? complaints?.length || 0 : 0,
        exclusive: complaints?.filter(c => c.student_type === 'exclusive').length || 0,
        complaints: complaints || [],
      };
    },
    enabled: !!selectedBranch,
  });

  // Filtered complaints for main admin cards
  const { data: filteredComplaints } = useQuery({
    queryKey: ['filtered-complaints', selectedFilter, timeRange],
    queryFn: async () => {
      if (!selectedFilter) return null;
      
      const rangeStart = getTimeRangeDate();
      
      let query = supabase
        .from('complaints')
        .select('id, title, category, status, student_type, branch, created_at')
        .order('created_at', { ascending: false });

      // Apply time range filter (unless lifetime)
      if (timeRange !== 'lifetime') {
        query = query.gte('created_at', rangeStart);
      }

      if (selectedFilter === 'open') {
        query = query.in('status', ['logged', 'noted', 'in_process']);
      } else if (selectedFilter === 'fixed') {
        query = query.eq('status', 'fixed');
      } else if (selectedFilter === 'brocamp') {
        query = query.eq('student_type', 'brocamp');
      } else if (selectedFilter === 'online') {
        query = query.eq('branch', 'Online');
      } else if (selectedFilter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      } else if (selectedFilter === 'exclusive') {
        query = query.eq('student_type', 'exclusive');
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!selectedFilter,
  });

  const { data: branchStats } = useQuery({
    queryKey: ['branch-breakdown'],
    queryFn: async () => {
      const { data: complaints } = await supabase
        .from('complaints')
        .select('branch');

      const branches = ['Kochi', 'Calicut - Kakkanchery', 'Trivandrum'];
      return branches.map(branch => ({
        name: branch,
        count: complaints?.filter(c => c.branch === branch).length || 0,
      }));
    },
  });

  // Fetch all staff and trainers
  const { data: allStaffData } = useQuery({
    queryKey: ['all-staff-trainers'],
    queryFn: async () => {
      const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['staff', 'trainer'])
        .order('branch', { ascending: true });

      // Get complaint counts for trainers
      const trainerIds = staff?.filter(s => s.role === 'trainer').map(s => s.id) || [];
      let trainerComplaintCounts: Record<string, number> = {};
      
      if (trainerIds.length > 0) {
        const { data: trainerComplaints } = await supabase
          .from('complaints')
          .select('assigned_trainer_id')
          .in('assigned_trainer_id', trainerIds);

        trainerComplaintCounts = trainerComplaints?.reduce((acc, c) => {
          if (c.assigned_trainer_id) {
            acc[c.assigned_trainer_id] = (acc[c.assigned_trainer_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>) || {};
      }

      // Get complaint counts for staff
      const staffIds = staff?.filter(s => s.role === 'staff').map(s => s.id) || [];
      let staffComplaintCounts: Record<string, number> = {};
      
      if (staffIds.length > 0) {
        const { data: staffComplaints } = await supabase
          .from('complaints')
          .select('assigned_staff_id')
          .in('assigned_staff_id', staffIds);

        staffComplaintCounts = staffComplaints?.reduce((acc, c) => {
          if (c.assigned_staff_id) {
            acc[c.assigned_staff_id] = (acc[c.assigned_staff_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>) || {};
      }

      return {
        allStaff: staff || [],
        trainerComplaintCounts,
        staffComplaintCounts,
      };
    },
  });

  // Fetch all students
  const { data: allStudentsData } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('branch', { ascending: true });

      return students || [];
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today':
        return 'Today';
      case 'weekly':
        return 'Last Week';
      case 'monthly':
        return 'Last Month';
      case 'yearly':
        return 'Last Year';
      case 'lifetime':
        return 'Lifetime';
      default:
        return 'Today';
    }
  };

  const renderContent = () => {
    if (selectedView === 'staff-profile' && selectedStaffId) {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('staff-list')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Staff List
          </Button>
          <StaffProfile 
            staffId={selectedStaffId}
            onBack={() => setSelectedView('staff-list')}
          />
        </div>
      );
    }

    if (selectedView === 'student-profile' && selectedStudentId) {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('student-list')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Student List
          </Button>
          <StudentProfile 
            studentId={selectedStudentId}
            onBack={() => setSelectedView('student-list')}
          />
        </div>
      );
    }

    if (selectedView === 'student-list') {
      // Group students by branch
      const branches = ['Kochi', 'Calicut - Kakkanchery', 'Trivandrum', 'Online'];
      
      // Apply filters
      let filteredStudents = allStudentsData || [];
      
      if (studentFilter === 'top_credit') {
        filteredStudents = [...filteredStudents].sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0));
      } else if (studentFilter === 'banned') {
        filteredStudents = filteredStudents.filter(s => s.banned_from_raise);
      }
      
      // If filtering, show all students in single sorted list; otherwise show by groups
      const showGrouped = studentFilter === 'all';
      
      const studentsByBranch = branches.reduce((acc, branch) => {
        acc[branch] = filteredStudents?.filter((s: any) => s.branch === branch) || [];
        return acc;
      }, {} as Record<string, any[]>);

      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">All Students</h2>
            <p className="text-muted-foreground">Complete overview of all students across branches</p>
          </div>
          
          {/* Student Filters */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            <Button
              variant={studentFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStudentFilter('all')}
              className="h-9 gap-2"
            >
              <Users className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={studentFilter === 'top_credit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStudentFilter('top_credit')}
              className="h-9 gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Top Credit
            </Button>
            <Button
              variant={studentFilter === 'banned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStudentFilter('banned')}
              className="h-9 gap-2"
            >
              <Ban className="w-4 h-4" />
              Banned
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* When filtering, show all students in single sorted list */}
            {!showGrouped && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {studentFilter === 'top_credit' && 'Top Credit Students'}
                      {studentFilter === 'banned' && 'Banned Students'}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-xl">{filteredStudents.length}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student: any) => (
                      <Card 
                        key={student.id} 
                        className="cursor-pointer hover:border-secondary/50 transition-all"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setSelectedView('student-profile');
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{student.full_name}</h3>
                              {student.banned_from_raise && (
                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">Banned</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{student.branch}</p>
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">Credits: {student.credits ?? 0}</span>
                              <span>Program: {student.program || 'Not Assigned'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* When not filtering, show grouped view */}
            {showGrouped && (
              <>
            {/* Individual Branches */}
            {branches.map((branchName) => {
              const branchStudents = studentsByBranch[branchName] || [];
              if (branchStudents.length === 0) return null;
              
              return (
                <Card key={branchName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {branchName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-xl">{branchStudents.length}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {branchStudents.map((student: any) => (
                        <Card 
                          key={student.id} 
                          className="cursor-pointer hover:border-secondary/50 transition-all"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setSelectedView('student-profile');
                          }}
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{student.full_name}</h3>
                                {student.banned_from_raise && (
                                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">Banned</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">Credits: {student.credits ?? 0}</p>
                              <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Program: {student.program || 'Not Assigned'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </>
            )}
          </div>
        </div>
      );
    }

    if (selectedView === 'staff-list') {
      // Apply filters
      let filteredStaff = allStaffData?.allStaff || [];
      
      if (staffFilter === 'top_credit') {
        filteredStaff = [...filteredStaff].sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0));
      } else if (staffFilter === 'negative') {
        filteredStaff = [...filteredStaff].sort((a, b) => (b.negative_count_lifetime ?? 0) - (a.negative_count_lifetime ?? 0));
      } else if (staffFilter === 'most_handled') {
        filteredStaff = [...filteredStaff].sort((a, b) => {
          const aCount = a.role === 'trainer' 
            ? (allStaffData?.trainerComplaintCounts?.[a.id] || 0)
            : (allStaffData?.staffComplaintCounts?.[a.id] || 0);
          const bCount = b.role === 'trainer'
            ? (allStaffData?.trainerComplaintCounts?.[b.id] || 0)
            : (allStaffData?.staffComplaintCounts?.[b.id] || 0);
          return bCount - aCount;
        });
      }
      
      // If filtering, show all staff in single sorted list; otherwise show by groups
      const showGrouped = staffFilter === 'all';
      
      const onlineStaff = filteredStaff?.filter((s: any) => s.branch === 'Online') || [];
      const exclusiveHandlers = filteredStaff?.filter((s: any) => s.handles_exclusive) || [];
      
      // Group staff by each BroCamp branch
      const branches = ['Kochi', 'Calicut - Kakkanchery', 'Trivandrum'];
      const staffByBranch = branches.reduce((acc, branch) => {
        acc[branch] = filteredStaff?.filter((s: any) => 
          s.branch === branch && !s.handles_exclusive
        ) || [];
        return acc;
      }, {} as Record<string, any[]>);

      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">All Branch Staff and Trainers</h2>
            <p className="text-muted-foreground">Complete overview of all team members across branches</p>
          </div>
          
          {/* Staff/Trainer Filters */}
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            <Button
              variant={staffFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStaffFilter('all')}
              className="h-9 gap-2"
            >
              <Users className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={staffFilter === 'top_credit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStaffFilter('top_credit')}
              className="h-9 gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Top Credit Staff
            </Button>
            <Button
              variant={staffFilter === 'negative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStaffFilter('negative')}
              className="h-9 gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Negative Staff
            </Button>
            <Button
              variant={staffFilter === 'most_handled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStaffFilter('most_handled')}
              className="h-9 gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Most Handled
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* When filtering, show all staff in single sorted list */}
            {!showGrouped && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {staffFilter === 'top_credit' && 'Top Credit Staff & Trainers'}
                      {staffFilter === 'negative' && 'Staff & Trainers by Negative Count'}
                      {staffFilter === 'most_handled' && 'Most Handled Concerns'}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-xl">{filteredStaff.length}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStaff.map((member: any) => (
                      <Card 
                        key={member.id} 
                        className="cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => {
                          setSelectedStaffId(member.id);
                          setSelectedView('staff-profile');
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{member.full_name}</h3>
                              {member.high_alert && (
                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">High Alert</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{member.role} • {member.branch}</p>
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">Credits: {member.credits ?? 0}</span>
                              <span>Negatives: {member.negative_count_lifetime ?? 0}</span>
                              {member.role === 'trainer' && (
                                <span>Concerns: {allStaffData?.trainerComplaintCounts?.[member.id] || 0}</span>
                              )}
                              {member.role === 'staff' && (
                                <span>Concerns: {allStaffData?.staffComplaintCounts?.[member.id] || 0}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* When not filtering, show grouped view */}
            {showGrouped && (
              <>
            {/* Online Branch Staff and Trainers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Online Branch
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-xl text-primary">{onlineStaff.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {onlineStaff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {onlineStaff.map((member: any) => (
                      <Card 
                        key={member.id} 
                        className="cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => {
                          setSelectedStaffId(member.id);
                          setSelectedView('staff-profile');
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{member.full_name}</h3>
                              {member.high_alert && (
                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">High Alert</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Credits: {member.credits ?? 0}</span>
                              <span>Negatives: {member.negative_count_lifetime ?? 0}</span>
                              {member.role === 'trainer' && (
                                <span>Concerns: {allStaffData?.trainerComplaintCounts?.[member.id] || 0}</span>
                              )}
                              {member.role === 'staff' && (
                                <span>Concerns: {allStaffData?.staffComplaintCounts?.[member.id] || 0}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No online staff or trainers found</p>
                )}
              </CardContent>
            </Card>

            {/* Exclusive Handlers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-secondary" />
                    Exclusive Handlers
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-xl text-secondary">{exclusiveHandlers.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {exclusiveHandlers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exclusiveHandlers.map((member: any) => (
                      <Card 
                        key={member.id} 
                        className="cursor-pointer hover:border-secondary/50 transition-all"
                        onClick={() => {
                          setSelectedStaffId(member.id);
                          setSelectedView('staff-profile');
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{member.full_name}</h3>
                              {member.high_alert && (
                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">High Alert</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{member.role} • {member.branch}</p>
                            <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Credits: {member.credits ?? 0}</span>
                              <span>Negatives: {member.negative_count_lifetime ?? 0}</span>
                              {member.role === 'trainer' && (
                                <span>Concerns: {allStaffData?.trainerComplaintCounts?.[member.id] || 0}</span>
                              )}
                              {member.role === 'staff' && (
                                <span>Concerns: {allStaffData?.staffComplaintCounts?.[member.id] || 0}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No exclusive handlers found</p>
                )}
              </CardContent>
            </Card>

            {/* Individual BroCamp Branches */}
            {branches.map((branchName) => {
              const branchStaff = staffByBranch[branchName] || [];
              if (branchStaff.length === 0) return null;
              
              return (
                <Card key={branchName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {branchName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-xl">{branchStaff.length}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {branchStaff.map((member: any) => (
                        <Card 
                          key={member.id} 
                          className="cursor-pointer hover:border-primary/50 transition-all"
                          onClick={() => {
                            setSelectedStaffId(member.id);
                            setSelectedView('staff-profile');
                          }}
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{member.full_name}</h3>
                                {member.high_alert && (
                                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">High Alert</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                              <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Credits: {member.credits ?? 0}</span>
                                <span>Negatives: {member.negative_count_lifetime ?? 0}</span>
                                {member.role === 'trainer' && (
                                  <span>Concerns: {allStaffData?.trainerComplaintCounts?.[member.id] || 0}</span>
                                )}
                                {member.role === 'staff' && (
                                  <span>Concerns: {allStaffData?.staffComplaintCounts?.[member.id] || 0}</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </>
            )}
          </div>
        </div>
      );
    }

    if (selectedView === 'detail' && selectedComplaintId) {
          return (
            <ComplaintDetails 
              complaintId={selectedComplaintId}
              onBack={() => {
                if (selectedBranch) {
                  setSelectedView('branch');
                } else if (selectedFilter) {
                  setSelectedView('filtered');
                } else {
                  setSelectedView('complaints');
                }
              }}
            />
          );
    }

    if (selectedView === 'complaints') {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => setSelectedView('dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ComplaintsList
            onComplaintClick={(complaint) => {
              setSelectedComplaintId(complaint.id);
              setSelectedView('detail');
            }}
          />
        </div>
      );
    }

    if (selectedView === 'filtered' && selectedFilter) {
      const filterTitles = {
        total: 'All Concerns',
        open: 'Open Concerns',
        fixed: 'Fixed Concerns',
        brocamp: 'BroCamp Concerns',
        online: 'Online Concerns',
        cancelled: 'Cancelled Concerns',
        exclusive: 'Exclusive Member Concerns',
      };

      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setSelectedFilter(null);
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{filterTitles[selectedFilter]}</h2>
            <p className="text-muted-foreground">Today's complaints</p>
          </div>

          <div className="space-y-2">
            {filteredComplaints?.map((complaint) => (
              <Card 
                key={complaint.id} 
                className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSelectedComplaintId(complaint.id);
                  setSelectedView('detail');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{complaint.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {complaint.category.replace(/_/g, ' ')} • {complaint.branch}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
            {(!filteredComplaints || filteredComplaints.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No concerns found
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedView === 'branch' && selectedBranch) {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setSelectedBranch(null);
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{selectedBranch} Branch</h2>
            <p className="text-muted-foreground">Detailed tracking and analytics</p>
          </div>

          {/* Branch Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">All Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{branchRangeStats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{branchRangeStats?.brocamp || 0}</div>
              </CardContent>
            </Card>

            {selectedBranch === 'Online' && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">{branchRangeStats?.online || 0}</div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Exclusive Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{branchRangeStats?.exclusive || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* All Concerns Tracking Section for Branch */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">All Concerns Tracking</h3>
              </div>
            </div>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{branchRangeStats?.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-500">{branchRangeStats?.logged || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Logged</p>
                  </div>
                  <div className="text-center p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-500">{branchRangeStats?.noted || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Noted</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-500">{branchRangeStats?.in_process || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">In Process</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-500">{branchRangeStats?.fixed || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Fixed</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-500">{branchRangeStats?.cancelled || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="text-2xl font-bold text-red-500">{branchRangeStats?.rejected || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Rejected</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {branchRangeStats?.complaints?.map((complaint: any) => (
                    <Card 
                      key={complaint.id} 
                      className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        setSelectedComplaintId(complaint.id);
                        setSelectedView('detail');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{complaint.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {complaint.category.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!branchRangeStats?.complaints || branchRangeStats.complaints.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No concerns found for this time range
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Global Overview</h2>
          <p className="text-muted-foreground">Monitor all branches and manage the entire system</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Statistics Overview</h3>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="weekly">Last Week</SelectItem>
              <SelectItem value="monthly">Last Month</SelectItem>
              <SelectItem value="yearly">Last Year</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <Card 
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => {
              setSelectedFilter('total');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary group-hover:scale-105 transition-transform">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 cursor-pointer hover:border-secondary/50 transition-all group"
            onClick={() => {
              setSelectedFilter('open');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary group-hover:scale-105 transition-transform">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30 cursor-pointer hover:border-status-fixed/50 transition-all group"
            onClick={() => {
              setSelectedFilter('fixed');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Fixed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed group-hover:scale-105 transition-transform">{stats?.fixed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 cursor-pointer hover:border-accent/50 transition-all group"
            onClick={() => {
              setSelectedFilter('brocamp');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">BroCamp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent group-hover:scale-105 transition-transform">{stats?.brocamp || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 cursor-pointer hover:border-blue-500/50 transition-all group"
            onClick={() => {
              setSelectedFilter('online');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500 group-hover:scale-105 transition-transform">{stats?.online || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-status-cancelled/10 to-status-cancelled/5 border-status-cancelled/30 cursor-pointer hover:border-status-cancelled/50 transition-all group"
            onClick={() => {
              setSelectedFilter('cancelled');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-cancelled group-hover:scale-105 transition-transform">{stats?.cancelled || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30 cursor-pointer hover:border-purple-500/50 transition-all group"
            onClick={() => {
              setSelectedFilter('exclusive');
              setSelectedView('filtered');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Exclusive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500 group-hover:scale-105 transition-transform">{stats?.exclusive || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>
        </div>


        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Branch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branchStats?.map((branch) => (
              <Card 
                key={branch.name} 
                className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedBranch(branch.name);
                  setSelectedView('branch');
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{branch.count}</div>
                  <p className="text-sm text-muted-foreground">Total complaints</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('complaints')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage all concerns across branches
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('staff-list')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">All Branch Staff and Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all team members • Total: {allStaffData?.allStaff?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-accent/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('student-list')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">All Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all students • Total: {allStudentsData?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Main Admin Dashboard
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/docs')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </Button>
          </div>
          <DashboardNav showNotifications showChat />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
