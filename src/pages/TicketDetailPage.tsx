import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Mock data - in real app, fetch from API
const mockTicket: Ticket = {
  id: '1',
  name: 'Machine malfunction on Line 2',
  senderEmail: 'operator@plant.com',
  description: 'The main conveyor belt is not working properly and needs immediate attention. The motor seems to be overheating and there are unusual sounds coming from the gearbox. This is affecting production output significantly.',
  status: 'OPEN',
  createdAt: '2024-01-16T10:30:00'
};
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
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [ticket, setTicket] = useState<Ticket>(mockTicket);
  const [editedTicket, setEditedTicket] = useState<Ticket>(mockTicket);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const handleStatusChange = (status: TicketStatus) => {
    setTicket({
      ...ticket,
      status
    });
    toast({
      title: 'Status Updated',
      description: `Ticket status changed to ${status.replace('_', ' ').toLowerCase()}.`
    });
  };
  const handleSave = () => {
    setTicket(editedTicket);
    setIsEditing(false);
    toast({
      title: 'Ticket Updated',
      description: 'The ticket has been updated successfully.'
    });
  };
  const handleCancel = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
  };
  const handleDelete = () => {
    toast({
      title: 'Ticket Deleted',
      description: 'The ticket has been deleted.',
      variant: 'destructive'
    });
    navigate('/tickets');
  };
  const handleCreateWork = () => {
    // Navigate to create work page with ticket info pre-filled
    navigate('/works/new', {
      state: {
        fromTicket: ticket.id,
        ticketName: ticket.name,
        ticketDescription: ticket.description
      }
    });
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Edit Ticket' : ticket.name}
            </h1>
            <Select value={ticket.status} onValueChange={value => handleStatusChange(value as TicketStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
        <div className="flex gap-2">
          {!isEditing ? <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleCreateWork}>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Work
              </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Ticket Name</Label>
                    <Input id="name" value={editedTicket.name} onChange={e => setEditedTicket({
                  ...editedTicket,
                  name: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Sender Email</Label>
                    <Input id="email" type="email" value={editedTicket.senderEmail || ''} onChange={e => setEditedTicket({
                  ...editedTicket,
                  senderEmail: e.target.value
                })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={editedTicket.status} onValueChange={value => setEditedTicket({
                  ...editedTicket,
                  status: value as TicketStatus
                })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={6} value={editedTicket.description} onChange={e => setEditedTicket({
                  ...editedTicket,
                  description: e.target.value
                })} />
                  </div>
                </> : <>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
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
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">Sender Email</Label>
                  <p className="text-sm">{ticket.senderEmail || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground text-xs">Created At</Label>
                  <p className="text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleCreateWork}>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Work from Ticket
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this ticket? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}