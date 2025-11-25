import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsList } from '@/components/complaints/ComplaintsList';
import { ComplaintDetails } from '@/components/complaints/ComplaintDetails';
import { StaffProfile } from '@/components/StaffProfile';
import { StudentProfile } from '@/components/StudentProfile';
import { FileText, AlertTriangle, BarChart3, LogOut, ChevronLeft, BookOpen } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BranchAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'complaints' | 'detail' | 'staff-list' | 'student-list' | 'staff-profile' | 'student-profile'>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterHighAlertStaff, setFilterHighAlertStaff] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterToday, setFilterToday] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('today');
  const [studentFilter, setStudentFilter] = useState<'all' | 'top-credit' | 'banned'>('all');
  const [staffFilter, setStaffFilter] = useState<'all' | 'top-credit' | 'negative' | 'most-handled'>('all');

  // Redirect if not branch admin
  useEffect(() => {
    console.log('Profile check:', profile);
    if (profile && profile.role !== 'branch_admin') {
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
    }
  }, [searchParams]);

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

  const { data: stats, error, isLoading } = useQuery({
    queryKey: ['branch-stats', profile?.branch, timeRange],
    enabled: !!profile?.branch,
    queryFn: async () => {
      console.log('=== QUERY FUNCTION RUNNING ===');
      console.log('Fetching stats for branch:', profile?.branch);
      console.log('Profile:', profile);
      const rangeStart = getTimeRangeDate();
      
      const query = supabase
        .from('complaints')
        .select('id, status, category, created_at')
        .eq('branch', profile!.branch);
      
      if (timeRange !== 'lifetime') {
        query.gte('created_at', rangeStart);
      }

      const { data: complaints } = await query;

      const { data: staff, error: staffError } = await supabase
        .from('profiles')
        .select('id, full_name, role, high_alert, negative_count_lifetime, credits')
        .eq('branch', profile!.branch)
        .in('role', ['staff', 'trainer']);

      console.log('Staff data:', staff, 'Error:', staffError);

      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_type, banned_from_raise, program, credits')
        .eq('branch', profile!.branch)
        .eq('role', 'student');

      console.log('Students data:', students, 'Error:', studentsError);

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

      // Calculate category breakdown
      const categoryBreakdown = complaints?.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const result = {
        total: complaints?.length || 0,
        open: complaints?.filter(c => c.status === 'logged' || c.status === 'noted' || c.status === 'in_process').length || 0,
        fixed: complaints?.filter(c => c.status === 'fixed').length || 0,
        cancelled: complaints?.filter(c => c.status === 'cancelled').length || 0,
        highAlert: staff?.filter(s => s.high_alert).length || 0,
        allStaff: staff || [],
        allStudents: students || [],
        categoryBreakdown,
        trainerComplaintCounts,
      };

      console.log('Stats result:', result);
      return result;
    },
  });

  console.log('Query state - isLoading:', isLoading, 'error:', error, 'stats:', stats);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

    if (selectedView === 'staff-list') {
      const allStaffAndTrainers = stats?.allStaff || [];
      
      let filteredStaff = [...allStaffAndTrainers];
      
      if (staffFilter === 'top-credit') {
        filteredStaff = filteredStaff.sort((a: any, b: any) => (b.credits ?? 0) - (a.credits ?? 0));
      } else if (staffFilter === 'negative') {
        filteredStaff = filteredStaff.sort((a: any, b: any) => (b.negative_count_lifetime ?? 0) - (a.negative_count_lifetime ?? 0));
      } else if (staffFilter === 'most-handled') {
        filteredStaff = filteredStaff.sort((a: any, b: any) => {
          const aCount = a.role === 'trainer' ? (stats?.trainerComplaintCounts?.[a.id] || 0) : 0;
          const bCount = b.role === 'trainer' ? (stats?.trainerComplaintCounts?.[b.id] || 0) : 0;
          return bCount - aCount;
        });
      }
      
      const staffMembers = filteredStaff.filter((m: any) => m.role === 'staff');
      const trainerMembers = filteredStaff.filter((m: any) => m.role === 'trainer');
      const showGrouped = staffFilter === 'all';
      
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
          
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              variant={staffFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStaffFilter('all')}
            >
              All
            </Button>
            <Button
              variant={staffFilter === 'top-credit' ? 'default' : 'outline'}
              onClick={() => setStaffFilter('top-credit')}
            >
              Top Credit Staff
            </Button>
            <Button
              variant={staffFilter === 'negative' ? 'default' : 'outline'}
              onClick={() => setStaffFilter('negative')}
            >
              Negative Staff
            </Button>
            <Button
              variant={staffFilter === 'most-handled' ? 'default' : 'outline'}
              onClick={() => setStaffFilter('most-handled')}
            >
              Most Handled
            </Button>
          </div>
          
          {!showGrouped && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {staffFilter === 'top-credit' && 'Top Credit Staff & Trainers'}
                    {staffFilter === 'negative' && 'Staff & Trainers by Negatives'}
                    {staffFilter === 'most-handled' && 'Staff & Trainers by Concerns Handled'}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-xl text-primary">{filteredStaff.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStaff.length > 0 ? (
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
                            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              {member.role === 'trainer' ? (
                                <span>Concerns Dealt: {stats?.trainerComplaintCounts?.[member.id] || 0}</span>
                              ) : (
                                <>
                                  <span>Credits: {member.credits ?? 0}</span>
                                  <span>Negatives: {member.negative_count_lifetime ?? 0}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No staff or trainers found</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {showGrouped && (
            <div className="space-y-6">
              {/* Staff Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Staff - {profile?.branch}</CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-xl text-primary">{staffMembers.length}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {staffMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {staffMembers.map((member: any) => (
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No staff members found</p>
                )}
              </CardContent>
            </Card>

            {/* Trainers Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Trainers - {profile?.branch}</CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-xl text-primary">{trainerMembers.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trainerMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainerMembers.map((member: any) => (
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
                              <span>Concerns Dealt: {stats?.trainerComplaintCounts?.[member.id] || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No trainers found</p>
                )}
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      );
    }

    if (selectedView === 'student-list') {
      let filteredStudents = [...(stats?.allStudents || [])];
      
      if (studentFilter === 'top-credit') {
        filteredStudents = filteredStudents.sort((a: any, b: any) => (b.credits ?? 0) - (a.credits ?? 0));
      } else if (studentFilter === 'banned') {
        filteredStudents = filteredStudents.filter((s: any) => s.banned_from_raise);
      }
      
      const showGrouped = studentFilter === 'all';
      
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
          
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              variant={studentFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStudentFilter('all')}
            >
              All
            </Button>
            <Button
              variant={studentFilter === 'top-credit' ? 'default' : 'outline'}
              onClick={() => setStudentFilter('top-credit')}
            >
              Top Credit
            </Button>
            <Button
              variant={studentFilter === 'banned' ? 'default' : 'outline'}
              onClick={() => setStudentFilter('banned')}
            >
              Banned
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {studentFilter === 'all' && `All Students - ${profile?.branch}`}
                  {studentFilter === 'top-credit' && 'Top Credit Students'}
                  {studentFilter === 'banned' && 'Banned Students'}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-xl text-secondary">{filteredStudents.length}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
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
                          <p className="text-sm text-muted-foreground">Credits: {student.credits}</p>
                          <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Program: {student.program || 'Not Assigned'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students found</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedView === 'detail' && selectedComplaintId) {
      return (
        <ComplaintDetails 
          complaintId={selectedComplaintId}
          onBack={() => setSelectedView('complaints')}
        />
      );
    }

    if (selectedView === 'complaints') {
      return (
        <div>
          <Button 
            variant="default" 
            onClick={() => {
              setSelectedView('dashboard');
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus(undefined);
              setFilterToday(false);
            }}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <ComplaintsList
            filterByBranch={profile?.branch || ''}
            filterByCategory={filterCategory}
            filterByHighAlertStaff={filterHighAlertStaff}
            filterByStatus={filterStatus}
            filterByToday={filterToday}
            onComplaintClick={(complaint) => {
              setSelectedComplaintId(complaint.id);
              setSelectedView('detail');
            }}
          />
        </div>
      );
    }

    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h2>
          <p className="text-muted-foreground">Manage your branch operations and team performance</p>
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card 
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus(undefined);
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 cursor-pointer hover:border-secondary/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus('open');
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Open Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats?.open || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-status-fixed/10 to-status-fixed/5 border-status-fixed/30 cursor-pointer hover:border-status-fixed/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus('fixed');
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-fixed">{stats?.fixed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-status-cancelled/10 to-status-cancelled/5 border-status-cancelled/30 cursor-pointer hover:border-status-cancelled/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(false);
              setFilterStatus('cancelled');
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-status-cancelled">{stats?.cancelled || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{getTimeRangeLabel()}</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 cursor-pointer hover:border-destructive/50 transition-all"
            onClick={() => {
              setFilterCategory(undefined);
              setFilterHighAlertStaff(true);
              setFilterStatus(undefined);
              setFilterToday(true);
              setSelectedView('complaints');
            }}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">High Alert Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats?.highAlert || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
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
                View, assign and track all concerns for {profile?.branch}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('staff-list')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All Staff and Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all staff and trainers in {profile?.branch}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group"
            onClick={() => setSelectedView('student-list')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">All Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all students in {profile?.branch}
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
              Branch Admin Dashboard
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
