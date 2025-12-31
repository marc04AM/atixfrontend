import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Save, X, Factory, FolderOpen, Key, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plant, Attachment, Work } from '@/types';
import AttachmentManager from '@/components/AttachmentManager';

// Mock data
const mockPlant: Plant = {
  id: '1',
  name: 'Plant Alpha',
  notes: 'Main production facility with automated assembly lines',
  nasDirectory: '/nas/alpha',
  pswPhrase: 'phrase123',
  pswPlatform: 'platform456',
  pswStation: 'station789',
};

const mockLinkedWorks: Work[] = [
  {
    id: '1',
    name: 'Automation System Upgrade',
    bidNumber: 'BID-2024-001',
    orderNumber: 'ORD-2024-001',
    orderDate: '2024-01-15',
    electricalSchemaProgression: 75,
    programmingProgression: 50,
    completed: false,
    invoiced: false,
    createdAt: '2024-01-15T10:00:00',
    nasSubDirectory: '/projects/asu-2024',
    expectedOfficeHours: 40,
    expectedPlantHours: 80,
    plant: { id: '1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' }
  },
  {
    id: '3',
    name: 'Electrical Panel Installation',
    bidNumber: 'BID-2024-003',
    orderNumber: 'ORD-2024-003',
    orderDate: '2024-01-10',
    electricalSchemaProgression: 100,
    programmingProgression: 100,
    completed: true,
    completedAt: '2024-01-18T12:00:00',
    invoiced: true,
    invoicedAt: '2024-01-25T10:00:00',
    createdAt: '2024-01-10T14:00:00',
    nasSubDirectory: '/projects/ep-install',
    expectedOfficeHours: 16,
    expectedPlantHours: 32,
    plant: { id: '1', name: 'Plant Alpha', notes: '', nasDirectory: '/nas/alpha', pswPhrase: '', pswPlatform: '', pswStation: '' }
  },
];

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [plant, setPlant] = useState<Plant>(mockPlant);
  const [editedPlant, setEditedPlant] = useState<Plant>(mockPlant);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSave = () => {
    if (!editedPlant.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setPlant(editedPlant);
    setIsEditing(false);
    toast({ title: 'Success', description: 'Plant updated successfully' });
  };

  const handleCancel = () => {
    setEditedPlant(plant);
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast({ title: 'Deleted', description: 'Plant has been deleted' });
    navigate('/plants');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plants')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">{plant.name}</h1>
            <p className="text-sm text-muted-foreground">Plant details and linked works</p>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Plant?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the plant
                      and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Plant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Plant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedPlant.name}
                  onChange={(e) => setEditedPlant({ ...editedPlant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedPlant.notes}
                  onChange={(e) => setEditedPlant({ ...editedPlant, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nasDirectory">NAS Directory</Label>
                <Input
                  id="nasDirectory"
                  value={editedPlant.nasDirectory}
                  onChange={(e) => setEditedPlant({ ...editedPlant, nasDirectory: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{plant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{plant.notes || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">NAS Directory</p>
                  <p className="font-mono text-sm">{plant.nasDirectory || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Credentials
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pswPhrase">PSW Phrase</Label>
                <Input
                  id="pswPhrase"
                  type="password"
                  value={editedPlant.pswPhrase}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswPhrase: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pswPlatform">PSW Platform</Label>
                <Input
                  id="pswPlatform"
                  type="password"
                  value={editedPlant.pswPlatform}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswPlatform: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pswStation">PSW Station</Label>
                <Input
                  id="pswStation"
                  type="password"
                  value={editedPlant.pswStation}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswStation: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">PSW Phrase</p>
                <p className="font-mono text-sm break-all">{showPasswords ? plant.pswPhrase : '••••••••'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PSW Platform</p>
                <p className="font-mono text-sm break-all">{showPasswords ? plant.pswPlatform : '••••••••'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PSW Station</p>
                <p className="font-mono text-sm break-all">{showPasswords ? plant.pswStation : '••••••••'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Linked Works
          </CardTitle>
          <CardDescription>Works associated with this plant</CardDescription>
        </CardHeader>
        <CardContent>
          {mockLinkedWorks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No linked works</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Order Number</TableHead>
                    <TableHead className="hidden sm:table-cell">Order Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLinkedWorks.map((work) => (
                    <TableRow
                      key={work.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/works/${work.id}`)}
                    >
                      <TableCell className="font-medium">{work.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{work.orderNumber}</TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(work.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {work.invoiced ? (
                          <Badge variant="secondary">Invoiced</Badge>
                        ) : work.completed ? (
                          <Badge className="bg-chart-3 text-chart-3-foreground">Completed</Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <AttachmentManager
        targetType="PLANT"
        targetId={id || ''}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        readOnly={false}
      />
    </div>
  );
}
