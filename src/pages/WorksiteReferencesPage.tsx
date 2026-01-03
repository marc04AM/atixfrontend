import { useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorksiteReferences, useCreateWorksiteReference, useUpdateWorksiteReference, useDeleteWorksiteReference } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function WorksiteReferencesPage() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch worksite references
  const { data: referencesData, isLoading, error } = useWorksiteReferences();
  const createReference = useCreateWorksiteReference();
  const updateReference = useUpdateWorksiteReference();
  const deleteReference = useDeleteWorksiteReference();

  const references = referencesData || [];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<any>(null);
  const [newReference, setNewReference] = useState({
    name: '',
  });

  // Filter references based on search
  const filteredReferences = references.filter((ref: any) => {
    return ref.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) return <LoadingSpinner message="Loading worksite references..." />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading worksite references: {(error as Error).message}</p>
        </CardContent>
      </Card>
    </div>
  );

  const handleCreateReference = () => {
    if (!newReference.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the name field.',
        variant: 'destructive',
      });
      return;
    }

    createReference.mutate(newReference, {
      onSuccess: () => {
        toast({
          title: 'Reference Created',
          description: `${newReference.name} has been created successfully.`,
        });
        setNewReference({ name: '' });
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleEditReference = () => {
    if (!editingReference) return;

    updateReference.mutate(
      { id: editingReference.id, data: { name: editingReference.name } },
      {
        onSuccess: () => {
          toast({
            title: 'Reference Updated',
            description: `${editingReference.name} has been updated.`,
          });
          setIsEditDialogOpen(false);
          setEditingReference(null);
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    );
  };

  const handleDeleteReference = (referenceId: string) => {
    const reference = references.find((r: any) => r.id === referenceId);
    deleteReference.mutate(referenceId, {
      onSuccess: () => {
        toast({
          title: 'Reference Deleted',
          description: `${reference?.name} has been deleted.`,
          variant: 'destructive',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const openEditDialog = (reference: any) => {
    setEditingReference({ ...reference });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Worksite References</h1>
          <p className="text-muted-foreground">Manage worksite contacts and references</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Reference
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Reference</DialogTitle>
                <DialogDescription>
                  Add a new worksite reference contact.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newReference.name}
                    onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
                    placeholder="Mario Rossi - Idraulico"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReference}>Create Reference</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total References</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{references.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search references..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* References Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferences.map((reference: any) => (
                  <TableRow key={reference.id}>
                    <TableCell>
                      <div className="font-medium">{reference.name}</div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(reference)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Reference</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {reference.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteReference(reference.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredReferences.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 2 : 1} className="h-24 text-center">
                      No worksite references found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Reference Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Reference</DialogTitle>
            <DialogDescription>
              Update worksite reference information.
            </DialogDescription>
          </DialogHeader>
          {editingReference && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name *</Label>
                <Input
                  id="editName"
                  value={editingReference.name}
                  onChange={(e) => setEditingReference({ ...editingReference, name: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReference}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
