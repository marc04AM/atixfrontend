import { useState, useEffect, useMemo } from 'react';
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
import { usePlant, useUpdatePlant, useDeletePlant, useWorks } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/date';

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: plant, isLoading, error } = usePlant(id!);
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  // Fetch works linked to this plant
  const worksParams = useMemo(() => ({ plantId: id }), [id]);
  const { data: worksData } = useWorks(worksParams);

  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState<Plant | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (plant) {
      setEditedPlant(plant);
    }
  }, [plant]);

  const linkedWorks = worksData?.content || [];

  const handleSave = () => {
    if (!plant || !editedPlant) return;
    if (!editedPlant.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    updatePlant.mutate(
      { id: plant.id, data: editedPlant },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: 'Success', description: 'Plant updated successfully' });
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    );
  };

  const handleCancel = () => {
    if (plant) {
      setEditedPlant(plant);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!plant) return;

    deletePlant.mutate(plant.id, {
      onSuccess: () => {
        toast({ title: 'Deleted', description: 'Plant has been deleted' });
        navigate('/plants');
      },
      onError: (error: any) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    });
  };

  if (isLoading) return <LoadingSpinner message="Loading plant..." />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading plant: {(error as Error).message}</p>
        </CardContent>
      </Card>
    </div>
  );
  if (!plant || !editedPlant) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/plants')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{plant.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Plant details and linked works</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" size="icon" className="sm:hidden" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button size="icon" className="sm:hidden" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" className="hidden sm:flex" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="sm:hidden">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="hidden sm:flex">
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
          {linkedWorks.length === 0 ? (
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
                  {linkedWorks.map((work) => (
                    <TableRow
                      key={work.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/works/${work.id}`)}
                    >
                      <TableCell className="font-medium">{work.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{work.orderNumber}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(work.orderDate, 'Not set')}</TableCell>
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
