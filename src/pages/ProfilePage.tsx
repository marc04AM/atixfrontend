import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateUser, useUpdatePassword, useUploadAvatar, useUsers } from '@/hooks/api';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const updateUser = useUpdateUser();
  const updatePassword = useUpdatePassword();
  const uploadAvatar = useUploadAvatar();

  // Fetch users to get the current user's ID if not available
  const { data: usersData } = useUsers();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(user?.id);

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    } else if (usersData && user?.email) {
      // Find current user by email
      const currentUser = usersData.find((u: any) => u.email === user.email);
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }
    }
  }, [user, usersData]);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    profileImageUrl: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, profileImageUrl: url });
      toast({ title: 'Image uploaded', description: 'Click save to apply changes' });
    }
  };

  const handleProfileUpdate = () => {
    if (!currentUserId) {
      toast({ title: 'Error', description: 'User ID not available', variant: 'destructive' });
      return;
    }
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    setIsUpdatingProfile(true);
    updateUser.mutate(
      {
        id: currentUserId,
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Profile updated successfully' });
          setIsUpdatingProfile(false);
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
          setIsUpdatingProfile(false);
        }
      }
    );
  };

  const handlePasswordUpdate = () => {
    if (!user?.id) return;
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'All password fields are required', variant: 'destructive' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setIsUpdatingPassword(true);
    updatePassword.mutate(
      {
        id: user.id,
        data: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Password updated successfully' });
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setIsUpdatingPassword(false);
        },
        onError: (error: any) => {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
          setIsUpdatingPassword(false);
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Image & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Role: {user?.role} • Type: {user?.type || 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleProfileUpdate} disabled={isUpdatingProfile} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password for security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <Button 
            onClick={handlePasswordUpdate} 
            disabled={isUpdatingPassword}
            variant="outline"
            className="w-full"
          >
            <Lock className="mr-2 h-4 w-4" />
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
