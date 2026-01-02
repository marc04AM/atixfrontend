import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Client, Plant, SellerUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCreateWork, useClients, usePlants, useUsersByType, useCreateClient, useCreatePlant } from '@/hooks/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CreateWorkPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Pre-fill from ticket if coming from ticket detail
  const ticketState = location.state as { fromTicket?: string; ticketName?: string; ticketDescription?: string } | null;

  // Fetch data from API
  const { data: clientsData, isLoading: loadingClients } = useClients(0, 100);
  const { data: plantsData, isLoading: loadingPlants } = usePlants(0, 100);
  const { data: sellersData, isLoading: loadingSellers } = useUsersByType('SELLER');

  const createWork = useCreateWork();
  const createClient = useCreateClient();
  const createPlant = useCreatePlant();

  const clients = clientsData?.content || [];
  const plants = plantsData?.content || [];
  const sellers = sellersData || [];

  const [formData, setFormData] = useState({
    name: ticketState?.ticketName || '',
    bidNumber: '',
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedStartDate: '',
    nasSubDirectory: '',
    expectedOfficeHours: 0,
    expectedPlantHours: 0,
    sellerId: '',
    atixClientId: '',
    finalClientId: '',
    plantId: '',
  });

  // Add client dialog
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', type: 'ATIX' });

  // Add plant dialog
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    notes: '',
    nasDirectory: '',
    pswPhrase: '',
    pswPlatform: '',
    pswStation: '',
  });

  const handleAddClient = () => {
    if (!newClient.name.trim()) {
      toast({ title: 'Error', description: 'Client name is required', variant: 'destructive' });
      return;
    }

    createClient.mutate(
      { name: newClient.name, type: newClient.type as 'ATIX' | 'FINAL' },
      {
        onSuccess: (data) => {
          setFormData({ ...formData, atixClientId: data.id });
          setIsAddClientOpen(false);
          setNewClient({ name: '', type: 'ATIX' });
          toast({ title: 'Success', description: `${data.name} has been added successfully.` });
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
    );
  };

  const handleAddPlant = () => {
    if (!newPlant.name.trim()) {
      toast({ title: 'Error', description: 'Plant name is required', variant: 'destructive' });
      return;
    }

    createPlant.mutate(newPlant, {
      onSuccess: (data) => {
        setFormData({ ...formData, plantId: data.id });
        setIsAddPlantOpen(false);
        setNewPlant({
          name: '',
          notes: '',
          nasDirectory: '',
          pswPhrase: '',
          pswPlatform: '',
          pswStation: '',
        });
        toast({ title: 'Success', description: `${data.name} has been added successfully.` });
      },
      onError: (error: any) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.bidNumber || !formData.orderNumber || !formData.atixClientId || !formData.nasSubDirectory) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (name, bid number, order number, atix client, NAS directory).',
        variant: 'destructive',
      });
      return;
    }

    // Prepare data for API
    const workData: any = {
      name: formData.name,
      bidNumber: formData.bidNumber,
      orderNumber: formData.orderNumber,
      orderDate: formData.orderDate,
      atixClientId: formData.atixClientId,
      nasSubDirectory: formData.nasSubDirectory,
    };

    // Add optional fields
    if (formData.sellerId) workData.sellerId = formData.sellerId;
    if (formData.expectedStartDate) workData.expectedStartDate = formData.expectedStartDate;
    if (formData.finalClientId) workData.finalClientId = formData.finalClientId;
    if (formData.plantId) workData.plantId = formData.plantId;
    if (formData.expectedOfficeHours > 0) workData.expectedOfficeHours = formData.expectedOfficeHours;
    if (formData.expectedPlantHours > 0) workData.expectedPlantHours = formData.expectedPlantHours;
    if (ticketState?.fromTicket) workData.ticketId = ticketState.fromTicket;

    createWork.mutate(workData, {
      onSuccess: (data) => {
        toast({
          title: 'Work Created',
          description: `Work "${data.name}" has been created successfully.`,
        });
        navigate('/works');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  if (loadingClients || loadingPlants || loadingSellers) {
    return <LoadingSpinner message="Loading form data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/works')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Work</h1>
          <p className="text-muted-foreground mt-1">
            {ticketState?.fromTicket ? `Creating from ticket: ${ticketState.ticketName}` : 'Fill in the work order details'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Work Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter work name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bidNumber">Bid Number *</Label>
                  <Input
                    id="bidNumber"
                    placeholder="BID-2024-001"
                    value={formData.bidNumber}
                    onChange={(e) => setFormData({ ...formData, bidNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderNumber">Order Number *</Label>
                  <Input
                    id="orderNumber"
                    placeholder="ORD-2024-001"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderDate">Order Date *</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedStartDate">Expected Start Date</Label>
                  <Input
                    id="expectedStartDate"
                    type="date"
                    value={formData.expectedStartDate}
                    onChange={(e) => setFormData({ ...formData, expectedStartDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nasSubDirectory">NAS Sub Directory</Label>
                <Input
                  id="nasSubDirectory"
                  placeholder="/projects/work-name"
                  value={formData.nasSubDirectory}
                  onChange={(e) => setFormData({ ...formData, nasSubDirectory: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="officeHours">Expected Office Hours</Label>
                  <Input
                    id="officeHours"
                    type="number"
                    min="0"
                    value={formData.expectedOfficeHours}
                    onChange={(e) => setFormData({ ...formData, expectedOfficeHours: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plantHours">Expected Plant Hours</Label>
                  <Input
                    id="plantHours"
                    type="number"
                    min="0"
                    value={formData.expectedPlantHours}
                    onChange={(e) => setFormData({ ...formData, expectedPlantHours: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associations */}
          <Card>
            <CardHeader>
              <CardTitle>Associations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seller */}
              <div className="grid gap-2">
                <Label>Seller</Label>
                <Select
                  value={formData.sellerId}
                  onValueChange={(v) => setFormData({ ...formData, sellerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.firstName} {seller.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Atix Client */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Atix Client</Label>
                  <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                          Create a new client that will be available for selection.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="client-name">Client Name</Label>
                          <Input
                            id="client-name"
                            placeholder="Enter client name"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="client-type">Client Type</Label>
                          <Select
                            value={newClient.type}
                            onValueChange={(v) => setNewClient({ ...newClient, type: v })}
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
                        <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddClient} disabled={!newClient.name}>
                          Add Client
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.atixClientId}
                  onValueChange={(v) => setFormData({ ...formData, atixClientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Final Client */}
              <div className="grid gap-2">
                <Label>Final Client</Label>
                <Select
                  value={formData.finalClientId}
                  onValueChange={(v) => setFormData({ ...formData, finalClientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Plant */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Plant</Label>
                  <Dialog open={isAddPlantOpen} onOpenChange={setIsAddPlantOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Plant</DialogTitle>
                        <DialogDescription>
                          Create a new plant that will be available for selection.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="plant-name">Plant Name *</Label>
                          <Input
                            id="plant-name"
                            placeholder="Enter plant name"
                            value={newPlant.name}
                            onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="plant-notes">Notes</Label>
                          <Input
                            id="plant-notes"
                            placeholder="Additional notes"
                            value={newPlant.notes}
                            onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="plant-nas">NAS Directory</Label>
                          <Input
                            id="plant-nas"
                            placeholder="/nas/plant-name"
                            value={newPlant.nasDirectory}
                            onChange={(e) => setNewPlant({ ...newPlant, nasDirectory: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="grid gap-2">
                            <Label htmlFor="psw-phrase">Password Phrase</Label>
                            <Input
                              id="psw-phrase"
                              type="password"
                              value={newPlant.pswPhrase}
                              onChange={(e) => setNewPlant({ ...newPlant, pswPhrase: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="psw-platform">Platform PWD</Label>
                            <Input
                              id="psw-platform"
                              type="password"
                              value={newPlant.pswPlatform}
                              onChange={(e) => setNewPlant({ ...newPlant, pswPlatform: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="psw-station">Station PWD</Label>
                            <Input
                              id="psw-station"
                              type="password"
                              value={newPlant.pswStation}
                              onChange={(e) => setNewPlant({ ...newPlant, pswStation: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddPlantOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPlant} disabled={!newPlant.name}>
                          Add Plant
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select
                  value={formData.plantId}
                  onValueChange={(v) => setFormData({ ...formData, plantId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/works')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Work
          </Button>
        </div>
      </form>
    </div>
  );
}
