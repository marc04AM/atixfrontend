import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDeleteWorksiteReference, useUpdateWorksiteReference, useWorksiteReference } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WorksiteReference } from '@/types';

export default function WorksiteReferenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { t } = useTranslation('worksite-references');

  const { data: reference, isLoading, error } = useWorksiteReference(id!);
  const updateReference = useUpdateWorksiteReference();
  const deleteReference = useDeleteWorksiteReference();

  const [isEditing, setIsEditing] = useState(false);
  const [editedReference, setEditedReference] = useState<WorksiteReference | null>(null);

  useEffect(() => {
    if (reference) {
      setEditedReference(reference);
    }
  }, [reference]);

  const handleSave = () => {
    if (!reference || !editedReference) return;
    if (!editedReference.name.trim()) {
      toast({
        title: t('common:titles.validationError'),
        description: t('messages.validationRequired'),
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      name: editedReference.name,
      ...(editedReference.telephone?.trim() ? { telephone: editedReference.telephone.trim() } : {}),
      ...(editedReference.notes?.trim() ? { notes: editedReference.notes.trim() } : {}),
    };

    updateReference.mutate(
      { id: reference.id, data: payload },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: t('common:titles.updated'),
            description: t('messages.updatedDescription', { name: editedReference.name }),
          });
        },
        onError: (error: any) => {
          toast({
            title: t('common:titles.error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCancel = () => {
    if (reference) {
      setEditedReference(reference);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!reference) return;

    deleteReference.mutate(reference.id, {
      onSuccess: () => {
        toast({
          title: t('common:titles.deleted'),
          description: t('messages.deletedDescription', { name: reference.name }),
          variant: 'destructive',
        });
        navigate('/worksite-references');
      },
      onError: (error: any) => {
        toast({
          title: t('common:titles.error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (isLoading) return <LoadingSpinner message={t('messages.loading')} />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">
            {t('messages.error')}: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
  if (!reference || !editedReference) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/worksite-references')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{reference.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('details.title')}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button variant="outline" size="icon" className="sm:hidden" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> {t('common:actions.cancel')}
                </Button>
                <Button size="icon" className="sm:hidden" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" className="hidden sm:flex" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> {t('common:actions.save')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> {t('common:actions.edit')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="sm:hidden">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="hidden sm:flex">
                      <Trash2 className="mr-2 h-4 w-4" /> {t('common:actions.delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('dialogs.deleteTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('dialogs.deleteDescription', { name: reference.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>{t('common:actions.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('details.information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.nameLabel')}</Label>
                <Input
                  id="name"
                  value={editedReference.name}
                  onChange={(e) => setEditedReference({ ...editedReference, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">{t('form.phoneLabel')}</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={editedReference.telephone || ''}
                  onChange={(e) => setEditedReference({ ...editedReference, telephone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('form.notesLabel')}</Label>
                <Textarea
                  id="notes"
                  value={editedReference.notes || ''}
                  onChange={(e) => setEditedReference({ ...editedReference, notes: e.target.value })}
                  placeholder={t('form.notesPlaceholder')}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-muted-foreground text-xs">{t('details.name')}</Label>
                <p className="text-sm font-medium">{reference.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">{t('details.phone')}</Label>
                <p className="text-sm">{reference.telephone || t('common:messages.notSet')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">{t('details.notes')}</Label>
                <p className="text-sm whitespace-pre-wrap">{reference.notes || t('common:messages.notSet')}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
