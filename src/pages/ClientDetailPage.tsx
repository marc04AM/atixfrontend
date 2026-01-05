import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Trash2, Save, X, Building2, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Client, ClientType, Work } from '@/types';
import { useClient, useUpdateClient, useDeleteClient, useWorks } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/date';
import { StatusBadge, getWorkStatus } from '@/components/ui/status-badge';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['clients', 'works']);

  const { data: client, isLoading, error } = useClient(id!);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  // Fetch works linked to this client (either as atix or final client)
  const worksParams = useMemo(() => ({ clientId: id }), [id]);
  const { data: worksData } = useWorks(worksParams);

  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (client) {
      setEditedClient(client);
    }
  }, [client]);

  const linkedWorks = worksData?.content || [];

  const handleSave = () => {
    if (!client || !editedClient) return;
    if (!editedClient.name.trim()) {
      toast({
        title: t('common:titles.validationError'),
        description: t('messages.nameRequired'),
        variant: 'destructive',
      });
      return;
    }

    updateClient.mutate(
      { id: client.id, data: editedClient },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: t('common:titles.updated'),
            description: t('messages.updateSuccessDescription'),
          });
        },
        onError: (error: any) => {
          toast({
            title: t('common:titles.error'),
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    );
  };

  const handleCancel = () => {
    if (client) {
      setEditedClient(client);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!client) return;

    deleteClient.mutate(client.id, {
      onSuccess: () => {
        toast({
          title: t('common:titles.deleted'),
          description: t('messages.deleteSuccessDescription'),
        });
        navigate('/clients');
      },
      onError: (error: any) => {
        toast({
          title: t('common:titles.error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  if (isLoading) return <LoadingSpinner message={t('messages.loadingDetail')} />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">
            {t('messages.errorDetail')}: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
  if (!client || !editedClient) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{client.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('details.subtitle')}</p>
          </div>
        </div>
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
                    <AlertDialogDescription>{t('dialogs.deleteDescription')}</AlertDialogDescription>
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
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {client.type === 'ATIX' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {t('details.informationTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('details.name')}</Label>
                <Input
                  id="name"
                  value={editedClient.name}
                  onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('details.type')}</Label>
                <Select
                  value={editedClient.type}
                  onValueChange={(value: ClientType) => setEditedClient({ ...editedClient, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIX">{t('types.ATIX')}</SelectItem>
                    <SelectItem value="FINAL">{t('types.FINAL')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('details.name')}</p>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('details.type')}</p>
                <Badge variant={client.type === 'ATIX' ? 'default' : 'secondary'}>
                  {client.type === 'ATIX' ? t('types.ATIX') : t('types.FINAL')}
                </Badge>
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
            {t('details.associatedWorks')}
          </CardTitle>
          <CardDescription>{t('details.associatedWorksDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedWorks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('details.noAssociatedWorks')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common:fields.name')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('works:details.orderNumber')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('works:details.orderDate')}</TableHead>
                    <TableHead>{t('common:fields.status')}</TableHead>
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
                      <TableCell className="hidden sm:table-cell">{formatDate(work.orderDate, t('common:messages.notSet'))}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={getWorkStatus(work)}
                          type="work"
                          label={t(`works:badges.${
                            work.invoiced ? 'invoiced' :
                            work.completed ? 'completed' : 'inProgress'
                          }`)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
