import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Factory, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plant } from '@/types';
import { usePlants, useCreatePlant } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PlantsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('plants');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    notes: '',
    nasDirectory: '',
    pswPhrase: 'Atixbnt5555',
    pswPlatform: 'Niagara1995',
    pswStation: 'Atixbnt5555',
  });

  // Fetch plants
  const { data: plantsData, isLoading, error } = usePlants(0, 100);
  const createPlant = useCreatePlant();

  const plants = plantsData?.content || [];
  const filteredPlants = plants.filter((plant: Plant) =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlant = () => {
    if (!newPlant.name.trim()) {
      toast({
        title: t('common:titles.validationError'),
        description: t('messages.nameRequired'),
        variant: 'destructive',
      });
      return;
    }

    createPlant.mutate(newPlant, {
      onSuccess: () => {
        setNewPlant({ name: '', notes: '', nasDirectory: '', pswPhrase: 'Atixbnt5555', pswPlatform: 'Niagara1995', pswStation: 'Atixbnt5555' });
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

  const handleSaveComplete = () => {
    setNewPlant({ name: '', notes: '', nasDirectory: '', pswPhrase: '', pswPlatform: '', pswStation: '' });
    setIsCreateOpen(false);
    toast({
      title: t('common:titles.success'),
      description: t('messages.createSuccessDescription'),
    });
  };

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('form.createTitle')}</DialogTitle>
              <DialogDescription>{t('form.createDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.nameLabel')}</Label>
                <Input
                  id="name"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('form.notesLabel')}</Label>
                <Textarea
                  id="notes"
                  value={newPlant.notes}
                  onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })}
                  placeholder={t('form.notesPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nasDirectory">{t('form.nasDirectoryLabel')}</Label>
                <Input
                  id="nasDirectory"
                  value={newPlant.nasDirectory}
                  onChange={(e) => setNewPlant({ ...newPlant, nasDirectory: e.target.value })}
                  placeholder={t('form.nasDirectoryPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="pswPhrase">{t('form.pswPhraseLabel')}</Label>
                  <Input
                    id="pswPhrase"
                    value={newPlant.pswPhrase}
                    onChange={(e) => setNewPlant({ ...newPlant, pswPhrase: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pswPlatform">{t('form.pswPlatformLabel')}</Label>
                  <Input
                    id="pswPlatform"
                    value={newPlant.pswPlatform}
                    onChange={(e) => setNewPlant({ ...newPlant, pswPlatform: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pswStation">{t('form.pswStationLabel')}</Label>
                  <Input
                    id="pswStation"
                    value={newPlant.pswStation}
                    onChange={(e) => setNewPlant({ ...newPlant, pswStation: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleCreatePlant}>{t('common:actions.create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-1 max-w-xs">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plants.length}</div>
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
                  <TableHead>{t('columns.nasDirectory')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlants.map((plant) => (
                  <TableRow
                    key={plant.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  >
                    <TableCell className="font-medium">{plant.name}</TableCell>
                    <TableCell className="font-mono text-sm">{plant.nasDirectory}</TableCell>
                  </TableRow>
                ))}
                {filteredPlants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      {t('messages.noPlants')}
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
