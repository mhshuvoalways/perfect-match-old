import AISearchResults from "@/components/AISearchResults";
import NotesAIProfiles from "@/components/NotesAIProfiles";
import SuggestionCard from "@/components/SuggestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useAISearch } from "@/hooks/useAISearch";
import { useMatches } from "@/hooks/useMatches";
import { usePremium } from "@/hooks/usePremium";
import { useResumeForm } from "@/hooks/useResumeForm";
import { useResumeLibrary } from "@/hooks/useResumeLibrary";
import {
  Crown,
  Download,
  Heart,
  LogOut,
  RotateCcw,
  Save,
  Trash,
  User,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const {
    resumeData,
    resumes,
    isLoading,
    isUploading,
    handleInputChange,
    handlePhotoUpload,
    saveResume,
    loadResumes,
    selectResume,
    deleteResume,
    clearResume,
    handleDownloadPDF,
  } = useResumeForm();

  const {
    matches,
    isLoading: matchesLoading,
    updateMatchStatus,
    updateMatchNotes,
    getStatusColor,
    getStatusLabel,
  } = useMatches();

  const {
    items: resumeItems,
    isLoading: resumeLoading,
    loadResumeLibrary,
  } = useResumeLibrary();

  const {
    matchResults,
    isLoading: aiSearchLoading,
    isSearching,
    runAISearchForChild,
    loadMatchResults,
    deleteMatchResult,
  } = useAISearch();

  const { isPremium, isLoading: premiumLoading } = usePremium();

  useEffect(() => {
    loadResumes();
    loadResumeLibrary();
    loadMatchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShadchanApp</h1>
              <Badge variant="outline" className="ml-2">
                Parent Dashboard
              </Badge>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate("/premium")}>
                <Crown className="h-4 w-4 mr-2" />
                Premium
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome{profile?.name ? `, ${profile.name}` : ""}!
          </h2>
          <p className="text-gray-600">
            Manage your children's profiles, track matches, and collaborate with
            shadchanim.
          </p>
        </div>

        <Tabs defaultValue="resume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resume" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Resume Builder</span>
            </TabsTrigger>
            <TabsTrigger value="matches">My Matches</TabsTrigger>
            <TabsTrigger value="notes">Notes & AI Profiles</TabsTrigger>
            <TabsTrigger value="search">AI Search</TabsTrigger>
          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="resume">
            <div className="space-y-6">
              {/* Resume List */}
              {resumes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      My Children's Resumes ({resumes.length})
                    </CardTitle>
                    <CardDescription>
                      Click on a resume to edit it, or create a new one below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {resumes.map((resume) => (
                        <Card
                          key={resume.id}
                          className={`cursor-pointer transition-colors ${
                            resumeData.id === resume.id
                              ? "ring-2 ring-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => selectResume(resume)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                {resume.photo_url && (
                                  <img
                                    src={resume.photo_url}
                                    alt={resume.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {resume.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {resume.age} years old • {resume.location}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {resume.occupation || "No occupation listed"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    resume.id &&
                                    confirm(
                                      "Are you sure you want to delete this resume?"
                                    )
                                  ) {
                                    deleteResume(resume.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPDF(resume);
                                }}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resume Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>
                      {resumeData.id ? "Edit Resume" : "Create New Resume"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {resumeData.id
                      ? "Update the selected resume"
                      : "Create a comprehensive profile for your child using our guided form."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Basic Information
                      </h3>

                      <div>
                        <Label htmlFor="photo">Profile Photo</Label>
                        <div className="mt-2 flex items-center gap-4">
                          {resumeData.photo_url && (
                            <img
                              src={resumeData.photo_url}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          )}
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handlePhotoUpload(file);
                                if (url) {
                                  handleInputChange("photo_url", url);
                                }
                              }
                            }}
                            disabled={isUploading}
                            className="flex-1"
                          />
                        </div>
                        {isUploading && (
                          <p className="text-sm text-gray-500 mt-1">
                            Uploading photo...
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={resumeData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter full name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          value={resumeData.age}
                          onChange={(e) =>
                            handleInputChange("age", e.target.value)
                          }
                          placeholder="Enter age"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={resumeData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="City, State/Country"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={resumeData.occupation}
                          onChange={(e) =>
                            handleInputChange("occupation", e.target.value)
                          }
                          placeholder="Current job or profession"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                          id="gender"
                          value={resumeData.gender || ""}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          placeholder="Male/Female"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Additional Details
                      </h3>

                      <div>
                        <Label htmlFor="education">Education</Label>
                        <Input
                          id="education"
                          value={resumeData.education}
                          onChange={(e) =>
                            handleInputChange("education", e.target.value)
                          }
                          placeholder="School, degree, etc."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hashkafa">
                          Hashkafa/Religious Level
                        </Label>
                        <Input
                          id="hashkafa"
                          value={resumeData.hashkafa || ""}
                          onChange={(e) =>
                            handleInputChange("hashkafa", e.target.value)
                          }
                          placeholder="Orthodox, Modern Orthodox, etc."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="background">Background & Values</Label>
                        <Textarea
                          id="background"
                          value={resumeData.background}
                          onChange={(e) =>
                            handleInputChange("background", e.target.value)
                          }
                          placeholder="Religious background, family values, community involvement..."
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="looking_for">
                          What We're Looking For
                        </Label>
                        <Textarea
                          id="looking_for"
                          value={resumeData.looking_for}
                          onChange={(e) =>
                            handleInputChange("looking_for", e.target.value)
                          }
                          placeholder="Describe the type of person and family you're seeking..."
                          className="mt-1 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additional_info">
                      Additional Information
                    </Label>
                    <Textarea
                      id="additional_info"
                      value={resumeData.additional_info}
                      onChange={(e) =>
                        handleInputChange("additional_info", e.target.value)
                      }
                      placeholder="Any other important details, hobbies, personality traits, etc."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      onClick={saveResume}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading
                        ? "Saving..."
                        : resumeData.id
                        ? "Update Resume"
                        : "Save Resume"}
                    </Button>
                    <Button variant="outline" onClick={clearResume}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  <span>My Matches ({matches.length})</span>
                </CardTitle>
                <CardDescription>
                  View and manage match suggestions from shadchanim for your
                  children.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading matches...</div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800"
                            >
                              For: {match.childName}
                            </Badge>
                          </div>
                        </div>
                        <SuggestionCard
                          suggestion={{
                            id: match.id,
                            familyId: "",
                            parentId: "",
                            suggestedFamilyId: "",
                            suggestedName: match.name,
                            familyName: match.childName,
                            familyAge: "",
                            familyLocation: "",
                            familyOccupation: "",
                            age: match.age,
                            location: match.location,
                            occupation: match.occupation,
                            background: match.background,
                            shadchanStatus: "suggested",
                            parentStatus: match.status,
                            dateCreated: match.suggestedDate,
                            shadchanNotes: "",
                            parentNotes: match.notes,
                            shadchanId: match.shadchanId || null,
                            contactInfo: match.contactInfo,
                            resume: match.resume
                              ? {
                                  name: match.resume.name,
                                  age: match.resume.age,
                                  location: match.resume.location,
                                  occupation: match.resume.occupation,
                                  education: match.resume.education,
                                  background: match.resume.background,
                                  gender: match.resume.gender || "",
                                  hashkafa: match.resume.hashkafa || "",
                                }
                              : undefined,
                          }}
                          familyName={match.childName}
                          onStatusUpdate={updateMatchStatus}
                          onNotesUpdate={updateMatchNotes}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No matches yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Complete your children's resumes to start receiving match
                      suggestions.
                    </p>
                    <Button
                      onClick={() => navigate("/shadchan")}
                      variant="outline"
                    >
                      Connect with Shadchanim
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes & AI Profiles</CardTitle>
                <CardDescription>
                  Upload resumes, create notes, and generate AI-powered profiles
                  for better matchmaking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotesAIProfiles />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Search Tab */}
          <TabsContent value="search">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">AI Search</h2>
                <p className="text-muted-foreground">
                  Upload resumes from shadchanim and find the best matches for
                  your children
                </p>
              </div>

              {!premiumLoading && !isPremium ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Crown className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Premium Feature
                    </h3>
                    <p className="text-gray-500 mb-4">
                      AI Search requires a premium subscription to access.
                    </p>
                    <Button onClick={() => navigate("/premium")}>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AISearchResults
                  matchResults={matchResults}
                  onDeleteMatch={deleteMatchResult}
                  onRunAISearchForChild={runAISearchForChild}
                  isSearching={isSearching}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
