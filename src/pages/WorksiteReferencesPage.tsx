import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWorksiteReferences, useCreateWorksiteReference, useUpdateWorksiteReference, useDeleteWorksiteReference } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
export default function WorksiteReferencesPage() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    isAdmin
  } = useAuth();
  const {
    t
  } = useTranslation('worksite-references');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch worksite references
  const {
    data: referencesData,
    isLoading,
    error
  } = useWorksiteReferences();
  const createReference = useCreateWorksiteReference();
  const updateReference = useUpdateWorksiteReference();
  const deleteReference = useDeleteWorksiteReference();
  const references = referencesData || [];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<any>(null);
  const [newReference, setNewReference] = useState({
    name: '',
    telephone: '',
    notes: ''
  });

  // Filter references based on search
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredReferences = references.filter((ref: any) => {
    if (!normalizedQuery) return true;
    const nameMatch = ref.name?.toLowerCase().includes(normalizedQuery);
    const phoneMatch = ref.telephone?.toLowerCase().includes(normalizedQuery);
    const notesMatch = ref.notes?.toLowerCase().includes(normalizedQuery);
    return nameMatch || phoneMatch || notesMatch;
  });
  if (isLoading) return <LoadingSpinner message={t('messages.loading')} />;
  if (error) return <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">
            {t('messages.error')}: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    </div>;
  const handleCreateReference = () => {
    if (!newReference.name) {
      toast({
        title: t('common:titles.validationError'),
        description: t('messages.validationRequired'),
        variant: 'destructive'
      });
      return;
    }
    const payload = {
      name: newReference.name,
      ...(newReference.telephone?.trim() ? {
        telephone: newReference.telephone.trim()
      } : {}),
      ...(newReference.notes?.trim() ? {
        notes: newReference.notes.trim()
      } : {})
    };
    createReference.mutate(payload, {
      onSuccess: () => {
        toast({
          title: t('common:titles.success'),
          description: t('messages.createdDescription', {
            name: newReference.name
          })
        });
        setNewReference({
          name: '',
          telephone: '',
          notes: ''
        });
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: t('common:titles.error'),
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleEditReference = () => {
    if (!editingReference) return;
    const payload = {
      name: editingReference.name,
      ...(editingReference.telephone?.trim() ? {
        telephone: editingReference.telephone.trim()
      } : {}),
      ...(editingReference.notes?.trim() ? {
        notes: editingReference.notes.trim()
      } : {})
    };
    updateReference.mutate({
      id: editingReference.id,
      data: payload
    }, {
      onSuccess: () => {
        toast({
          title: t('common:titles.updated'),
          description: t('messages.updatedDescription', {
            name: editingReference.name
          })
        });
        setIsEditDialogOpen(false);
        setEditingReference(null);
      },
      onError: (error: any) => {
        toast({
          title: t('common:titles.error'),
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const handleDeleteReference = (referenceId: string) => {
    const reference = references.find((r: any) => r.id === referenceId);
    deleteReference.mutate(referenceId, {
      onSuccess: () => {
        toast({
          title: t('common:titles.deleted'),
          description: t('messages.deletedDescription', {
            name: reference?.name || ''
          }),
          variant: 'destructive'
        });
      },
      onError: (error: any) => {
        toast({
          title: t('common:titles.error'),
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };
  const openEditDialog = (reference: any) => {
    setEditingReference({
      ...reference
    });
    setIsEditDialogOpen(true);
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {isAdmin && <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('createButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('form.createTitle')}</DialogTitle>
                <DialogDescription>{t('form.createDescription')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('form.nameLabel')} *</Label>
                    <Input id="name" value={newReference.name} onChange={e => setNewReference({
                ...newReference,
                name: e.target.value
              })} placeholder={t('form.namePlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">{t('form.phoneLabel')}</Label>
                    <Input id="telephone" type="tel" value={newReference.telephone} onChange={e => setNewReference({
                ...newReference,
                telephone: e.target.value
              })} placeholder={t('form.phonePlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('form.notesLabel')}</Label>
                    <Textarea id="notes" value={newReference.notes} onChange={e => setNewReference({
                ...newReference,
                notes: e.target.value
              })} placeholder={t('form.notesPlaceholder')} />
                  </div>
                </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common:actions.cancel')}
                </Button>
                <Button onClick={handleCreateReference}>{t('createButton')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            
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
          <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* References Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.name')}</TableHead>
                  <TableHead>{t('columns.phone')}</TableHead>
                  {isAdmin && <TableHead className="text-right">{t('columns.actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferences.map((reference: any) => <TableRow
                    key={reference.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => navigate(`/worksite-references/${reference.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{reference.name}</div>
                    </TableCell>
                    <TableCell>
                      {reference.telephone ? <div className="text-sm">{reference.telephone}</div> : <div className="text-sm text-muted-foreground">
                          {t('common:messages.notSet')}
                        </div>}
                    </TableCell>
                    {isAdmin && <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditDialog(reference);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('dialogs.deleteTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('dialogs.deleteDescription', {
                              name: reference.name
                            })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteReference(reference.id)}>
                                  {t('common:actions.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>}
                  </TableRow>)}
                {filteredReferences.length === 0 && <TableRow>
                    <TableCell colSpan={isAdmin ? 3 : 2} className="h-24 text-center">
                      {t('messages.noReferences')}
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Reference Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('form.editTitle')}</DialogTitle>
            <DialogDescription>{t('form.editDescription')}</DialogDescription>
          </DialogHeader>
          {editingReference && <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">{t('form.nameLabel')} *</Label>
                <Input id="editName" value={editingReference.name} onChange={e => setEditingReference({
              ...editingReference,
              name: e.target.value
            })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTelephone">{t('form.phoneLabel')}</Label>
                <Input id="editTelephone" type="tel" value={editingReference.telephone || ''} onChange={e => setEditingReference({
              ...editingReference,
              telephone: e.target.value
            })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">{t('form.notesLabel')}</Label>
                <Textarea id="editNotes" value={editingReference.notes || ''} onChange={e => setEditingReference({
              ...editingReference,
              notes: e.target.value
            })} placeholder={t('form.notesPlaceholder')} />
              </div>
            </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button onClick={handleEditReference}>{t('common:actions.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
