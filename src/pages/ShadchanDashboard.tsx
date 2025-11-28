import AddSuggestionForm from "@/components/AddSuggestionForm";
import ShadchanSuggestionCard from "@/components/ShadchanSuggestionCard";
import NotesAIProfiles from "@/components/NotesAIProfiles";
import ShadchanPaymentsList from "@/components/ShadchanPaymentsList";
import CollaborationShareModal from "@/components/CollaborationShareModal";
import CollaborationCommentThread from "@/components/CollaborationCommentThread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useShadchan } from "@/hooks/useShadchan";
import { useCollaboration } from "@/hooks/useCollaboration";
import { usePremium } from "@/hooks/usePremium";
import { useResumeForm } from "@/hooks/useResumeForm";
import {
  Calendar,
  Crown,
  Heart,
  LogOut,
  MessageSquare,
  Plus,
  Share2,
  User,
  Users,
  Loader2,
  Trash2,
  Eye,
  Edit,
  Send,
  Download,
  Save,
  RotateCcw,
  Filter,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ShadchanDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const {
    families,
    suggestions,
    notes,
    isLoading,
    addSuggestion,
    deleteSuggestion,
    updateSuggestionStatus,
    updateSuggestionNotes,
    addNote,
    deleteNote,
    getSuggestionStatusColor,
    getSuggestionStatusLabel,
  } = useShadchan();

  const {
    resumeData,
    resumes,
    isLoading: resumeLoading,
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
    sentCollaborations,
    receivedCollaborations,
    isLoading: collaborationLoading,
    updateCollaborationComments,
    deleteCollaboration,
    loadCollaborations,
  } = useCollaboration();

  const { isPremium, isLoading: premiumLoading } = usePremium();

  const [showAddSuggestion, setShowAddSuggestion] = useState(false);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    resumeId: string;
    resumeName: string;
  }>({ isOpen: false, resumeId: "", resumeName: "" });

  useEffect(() => {
    loadResumes();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleShareProfile = (resumeId: string, resumeName: string) => {
    setShareModal({ isOpen: true, resumeId, resumeName });
  };

  const handleShareSuccess = () => {
    loadCollaborations();
  };

  if (isLoading || resumeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShadchanApp</h1>
              <Badge variant="outline" className="ml-2">
                Shadchan Dashboard
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
            Manage your families, track suggestions, and collaborate with other shadchanim.
          </p>
        </div>

        <Tabs defaultValue="resume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resume" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Resume Builder</span>
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="flex items-center space-x-2"
            >
              <Heart className="h-4 w-4" />
              <span>Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="notes">Notes & AI Profiles</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="resume">
            <div className="space-y-6">
              {/* Resume List */}
              {resumes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      My Singles' Resumes ({resumes.length})
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
                              ? "ring-2 ring-green-500"
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
                                <Trash2 className="h-4 w-4 text-red-500" />
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (resume.id) {
                                    handleShareProfile(resume.id, resume.name);
                                  }
                                }}
                                className="flex-1 text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
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
                    <User className="h-5 w-5 text-green-600" />
                    <span>
                      {resumeData.id ? "Edit Resume" : "Create New Resume"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {resumeData.id
                      ? "Update the selected resume"
                      : "Create a comprehensive profile using our guided form."}
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
                      disabled={resumeLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {resumeLoading
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

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-6">
              {showAddSuggestion && (
                <AddSuggestionForm
                  families={resumes.map(r => ({
                    id: r.id || "",
                    childName: r.name,
                    parentName: "Shadchan",
                    parentId: "",
                    age: parseInt(r.age) || 0,
                    gender: r.gender || "",
                    location: r.location,
                    occupation: r.occupation,
                    education: r.education,
                    background: r.background,
                    hashkafa: r.hashkafa || "",
                    lookingFor: r.looking_for,
                    status: "active" as const,
                    dateAdded: new Date().toISOString(),
                  }))}
                  onAddSuggestion={addSuggestion}
                  onCancel={() => setShowAddSuggestion(false)}
                />
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-green-600" />
                        <span>Match Suggestions ({suggestions.length})</span>
                      </CardTitle>
                      <CardDescription>
                        Create and track match suggestions for families.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddSuggestion(true)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={resumes.length < 2}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Suggestion
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {resumes.length < 2 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Add more resumes
                      </h3>
                      <p className="text-gray-500 mb-4">
                        You need at least 2 resumes to create suggestions.
                      </p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <ShadchanSuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          onStatusUpdate={updateSuggestionStatus}
                          onNotesUpdate={updateSuggestionNotes}
                          onDelete={deleteSuggestion}
                          getStatusColor={getSuggestionStatusColor}
                          getStatusLabel={getSuggestionStatusLabel}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No suggestions yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Start making suggestions for your families.
                      </p>
                      <Button
                        onClick={() => setShowAddSuggestion(true)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={resumes.length < 2}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Suggestion
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notes & AI Profiles Tab */}
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

          {/* Collaborate Tab */}
          <TabsContent value="collaborate">
            {!premiumLoading && !isPremium ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Crown className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Premium Feature
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Collaboration with other shadchanim requires a premium subscription.
                  </p>
                  <Button onClick={() => navigate("/premium")}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Send className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Shared by You</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {sentCollaborations.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Shared with You</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {receivedCollaborations.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Active Discussions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {[...sentCollaborations, ...receivedCollaborations].filter(
                            collab => collab.comment_thread.length > 0
                          ).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shared by You */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5 text-purple-600" />
                    <span>Profiles You've Shared ({sentCollaborations.length})</span>
                  </CardTitle>
                  <CardDescription>
                    Profiles you've shared with other shadchanim for collaboration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collaborationLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : sentCollaborations.length > 0 ? (
                    <div className="space-y-4">
                      {sentCollaborations.map((collaboration) => (
                        <Card key={collaboration.id} className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {collaboration.resume_name}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Shared {new Date(collaboration.created_at).toLocaleDateString()}</span>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  {collaboration.permission === "view" ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <Edit className="h-3 w-3" />
                                  )}
                                  <span>{collaboration.permission}</span>
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCollaboration(collaboration.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CollaborationCommentThread
                            collaborationId={collaboration.id}
                            comments={collaboration.comment_thread}
                            canComment={true}
                            onCommentsUpdate={(comments) =>
                              updateCollaborationComments(collaboration.id, comments)
                            }
                          />
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        You haven't shared any profiles yet. Share a family profile to start collaborating.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shared with You */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Profiles Shared with You ({receivedCollaborations.length})</span>
                  </CardTitle>
                  <CardDescription>
                    Profiles other shadchanim have shared with you for collaboration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collaborationLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : receivedCollaborations.length > 0 ? (
                    <div className="space-y-4">
                      {receivedCollaborations.map((collaboration) => (
                        <Card key={collaboration.id} className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {collaboration.resume_name}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Received {new Date(collaboration.created_at).toLocaleDateString()}</span>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  {collaboration.permission === "view" ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <Edit className="h-3 w-3" />
                                  )}
                                  <span>{collaboration.permission}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <CollaborationCommentThread
                            collaborationId={collaboration.id}
                            comments={collaboration.comment_thread}
                            canComment={collaboration.permission === "edit"}
                            onCommentsUpdate={(comments) =>
                              updateCollaborationComments(collaboration.id, comments)
                            }
                          />
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No profiles have been shared with you yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <ShadchanPaymentsList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Modal */}
      <CollaborationShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, resumeId: "", resumeName: "" })}
        resumeId={shareModal.resumeId}
        resumeName={shareModal.resumeName}
        onShareSuccess={handleShareSuccess}
      />
    </div>
  );
};

export default ShadchanDashboard;
