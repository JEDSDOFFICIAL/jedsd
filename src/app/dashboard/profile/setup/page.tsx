"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  UserCog, 
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Camera,
  Sparkles,
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

export default function ProfileSetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    affiliation: "",
    areaOfInterest: [] as string[],
    profileImage: "",
  });
  
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/user/profile?email=${session.user.email}`);
        if (response.data.success) {
          const user = response.data.user;
          // If profile already complete, redirect to profile page
          if (user.name && user.bio && user.affiliation && user.areaOfInterest.length > 0) {
            router.push("/dashboard/profile");
            return;
          }
          // Pre-fill existing data
          setProfileData({
            name: user.name || session.user.name || "",
            bio: user.bio || "",
            affiliation: user.affiliation || "",
            areaOfInterest: user.areaOfInterest || [],
            profileImage: user.profileImage || session.user.image || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [session, router]);

  const handleCompleteSetup = async () => {
    if (!session?.user?.email) return;

    // Validation
    if (!profileData.name.trim()) {
      toast.error("Please enter your full name");
      setCurrentStep(1);
      return;
    }

    if (!profileData.affiliation.trim()) {
      toast.error("Please enter your affiliation");
      setCurrentStep(2);
      return;
    }

    if (!profileData.bio.trim()) {
      toast.error("Please add a short bio");
      setCurrentStep(2);
      return;
    }

    if (profileData.areaOfInterest.length === 0) {
      toast.error("Please add at least one research interest");
      setCurrentStep(3);
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post("/api/user/profile", {
        email: session.user.email,
        ...profileData,
      });

      if (response.data.success) {
        toast.success("Profile setup completed successfully!");
        router.push("/dashboard/profile");
      } else {
        toast.error(response.data.message || "Failed to complete profile setup");
      }
    } catch (err) {
      console.error("Error completing profile setup:", err);
      toast.error("Failed to complete profile setup");
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

    // For now, just create a local URL - you can implement actual upload later
    const imageUrl = URL.createObjectURL(file);
    setProfileData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
    toast.success("Profile image selected!");
  };

  const handleNext = () => {
    if (currentStep === 1 && !profileData.name.trim()) {
      toast.error("Please enter your name to continue");
      return;
    }
    if (currentStep === 2 && (!profileData.affiliation.trim() || !profileData.bio.trim())) {
      toast.error("Please complete all fields to continue");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <UserCog className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your research profile to get started
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              {currentStep === 1 && <User className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <Briefcase className="h-5 w-5 text-primary" />}
              {currentStep === 3 && <GraduationCap className="h-5 w-5 text-primary" />}
              <CardTitle>
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Professional Details"}
                {currentStep === 3 && "Research Interests"}
              </CardTitle>
            </div>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "Share your professional background"}
              {currentStep === 3 && "What areas do you research?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <Label htmlFor="profileImageSetup" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="profileImageSetup"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Optional - Add a profile picture
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="nameSetup">Full Name *</Label>
                  <Input
                    id="nameSetup"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSetup">Email Address</Label>
                  <Input
                    id="emailSetup"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your registered email address
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="affiliationSetup">Affiliation *</Label>
                  <Input
                    id="affiliationSetup"
                    value={profileData.affiliation}
                    onChange={(e) => setProfileData(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="University, Company, or Organization"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your current institution or organization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bioSetup">Professional Bio *</Label>
                  <Textarea
                    id="bioSetup"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your research background, current position, and academic interests..."
                    className="min-h-[150px] resize-none"
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      This will be visible on your public profile
                    </span>
                    <span className="text-muted-foreground">
                      {profileData.bio.length}/500
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Research Interests */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <Label className="text-base font-semibold">Add Research Interests *</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add at least one research interest. These will help match you with relevant papers and researchers.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="e.g., Machine Learning, Quantum Physics, Biotechnology"
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

                  <div className="min-h-[120px] p-4 border-2 border-dashed rounded-lg">
                    {profileData.areaOfInterest.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.areaOfInterest.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                            {interest}
                            <button
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-2 hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground">
                          No research interests added yet. Add at least one to continue.
                        </p>
                      </div>
                    )}
                  </div>

                  {profileData.areaOfInterest.length > 0 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {profileData.areaOfInterest.length} {profileData.areaOfInterest.length === 1 ? 'interest' : 'interests'} added
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || saving}
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} size="lg">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={saving || profileData.areaOfInterest.length === 0}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing Setup...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
