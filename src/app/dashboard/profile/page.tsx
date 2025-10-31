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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@prisma/client";
import { 
  UserCog, 
  Save, 
  Upload,
  Plus,
  X,
  Camera,
  Mail,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

interface UserWithStats extends User {
  _count?: {
    authoredPapers: number;
    reviews: number;
  };
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [userDetails, setUserDetails] = useState<UserWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
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
        const response = await axios.get(`/api/user/profile?email=${session.user.email}`);
        if (response.data.success) {
          const user = response.data.user;
          setUserDetails(user);
          setProfileData({
            name: user.name || "",
            bio: user.bio || "",
            affiliation: user.affiliation || "",
            areaOfInterest: user.areaOfInterest || [],
            profileImage: user.profileImage || "",
          });
        } else {
          setError(response.data.message || "Failed to load profile");
        }
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

    // Validate name
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }

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
      window.location.reload();
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and research profile
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{profileData.name}</h2>
                        {profileData.affiliation && (
                          <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Award className="h-4 w-4" />
                            {profileData.affiliation}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("edit")}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{session?.user?.email}</span>
                    </div>
                  </div>

                  {profileData.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profileData.bio}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {userDetails?.isVerified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Account
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending Verification
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      <Shield className="h-3 w-3 mr-1" />
                      {userDetails?.userType.toLowerCase()}
                    </Badge>
                    {userDetails?.variableUserType !== userDetails?.userType && (
                      <Badge variant="secondary" className="capitalize">
                        Active: {userDetails?.variableUserType.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Papers Authored</p>
                    <p className="text-3xl font-bold mt-2">{userDetails?._count?.authoredPapers || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reviews Completed</p>
                    <p className="text-3xl font-bold mt-2">{userDetails?._count?.reviews || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-lg font-bold mt-2">
                      {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Research Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Research Interests
              </CardTitle>
              <CardDescription>
                Areas of expertise and research focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.areaOfInterest.length > 0 ? (
                  profileData.areaOfInterest.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No research interests added yet. Click "Edit Profile" to add some.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Profile Tab */}
        <TabsContent value="edit" className="space-y-6">
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
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="profileImage" className="cursor-pointer">
                      <Button variant="outline" asChild>
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
                    <p className="text-xs text-muted-foreground">
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={profileData.affiliation}
                    onChange={(e) => setProfileData(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="University, Company, or Organization"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your current institution or organization
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself, your research interests, and background..."
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Research Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Research Interests
                </CardTitle>
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <Button onClick={handleAddInterest} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {profileData.areaOfInterest.length > 0 ? (
                    profileData.areaOfInterest.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                        {interest}
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground text-center">
                        No research interests added yet. Add some to help with paper matching and networking.
                      </p>
                    </div>
                  )}
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Primary Role</Label>
                      <div className="mt-2">
                        <Badge className="capitalize">{userDetails.userType.toLowerCase()}</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Active Role</Label>
                      <div className="mt-2">
                        <Badge variant="outline" className="capitalize">
                          {userDetails.variableUserType.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                      <p className="text-sm mt-2">
                        {new Date(userDetails.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                      <div className="mt-2">
                        <Badge 
                          variant={userDetails.isVerified ? "default" : "secondary"}
                          className={userDetails.isVerified ? "bg-green-600" : ""}
                        >
                          {userDetails.isVerified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending Verification
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1"
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
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveTab("overview")}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}