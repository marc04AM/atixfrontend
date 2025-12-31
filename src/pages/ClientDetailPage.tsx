import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Mock data
const mockClient: Client = {
  id: '1',
  name: 'Acme Corporation',
  type: 'ATIX',
};

const mockLinkedWorks: Work[] = [
  { id: '1', name: 'Automation System', bidNumber: 'BID001', orderNumber: 'ORD001', orderDate: '2024-01-15', electricalSchemaProgression: 80, programmingProgression: 60, completed: false, createdAt: '2024-01-10', invoiced: false, nasSubDirectory: '/nas/acme', expectedOfficeHours: 40, expectedPlantHours: 60 },
  { id: '2', name: 'PLC Programming', bidNumber: 'BID002', orderNumber: 'ORD002', orderDate: '2024-01-10', electricalSchemaProgression: 100, programmingProgression: 100, completed: true, completedAt: '2024-01-20', createdAt: '2024-01-05', invoiced: true, invoicedAt: '2024-01-25', nasSubDirectory: '/nas/acme', expectedOfficeHours: 20, expectedPlantHours: 30 },
];

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState<Client>(mockClient);
  const [editedClient, setEditedClient] = useState<Client>(mockClient);

  const handleSave = () => {
    if (!editedClient.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setClient(editedClient);
    setIsEditing(false);
    toast({ title: 'Success', description: 'Client updated successfully' });
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast({ title: 'Deleted', description: 'Client has been deleted' });
    navigate('/clients');
  };

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
            <p className="text-xs sm:text-sm text-muted-foreground">Client details and linked works</p>
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
                    <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the client
                      and remove all associated data.
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

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {client.type === 'ATIX' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedClient.name}
                  onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editedClient.type}
                  onValueChange={(value: ClientType) => setEditedClient({ ...editedClient, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIX">ATIX</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant={client.type === 'ATIX' ? 'default' : 'secondary'}>
                  {client.type}
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
            Linked Works
          </CardTitle>
          <CardDescription>Works associated with this client</CardDescription>
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
                    <TableHead>Order Number</TableHead>
                    <TableHead>Order Date</TableHead>
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
                      <TableCell>{work.orderNumber}</TableCell>
                      <TableCell>{new Date(work.orderDate).toLocaleDateString()}</TableCell>
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
    </div>
  );
}
