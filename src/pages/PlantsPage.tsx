import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Factory, FolderOpen, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plant } from '@/types';

// Mock data for demo
const MOCK_PLANTS: Plant[] = [
  { id: '1', name: 'Plant Alpha', notes: 'Main production facility', nasDirectory: '/nas/alpha', pswPhrase: '****', pswPlatform: '****', pswStation: '****' },
  { id: '2', name: 'Plant Beta', notes: 'Secondary warehouse', nasDirectory: '/nas/beta', pswPhrase: '****', pswPlatform: '****', pswStation: '****' },
  { id: '3', name: 'Plant Gamma', notes: 'R&D center', nasDirectory: '/nas/gamma', pswPhrase: '****', pswPlatform: '****', pswStation: '****' },
  { id: '4', name: 'Plant Delta', notes: 'Distribution hub', nasDirectory: '/nas/delta', pswPhrase: '****', pswPlatform: '****', pswStation: '****' },
];

export default function PlantsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [plants, setPlants] = useState<Plant[]>(MOCK_PLANTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    notes: '',
    nasDirectory: '',
    pswPhrase: '',
    pswPlatform: '',
    pswStation: '',
  });
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlant = () => {
    if (!newPlant.name.trim()) {
      toast({ title: 'Error', description: 'Plant name is required', variant: 'destructive' });
      return;
    }

    const plant: Plant = {
      id: String(Date.now()),
      name: newPlant.name,
      notes: newPlant.notes,
      nasDirectory: newPlant.nasDirectory,
      pswPhrase: newPlant.pswPhrase,
      pswPlatform: newPlant.pswPlatform,
      pswStation: newPlant.pswStation,
    };

    setPlants([...plants, plant]);
    setNewPlant({ name: '', notes: '', nasDirectory: '', pswPhrase: '', pswPlatform: '', pswStation: '' });
    setIsCreateOpen(false);
    toast({ title: 'Success', description: 'Plant created successfully' });
  };

  const handleEditPlant = () => {
    if (!editingPlant || !editingPlant.name.trim()) {
      toast({ title: 'Error', description: 'Plant name is required', variant: 'destructive' });
      return;
    }

    setPlants(plants.map(p => p.id === editingPlant.id ? editingPlant : p));
    setEditingPlant(null);
    setIsEditOpen(false);
    toast({ title: 'Success', description: 'Plant updated successfully' });
  };

  const handleDeletePlant = (plantId: string) => {
    setPlants(plants.filter(p => p.id !== plantId));
    toast({ title: 'Deleted', description: 'Plant has been deleted' });
  };

  const openEditDialog = (plant: Plant) => {
    setEditingPlant({ ...plant });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plants</h1>
          <p className="text-muted-foreground">Manage your plant facilities</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Plant</DialogTitle>
              <DialogDescription>Add a new plant facility to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  placeholder="Plant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPlant.notes}
                  onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nasDirectory">NAS Directory</Label>
                <Input
                  id="nasDirectory"
                  value={newPlant.nasDirectory}
                  onChange={(e) => setNewPlant({ ...newPlant, nasDirectory: e.target.value })}
                  placeholder="/nas/path"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="pswPhrase">PSW Phrase</Label>
                  <Input
                    id="pswPhrase"
                    type="password"
                    value={newPlant.pswPhrase}
                    onChange={(e) => setNewPlant({ ...newPlant, pswPhrase: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pswPlatform">PSW Platform</Label>
                  <Input
                    id="pswPlatform"
                    type="password"
                    value={newPlant.pswPlatform}
                    onChange={(e) => setNewPlant({ ...newPlant, pswPlatform: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pswStation">PSW Station</Label>
                  <Input
                    id="pswStation"
                    type="password"
                    value={newPlant.pswStation}
                    onChange={(e) => setNewPlant({ ...newPlant, pswStation: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePlant}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With NAS</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plants.filter(p => p.nasDirectory).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plants</CardTitle>
          <CardDescription>A list of all plant facilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plants..."
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
                <TableHead>Notes</TableHead>
                <TableHead>NAS Directory</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlants.map((plant) => (
                <TableRow key={plant.id}>
                  <TableCell className="font-medium">{plant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{plant.notes}</TableCell>
                  <TableCell className="font-mono text-sm">{plant.nasDirectory}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/plants/${plant.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(plant)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Plant?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete {plant.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlant(plant.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No plants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Plant</DialogTitle>
            <DialogDescription>Update plant information</DialogDescription>
          </DialogHeader>
          {editingPlant && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPlant.name}
                  onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingPlant.notes}
                  onChange={(e) => setEditingPlant({ ...editingPlant, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nasDirectory">NAS Directory</Label>
                <Input
                  id="edit-nasDirectory"
                  value={editingPlant.nasDirectory}
                  onChange={(e) => setEditingPlant({ ...editingPlant, nasDirectory: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-pswPhrase">PSW Phrase</Label>
                  <Input
                    id="edit-pswPhrase"
                    type="password"
                    value={editingPlant.pswPhrase}
                    onChange={(e) => setEditingPlant({ ...editingPlant, pswPhrase: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pswPlatform">PSW Platform</Label>
                  <Input
                    id="edit-pswPlatform"
                    type="password"
                    value={editingPlant.pswPlatform}
                    onChange={(e) => setEditingPlant({ ...editingPlant, pswPlatform: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pswStation">PSW Station</Label>
                  <Input
                    id="edit-pswStation"
                    type="password"
                    value={editingPlant.pswStation}
                    onChange={(e) => setEditingPlant({ ...editingPlant, pswStation: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditPlant}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
