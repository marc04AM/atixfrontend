import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Client, ClientType } from '@/types';

// Mock data for demo
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Acme Corporation', type: 'ATIX' },
  { id: '2', name: 'John Smith', type: 'FINAL' },
  { id: '3', name: 'Tech Solutions Ltd', type: 'ATIX' },
  { id: '4', name: 'Maria Rossi', type: 'FINAL' },
  { id: '5', name: 'Industrial Systems SpA', type: 'ATIX' },
];

export default function ClientsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', type: 'ATIX' as ClientType });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    if (!newClient.name.trim()) {
      toast({ title: 'Error', description: 'Client name is required', variant: 'destructive' });
      return;
    }

    const client: Client = {
      id: String(Date.now()),
      name: newClient.name,
      type: newClient.type,
    };

    setClients([...clients, client]);
    setNewClient({ name: '', type: 'ATIX' });
    setIsCreateOpen(false);
    toast({ title: 'Success', description: 'Client created successfully' });
  };

  const atixCount = clients.filter(c => c.type === 'ATIX').length;
  const finalCount = clients.filter(c => c.type === 'FINAL').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your clients</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>Add a new client to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newClient.type}
                  onValueChange={(value: ClientType) => setNewClient({ ...newClient, type: value })}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateClient}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATIX</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atixCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>A list of all clients in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <Badge variant={client.type === 'ATIX' ? 'default' : 'secondary'}>
                      {client.type === 'ATIX' ? (
                        <><Building2 className="mr-1 h-3 w-3" /> ATIX</>
                      ) : (
                        <><User className="mr-1 h-3 w-3" /> Final</>
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
