import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Save, 
  Edit2,
  X,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  Factory,
  User,
  Calendar,
  Plus,
  Trash2,
  UserPlus
} from 'lucide-react';
import { Work, WorkReportEntry, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockWork: Work = {
  id: '1',
  name: 'Automation System Upgrade',
  bidNumber: 'BID-2024-001',
  orderNumber: 'ORD-2024-001',
  orderDate: '2024-01-15',
  electricalSchemaProgression: 75,
  programmingProgression: 50,
  expectedStartDate: '2024-02-01',
  completed: false,
  invoiced: false,
  createdAt: '2024-01-15T10:00:00',
  nasSubDirectory: '/projects/asu-2024',
  expectedOfficeHours: 40,
  expectedPlantHours: 80,
  seller: { id: 's1', firstName: 'Marco', lastName: 'Rossi', email: 'marco@company.com', role: 'USER', userType: 'SELLER' },
  plant: { id: 'p1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' },
  atixClient: { id: 'c1', name: 'Atix Industries', type: 'COMPANY' },
  finalClient: { id: 'c2', name: 'Final Corp', type: 'COMPANY' },
  assignments: [
    { id: 'a1', assignedAt: '2024-01-16T09:00:00', user: { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' } }
  ],
};

const mockReportEntries: WorkReportEntry[] = [
  { id: 'e1', description: 'Initial site inspection and assessment', hours: 4 },
  { id: 'e2', description: 'Electrical schema design - Phase 1', hours: 8 },
  { id: 'e3', description: 'PLC programming setup', hours: 6 },
];

const mockTechnicians: UserType[] = [
  { id: 't1', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe@company.com', role: 'USER', userType: 'TECHNICIAN' },
  { id: 't2', firstName: 'Anna', lastName: 'Ferrari', email: 'anna@company.com', role: 'USER', userType: 'TECHNICIAN' },
  { id: 't3', firstName: 'Luca', lastName: 'Romano', email: 'luca@company.com', role: 'USER', userType: 'TECHNICIAN' },
];

// Simulated current user (in real app, get from auth context)
const currentUser: UserType = { 
  id: 't2', 
  firstName: 'Anna', 
  lastName: 'Ferrari', 
  email: 'anna@company.com', 
  role: 'ADMIN', 
  userType: 'TECHNICIAN' 
};

export default function WorkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [work, setWork] = useState<Work>(mockWork);
  const [editedWork, setEditedWork] = useState<Work>(mockWork);
  const [reportEntries, setReportEntries] = useState<WorkReportEntry[]>(mockReportEntries);
  
  // New entry dialog
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ description: '', hours: 0 });
  
  // Assign technician dialog
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';
  const isAssigned = work.assignments?.some(a => a.user?.id === currentUser.id);

  const handleSave = () => {
    setWork(editedWork);
    setIsEditing(false);
    toast({
      title: 'Work Updated',
      description: 'The work has been updated successfully.',
    });
  };

  const handleCancel = () => {
    setEditedWork(work);
    setIsEditing(false);
  };

  const handleAddEntry = () => {
    const entry: WorkReportEntry = {
      id: `e${Date.now()}`,
      description: newEntry.description,
      hours: newEntry.hours,
    };
    setReportEntries([...reportEntries, entry]);
    setIsAddEntryOpen(false);
    setNewEntry({ description: '', hours: 0 });
    toast({
      title: 'Entry Added',
      description: 'Work report entry has been added.',
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setReportEntries(reportEntries.filter(e => e.id !== entryId));
    toast({
      title: 'Entry Deleted',
      description: 'Work report entry has been deleted.',
    });
  };

  const handleAssignMyself = () => {
    const newAssignment = {
      id: `a${Date.now()}`,
      assignedAt: new Date().toISOString(),
      user: currentUser,
    };
    setWork({
      ...work,
      assignments: [...(work.assignments || []), newAssignment],
    });
    toast({
      title: 'Assigned',
      description: 'You have been assigned to this work.',
    });
  };

  const handleAssignTechnician = () => {
    const technician = mockTechnicians.find(t => t.id === selectedTechnician);
    if (!technician) return;
    
    const newAssignment = {
      id: `a${Date.now()}`,
      assignedAt: new Date().toISOString(),
      user: technician,
    };
    setWork({
      ...work,
      assignments: [...(work.assignments || []), newAssignment],
    });
    setIsAssignOpen(false);
    setSelectedTechnician('');
    toast({
      title: 'Technician Assigned',
      description: `${technician.firstName} ${technician.lastName} has been assigned.`,
    });
  };

  const handleMarkComplete = () => {
    setWork({
      ...work,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    toast({
      title: 'Work Completed',
      description: 'The work has been marked as complete.',
    });
  };

  const handleMarkInvoiced = () => {
    setWork({
      ...work,
      invoiced: true,
      invoicedAt: new Date().toISOString(),
    });
    toast({
      title: 'Work Invoiced',
      description: 'The work has been marked as invoiced.',
    });
  };

  const totalHours = reportEntries.reduce((sum, e) => sum + e.hours, 0);
  const assignedTechnicianIds = work.assignments?.map(a => a.user?.id) || [];
  const availableTechnicians = mockTechnicians.filter(t => !assignedTechnicianIds.includes(t.id));

  return (
    <div className="space-y-6">
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
            {work.completed ? (
              <Badge variant="outline" className="border-chart-3 text-chart-3">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="border-primary text-primary">
                <Clock className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
            {work.invoiced && (
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Invoiced
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Order: {work.orderNumber} • Bid: {work.bidNumber}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {!work.completed && (
                <Button onClick={handleMarkComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              {work.completed && !work.invoiced && (
                <Button onClick={handleMarkInvoiced}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Mark Invoiced
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
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
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Work Name</Label>
                    <Input
                      id="name"
                      value={editedWork.name}
                      onChange={(e) => setEditedWork({ ...editedWork, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bidNumber">Bid Number</Label>
                    <Input
                      id="bidNumber"
                      value={editedWork.bidNumber}
                      onChange={(e) => setEditedWork({ ...editedWork, bidNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={editedWork.orderNumber}
                      onChange={(e) => setEditedWork({ ...editedWork, orderNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderDate">Order Date</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={editedWork.orderDate}
                      onChange={(e) => setEditedWork({ ...editedWork, orderDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="electrical">Electrical Progression (%)</Label>
                    <Input
                      id="electrical"
                      type="number"
                      min="0"
                      max="100"
                      value={editedWork.electricalSchemaProgression}
                      onChange={(e) => setEditedWork({ ...editedWork, electricalSchemaProgression: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="programming">Programming Progression (%)</Label>
                    <Input
                      id="programming"
                      type="number"
                      min="0"
                      max="100"
                      value={editedWork.programmingProgression}
                      onChange={(e) => setEditedWork({ ...editedWork, programmingProgression: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="officeHours">Expected Office Hours</Label>
                    <Input
                      id="officeHours"
                      type="number"
                      value={editedWork.expectedOfficeHours}
                      onChange={(e) => setEditedWork({ ...editedWork, expectedOfficeHours: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plantHours">Expected Plant Hours</Label>
                    <Input
                      id="plantHours"
                      type="number"
                      value={editedWork.expectedPlantHours}
                      onChange={(e) => setEditedWork({ ...editedWork, expectedPlantHours: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                      <p>{new Date(work.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expected Start</Label>
                      <p>{work.expectedStartDate ? new Date(work.expectedStartDate).toLocaleDateString() : 'Not set'}</p>
                    </div>
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
                </div>
              )}
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
                      <Textarea
                        id="entry-description"
                        placeholder="Describe the work done..."
                        value={newEntry.description}
                        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="entry-hours">Hours</Label>
                      <Input
                        id="entry-hours"
                        type="number"
                        step="0.5"
                        min="0"
                        value={newEntry.hours}
                        onChange={(e) => setNewEntry({ ...newEntry, hours: Number(e.target.value) })}
                      />
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
              {reportEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  No report entries yet. Add your first entry to start tracking.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24 text-right">Hours</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right font-medium">{entry.hours}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client & Plant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {work.atixClient && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Atix Client</Label>
                    <p className="text-sm font-medium">{work.atixClient.name}</p>
                  </div>
                </div>
              )}
              {work.finalClient && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Final Client</Label>
                    <p className="text-sm font-medium">{work.finalClient.name}</p>
                  </div>
                </div>
              )}
              {work.plant && (
                <div className="flex items-center gap-3">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Plant</Label>
                    <p className="text-sm font-medium">{work.plant.name}</p>
                  </div>
                </div>
              )}
              {work.seller && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Seller</Label>
                    <p className="text-sm font-medium">{work.seller.firstName} {work.seller.lastName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">Created At</Label>
                  <p className="text-sm">{new Date(work.createdAt).toLocaleString()}</p>
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
              {work.assignments && work.assignments.length > 0 ? (
                work.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.user?.firstName} {assignment.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assignment.user?.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No technicians assigned yet.</p>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                {!isAssigned && (
                  <Button variant="outline" className="w-full" onClick={handleAssignMyself}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Myself
                  </Button>
                )}
                
                {isAdmin && availableTechnicians.length > 0 && (
                  <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
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
                            {availableTechnicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.firstName} {tech.lastName}
                              </SelectItem>
                            ))}
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
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
