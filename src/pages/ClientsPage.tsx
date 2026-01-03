import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useClients, useCreateClient } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ClientsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', type: 'ATIX' as ClientType });

  // Fetch clients
  const { data: clientsData, isLoading, error } = useClients(0, 100);
  const createClient = useCreateClient();

  const clients = clientsData?.content || [];
  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    if (!newClient.name.trim()) {
      toast({
        title: t('common:titles.validationError'),
        description: t('messages.nameRequired'),
        variant: 'destructive',
      });
      return;
    }

    createClient.mutate({
      name: newClient.name,
      type: newClient.type,
    }, {
      onSuccess: () => {
        setNewClient({ name: '', type: 'ATIX' });
        setIsCreateOpen(false);
        toast({
          title: t('common:titles.success'),
          description: t('messages.createSuccessDescription'),
        });
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

  const atixCount = clients.filter((c: Client) => c.type === 'ATIX').length;
  const finalCount = clients.filter((c: Client) => c.type === 'FINAL').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createButton')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('form.createTitle')}</DialogTitle>
              <DialogDescription>{t('form.createDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.nameLabel')}</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('form.typeLabel')}</Label>
                <Select
                  value={newClient.type}
                  onValueChange={(value: ClientType) => setNewClient({ ...newClient, type: value })}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleCreateClient}>{t('common:actions.create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.atix')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atixCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.final')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.name')}</TableHead>
                  <TableHead>{t('columns.type')}</TableHead>
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
                          <><Building2 className="mr-1 h-3 w-3" /> {t('types.ATIX')}</>
                        ) : (
                          <><User className="mr-1 h-3 w-3" /> {t('types.FINAL')}</>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      {t('messages.noClients')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
