import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Save, X, Factory, FolderOpen, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plant, Attachment } from '@/types';
import AttachmentManager from '@/components/AttachmentManager';

// Mock data
const mockPlant: Plant = {
  id: '1',
  name: 'Plant Alpha',
  notes: 'Main production facility with automated assembly lines',
  nasDirectory: '/nas/alpha',
  pswPhrase: 'phrase123',
  pswPlatform: 'platform456',
  pswStation: 'station789',
};

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [plant, setPlant] = useState<Plant>(mockPlant);
  const [editedPlant, setEditedPlant] = useState<Plant>(mockPlant);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSave = () => {
    if (!editedPlant.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setPlant(editedPlant);
    setIsEditing(false);
    toast({ title: 'Success', description: 'Plant updated successfully' });
  };

  const handleCancel = () => {
    setEditedPlant(plant);
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast({ title: 'Deleted', description: 'Plant has been deleted' });
    navigate('/plants');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plants')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{plant.name}</h1>
            <p className="text-muted-foreground">Plant details and attachments</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Plant?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the plant
                      and all associated data.
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

      {/* Plant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Plant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedPlant.name}
                  onChange={(e) => setEditedPlant({ ...editedPlant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedPlant.notes}
                  onChange={(e) => setEditedPlant({ ...editedPlant, notes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nasDirectory">NAS Directory</Label>
                <Input
                  id="nasDirectory"
                  value={editedPlant.nasDirectory}
                  onChange={(e) => setEditedPlant({ ...editedPlant, nasDirectory: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{plant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{plant.notes || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">NAS Directory</p>
                  <p className="font-mono text-sm">{plant.nasDirectory || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Credentials
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pswPhrase">PSW Phrase</Label>
                <Input
                  id="pswPhrase"
                  type="password"
                  value={editedPlant.pswPhrase}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswPhrase: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pswPlatform">PSW Platform</Label>
                <Input
                  id="pswPlatform"
                  type="password"
                  value={editedPlant.pswPlatform}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswPlatform: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pswStation">PSW Station</Label>
                <Input
                  id="pswStation"
                  type="password"
                  value={editedPlant.pswStation}
                  onChange={(e) => setEditedPlant({ ...editedPlant, pswStation: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">PSW Phrase</p>
                <p className="font-mono text-sm">{showPasswords ? plant.pswPhrase : '••••••••'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PSW Platform</p>
                <p className="font-mono text-sm">{showPasswords ? plant.pswPlatform : '••••••••'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PSW Station</p>
                <p className="font-mono text-sm">{showPasswords ? plant.pswStation : '••••••••'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <AttachmentManager
        targetType="PLANT"
        targetId={id || ''}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        readOnly={!isEditing}
      />
    </div>
  );
}
