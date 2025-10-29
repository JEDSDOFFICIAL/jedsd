"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@prisma/client";
import { 
  UserCog, 
  Save, 
  Upload,
  Plus,
  X,
  Camera
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    affiliation: "",
    areaOfInterest: [] as string[],
    profileImage: "",
  });
  
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/user?email=${session.user.email}`);
        const user = response.data;
        setUserDetails(user);
        setProfileData({
          name: user.name || "",
          bio: user.bio || "",
          affiliation: user.affiliation || "",
          areaOfInterest: user.areaOfInterest || [],
          profileImage: user.profileImage || "",
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [session?.user?.email]);

  const handleSaveProfile = async () => {
    if (!session?.user?.email) return;

    try {
      setSaving(true);
      const response = await axios.patch("/api/user/profile", {
        email: session.user.email,
        ...profileData,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setUserDetails(response.data.user);
        // Update session if needed
        await updateSession();
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profileData.areaOfInterest.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        areaOfInterest: [...prev.areaOfInterest, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      areaOfInterest: prev.areaOfInterest.filter(i => i !== interest)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("email", session?.user?.email || "");

    try {
      const response = await axios.post("/api/user/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          profileImage: response.data.imageUrl
        }));
        toast.success("Profile image updated!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="h-8 w-8" />
          Profile Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and research interests
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                <AvatarFallback className="text-2xl">
                  {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <Button variant="outline" className="mb-2" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Picture
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="affiliation">Affiliation</Label>
              <Input
                id="affiliation"
                value={profileData.affiliation}
                onChange={(e) => setProfileData(prev => ({ ...prev, affiliation: e.target.value }))}
                placeholder="University, Company, or Organization"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself, your research interests, and background..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Research Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Research Interests</CardTitle>
            <CardDescription>
              Add your areas of research interest and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add research interest (e.g., Machine Learning, Biology)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              />
              <Button onClick={handleAddInterest} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profileData.areaOfInterest.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            {profileData.areaOfInterest.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No research interests added yet. Add some to help with paper matching and networking.
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Type Info */}
        {userDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account type and role information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Primary Role</Label>
                  <div className="mt-1">
                    <Badge className="capitalize">{userDetails.userType.toLowerCase()}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {userDetails.variableUserType.toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(userDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="mt-1">
                    <Badge className={userDetails.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {userDetails.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}