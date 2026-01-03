import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Save, Briefcase, Mail, Calendar, Edit2, X, Trash2 } from 'lucide-react';
import { TicketStatus, Ticket, Attachment } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AttachmentManager from '@/components/AttachmentManager';
import { useTicket, useUpdateTicket, useDeleteTicket } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateTime } from '@/lib/date';

const getTicketStatusColor = (status: TicketStatus) => {
  switch (status) {
    case 'OPEN':
      return 'bg-destructive text-destructive-foreground';
    case 'IN_PROGRESS':
      return 'bg-primary text-primary-foreground';
    case 'RESOLVED':
      return 'bg-accent text-accent-foreground';
    case 'CLOSED':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('tickets');

  const { data: ticket, isLoading, error } = useTicket(id!);
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (ticket) {
      setEditedTicket(ticket);
    }
  }, [ticket]);

  const handleStatusChange = (status: TicketStatus) => {
    if (!ticket) return;

    updateTicket.mutate(
      { id: ticket.id, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: t('messages.statusUpdatedTitle'),
            description: t('messages.statusUpdatedDescription', {
              status: t(`statuses.${status}`),
            })
          });
        },
        onError: (error: any) => {
          toast({
            title: t('common:titles.error'),
            description: error.message,
            variant: 'destructive'
          });
        }
      }
    );
  };

  const handleSave = () => {
    if (!ticket || !editedTicket) return;

    updateTicket.mutate(
      { id: ticket.id, data: editedTicket },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: t('messages.updateSuccessTitle'),
            description: t('messages.updateSuccessDescription')
          });
        },
        onError: (error: any) => {
          toast({
            title: t('common:titles.error'),
            description: error.message,
            variant: 'destructive'
          });
        }
      }
    );
  };

  const handleCancel = () => {
    if (ticket) {
      setEditedTicket(ticket);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!ticket) return;

    deleteTicket.mutate(ticket.id, {
      onSuccess: () => {
        toast({
          title: t('messages.deleteSuccessTitle'),
          description: t('messages.deleteSuccessDescription'),
          variant: 'destructive'
        });
        navigate('/tickets');
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

  const handleCreateWork = () => {
    if (!ticket) return;
    navigate('/works/new', {
      state: {
        fromTicket: ticket.id,
        ticketName: ticket.name,
        ticketDescription: ticket.description
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
  if (!ticket || !editedTicket) return null;
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? t('form.editTitle') : ticket.name}
            </h1>
            <Select value={ticket.status} onValueChange={value => handleStatusChange(value as TicketStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">{t('statuses.OPEN')}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t('statuses.IN_PROGRESS')}</SelectItem>
                <SelectItem value="RESOLVED">{t('statuses.RESOLVED')}</SelectItem>
                <SelectItem value="CLOSED">{t('statuses.CLOSED')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
        <div className="flex gap-2">
          {!isEditing ? <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {t('common:actions.edit')}
              </Button>
              <Button onClick={handleCreateWork}>
                <Briefcase className="h-4 w-4 mr-2" />
                {t('actions.createWork')}
              </Button>
            </> : <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {t('common:actions.save')}
              </Button>
            </>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('details.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('form.nameLabel')}</Label>
                    <Input id="name" value={editedTicket.name} onChange={e => setEditedTicket({
                  ...editedTicket,
                  name: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('form.senderEmailLabel')}</Label>
                    <Input id="email" type="email" value={editedTicket.senderEmail || ''} onChange={e => setEditedTicket({
                  ...editedTicket,
                  senderEmail: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">{t('details.status')}</Label>
                    <Select value={editedTicket.status} onValueChange={value => setEditedTicket({
                  ...editedTicket,
                  status: value as TicketStatus
                })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">{t('statuses.OPEN')}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t('statuses.IN_PROGRESS')}</SelectItem>
                        <SelectItem value="RESOLVED">{t('statuses.RESOLVED')}</SelectItem>
                        <SelectItem value="CLOSED">{t('statuses.CLOSED')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
                    <Textarea id="description" rows={6} value={editedTicket.description} onChange={e => setEditedTicket({
                  ...editedTicket,
                  description: e.target.value
                })} />
                  </div>
                </> : <>
                  <div>
                    <Label className="text-muted-foreground">{t('details.description')}</Label>
                    <p className="mt-1 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </>}
            </CardContent>
          </Card>

          {/* Attachments */}
          <AttachmentManager targetType="TICKET" targetId={id || ''} attachments={attachments} onAttachmentsChange={setAttachments} readOnly={false} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('details.information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">{t('details.senderEmail')}</Label>
                  <p className="text-sm">{ticket.senderEmail || t('messages.notProvided')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">{t('details.createdAt')}</Label>
                  <p className="text-sm">
                    {formatDateTime(ticket.createdAt, t('common:messages.notSet'))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('columns.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleCreateWork}>
                <Briefcase className="h-4 w-4 mr-2" />
                {t('actions.createWorkFromTicket')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common:actions.delete')}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
