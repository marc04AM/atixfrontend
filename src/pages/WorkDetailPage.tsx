import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Edit2, X, CheckCircle2, Clock, TrendingUp, Building2, Factory, User, Calendar, Plus, Trash2, UserPlus } from 'lucide-react';
import { Work, WorkReportEntry, User as UserType, WorkStatus, Attachment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AttachmentManager from '@/components/AttachmentManager';
import { useWork, useUpdateWork, useCloseWork, useInvoiceWork, useAssignTechnician, useWorkReportEntries, useCreateReportEntry, useUsersByType } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatDateTime } from '@/lib/date';

type AssignedTechnicianSummary = {
  id: string;
  technicianId?: string;
  name: string;
  email?: string;
};

const getAssignedTechnicians = (work: Work): AssignedTechnicianSummary[] => {
  if (work.assignedTechnicians && work.assignedTechnicians.length > 0) {
    return work.assignedTechnicians
      .map((assignment) => ({
        id: assignment.id,
        technicianId: assignment.technicianId,
        name: `${assignment.technicianFirstName} ${assignment.technicianLastName}`.trim(),
        email: assignment.technicianEmail,
      }))
      .filter((assignment) => assignment.name);
  }

  return (work.assignments || [])
    .map((assignment) => ({
      id: assignment.id,
      technicianId: assignment.user?.id,
      name: `${assignment.user?.firstName || ''} ${assignment.user?.lastName || ''}`.trim(),
      email: assignment.user?.email,
    }))
    .filter((assignment) => assignment.name);
};

const getPlantDirectory = (work: Work): string =>
  work.plant?.nasDirectory || work.relatedPlantNasDirectory || '';

export default function WorkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isAdmin } = useAuth();

  // Fetch data
  const { data: work, isLoading, error } = useWork(id!);
  const { data: reportEntriesData } = useWorkReportEntries(id!);
  const { data: techniciansData } = useUsersByType('TECHNICIAN');

  // Mutations
  const updateWork = useUpdateWork();
  const closeWork = useCloseWork();
  const invoiceWork = useInvoiceWork();
  const assignTechnician = useAssignTechnician();
  const createReportEntry = useCreateReportEntry();

  const [isEditing, setIsEditing] = useState(false);
  const [editedWork, setEditedWork] = useState<any>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const reportEntries = reportEntriesData || [];
  const technicians = techniciansData || [];

  // Update editedWork when work data loads
  useEffect(() => {
    if (work) {
      setEditedWork(work);
    }
  }, [work]);

  // New entry dialog
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    hours: 0
  });

  // Assign technician dialog
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // Loading and error states
  if (isLoading) return <LoadingSpinner message="Loading work details..." />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading work: {(error as Error).message}</p>
        </CardContent>
      </Card>
    </div>
  );
  if (!work) return null;

  const assignedTechnicians = getAssignedTechnicians(work);
  const assignedTechnicianIds = assignedTechnicians
    .map((assignment) => assignment.technicianId)
    .filter((id): id is string => Boolean(id));
  const isAssigned = currentUser
    ? assignedTechnicians.some((assignment) => assignment.technicianId === currentUser.id)
    : false;
  const availableTechnicians = technicians.filter((t: any) => !assignedTechnicianIds.includes(t.id));

  // Work status helper
  const getWorkStatus = (): WorkStatus => {
    if (work.invoiced) return 'INVOICED';
    if (work.completed) return 'COMPLETED';
    return 'IN_PROGRESS';
  };

  // Generate work index (e.g., "nasplant1work1")
  const getWorkIndex = (): string => {
    const plantDir = getPlantDirectory(work);
    const workDir = work.nasSubDirectory || '';
    return (plantDir + workDir).toLowerCase().replace(/\//g, '');
  };

  // Get full directory path
  const getFullDirectory = (): string => {
    const plantDir = getPlantDirectory(work);
    const workDir = work.nasSubDirectory || '';
    return plantDir + workDir;
  };
  const handleStatusChange = (status: WorkStatus) => {
    if (status === 'COMPLETED' && !work.completed) {
      closeWork.mutate(work.id, {
        onSuccess: () => {
          toast({
            title: 'Work Completed',
            description: 'The work has been marked as complete.'
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        }
      });
    } else if (status === 'INVOICED' && !work.invoiced) {
      invoiceWork.mutate(work.id, {
        onSuccess: () => {
          toast({
            title: 'Work Invoiced',
            description: 'The work has been marked as invoiced.'
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        }
      });
    }
  };
  const handleSave = () => {
    updateWork.mutate({ id: work.id, data: editedWork }, {
      onSuccess: () => {
        setIsEditing(false);
        toast({
          title: 'Work Updated',
          description: 'The work has been updated successfully.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleCancel = () => {
    setEditedWork(work);
    setIsEditing(false);
  };
  const handleAddEntry = () => {
    createReportEntry.mutate({
      workId: work.id,
      description: newEntry.description,
      hours: newEntry.hours
    }, {
      onSuccess: () => {
        setIsAddEntryOpen(false);
        setNewEntry({
          description: '',
          hours: 0
        });
        toast({
          title: 'Entry Added',
          description: 'Work report entry has been added.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleDeleteEntry = (entryId: string) => {
    toast({
      title: 'Entry Deleted',
      description: 'Work report entry has been deleted.'
    });
  };
  const handleAssignMyself = () => {
    if (!currentUser) return;
    assignTechnician.mutate({
      workId: work.id,
      technicianId: currentUser.id
    }, {
      onSuccess: () => {
        toast({
          title: 'Assigned',
          description: 'You have been assigned to this work.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleAssignTechnician = () => {
    if (!selectedTechnician) return;
    const technician = technicians.find((t: any) => t.id === selectedTechnician);
    assignTechnician.mutate({
      workId: work.id,
      technicianId: selectedTechnician
    }, {
      onSuccess: () => {
        setIsAssignOpen(false);
        setSelectedTechnician('');
        toast({
          title: 'Technician Assigned',
          description: `${technician?.firstName} ${technician?.lastName} has been assigned.`
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleMarkComplete = () => {
    closeWork.mutate(work.id, {
      onSuccess: () => {
        toast({
          title: 'Work Completed',
          description: 'The work has been marked as complete.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleMarkInvoiced = () => {
    invoiceWork.mutate(work.id, {
      onSuccess: () => {
        toast({
          title: 'Work Invoiced',
          description: 'The work has been marked as invoiced.'
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const totalHours = reportEntries.reduce((sum: number, e: any) => sum + e.hours, 0);
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/works')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Edit Work' : work.name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {getWorkIndex()}
            </Badge>
            <Select value={getWorkStatus()} onValueChange={value => handleStatusChange(value as WorkStatus)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_PROGRESS">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="INVOICED">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Invoiced
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
        <div className="flex gap-2 flex-wrap">
          {!isEditing ? <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {!work.completed && <Button onClick={handleMarkComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>}
              {work.completed && !work.invoiced && <Button onClick={handleMarkInvoiced}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Mark Invoiced
                </Button>}
            </> : <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle>Work Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Work Name</Label>
                    <Input id="name" value={editedWork.name} onChange={e => setEditedWork({
                  ...editedWork,
                  name: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bidNumber">Bid Number</Label>
                    <Input id="bidNumber" value={editedWork.bidNumber} onChange={e => setEditedWork({
                  ...editedWork,
                  bidNumber: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input id="orderNumber" value={editedWork.orderNumber} onChange={e => setEditedWork({
                  ...editedWork,
                  orderNumber: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderDate">Order Date</Label>
                    <Input id="orderDate" type="date" value={editedWork.orderDate} onChange={e => setEditedWork({
                  ...editedWork,
                  orderDate: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="electrical">Electrical Progression (%)</Label>
                    <Input id="electrical" type="number" min="0" max="100" value={editedWork.electricalSchemaProgression} onChange={e => setEditedWork({
                  ...editedWork,
                  electricalSchemaProgression: Number(e.target.value)
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="programming">Programming Progression (%)</Label>
                    <Input id="programming" type="number" min="0" max="100" value={editedWork.programmingProgression} onChange={e => setEditedWork({
                  ...editedWork,
                  programmingProgression: Number(e.target.value)
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="officeHours">Expected Office Hours</Label>
                    <Input id="officeHours" type="number" value={editedWork.expectedOfficeHours} onChange={e => setEditedWork({
                  ...editedWork,
                  expectedOfficeHours: Number(e.target.value)
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plantHours">Expected Plant Hours</Label>
                    <Input id="plantHours" type="number" value={editedWork.expectedPlantHours} onChange={e => setEditedWork({
                  ...editedWork,
                  expectedPlantHours: Number(e.target.value)
                })} />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={6} value={editedWork.description || ''} onChange={e => setEditedWork({
                  ...editedWork,
                  description: e.target.value
                })} />
                  </div>
                </div> : <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">Bid Number</Label>
                      <p>{work.bidNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Order Number</Label>
                      <p>{work.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Order Date</Label>
                      <p>{formatDate(work.orderDate, 'Not set')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expected Start</Label>
                      <p>{formatDate(work.expectedStartDate, 'Not set')}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="mt-1 whitespace-pre-wrap">{work.description || ''}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Electrical Schema</Label>
                      <div className="flex items-center gap-3">
                        <Progress value={work.electricalSchemaProgression} className="flex-1" />
                        <span className="text-sm font-medium w-12">{work.electricalSchemaProgression}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Programming</Label>
                      <div className="flex items-center gap-3">
                        <Progress value={work.programmingProgression} className="flex-1" />
                        <span className="text-sm font-medium w-12">{work.programmingProgression}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">Expected Office Hours</Label>
                      <p>{work.expectedOfficeHours} hours</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expected Plant Hours</Label>
                      <p>{work.expectedPlantHours} hours</p>
                    </div>
                  </div>
                </div>}
            </CardContent>
          </Card>

          {/* Work Report */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Work Report</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Hours: <span className="font-medium">{totalHours}</span>
                </p>
              </div>
              <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Report Entry</DialogTitle>
                    <DialogDescription>
                      Add a new work report entry with description and hours.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="entry-description">Description</Label>
                      <Textarea id="entry-description" placeholder="Describe the work done..." value={newEntry.description} onChange={e => setNewEntry({
                      ...newEntry,
                      description: e.target.value
                    })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="entry-hours">Hours</Label>
                      <Input id="entry-hours" type="number" step="0.5" min="0" value={newEntry.hours} onChange={e => setNewEntry({
                      ...newEntry,
                      hours: Number(e.target.value)
                    })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddEntryOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEntry} disabled={!newEntry.description || newEntry.hours <= 0}>
                      Add Entry
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {reportEntries.length === 0 ? <p className="text-muted-foreground text-center py-6">
                  No report entries yet. Add your first entry to start tracking.
                </p> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24 text-right">Hours</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportEntries.map(entry => <TableRow key={entry.id}>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right font-medium">{entry.hours}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>}
            </CardContent>
          </Card>

          {/* Attachments */}
          <AttachmentManager targetType="WORK" targetId={id || ''} attachments={attachments} onAttachmentsChange={setAttachments} readOnly={false} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client & Plant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {work.atixClient && <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Atix Client</Label>
                    <p className="text-sm font-medium">{work.atixClient.name}</p>
                  </div>
                </div>}
              {work.finalClient && <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Final Client</Label>
                    <p className="text-sm font-medium">{work.finalClient.name}</p>
                  </div>
                </div>}
              {work.plant && <div className="flex items-center gap-3">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Plant</Label>
                    <p className="text-sm font-medium">{work.plant.name}</p>
                  </div>
                </div>}
              {work.plant && work.nasSubDirectory && <div className="flex items-center gap-3">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-muted-foreground text-xs">Directory</Label>
                    <p className="text-sm font-mono break-all">{getFullDirectory()}</p>
                  </div>
                </div>}
              {work.seller && <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Seller</Label>
                    <p className="text-sm font-medium">{work.seller.firstName} {work.seller.lastName}</p>
                  </div>
                </div>}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">Created At</Label>
                  <p className="text-sm">{formatDateTime(work.createdAt, 'Not set')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Technicians */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned Technicians</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedTechnicians.length > 0 ? assignedTechnicians.map(assignment => <div key={assignment.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assignment.email || 'Email not available'}
                      </p>
                    </div>
                  </div>) : <p className="text-sm text-muted-foreground">No technicians assigned yet.</p>}
              
              <Separator />
              
              <div className="space-y-2">
                {!isAssigned && <Button variant="outline" className="w-full" onClick={handleAssignMyself}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Myself
                  </Button>}
                
                {isAdmin && availableTechnicians.length > 0 && <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Technician
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                        <DialogDescription>
                          Select a technician to assign to this work.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTechnicians.map(tech => <SelectItem key={tech.id} value={tech.id}>
                                {tech.firstName} {tech.lastName}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAssignTechnician} disabled={!selectedTechnician}>
                          Assign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
