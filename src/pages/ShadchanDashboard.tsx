import AddFamilyForm from "@/components/AddFamilyForm";
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
import { useAuth } from "@/contexts/AuthContext";
import { useShadchan } from "@/hooks/useShadchan";
import { useCollaboration } from "@/hooks/useCollaboration";
import { usePremium } from "@/hooks/usePremium";
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
  DollarSign,
  Filter,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
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
    addFamily,
    deleteFamily,
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
    sentCollaborations,
    receivedCollaborations,
    isLoading: collaborationLoading,
    updateCollaborationComments,
    deleteCollaboration,
    loadCollaborations,
  } = useCollaboration();

  const { isPremium, isLoading: premiumLoading } = usePremium();

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showAddSuggestion, setShowAddSuggestion] = useState(false);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    resumeId: string;
    resumeName: string;
  }>({ isOpen: false, resumeId: "", resumeName: "" });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    gender: "all",
    ageRange: "all",
    location: "",
    occupation: "",
    background: "",
    hashkafa: "",
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteFamily = (familyId: string) => {
    if (confirm('Are you sure you want to delete this family? This action cannot be undone.')) {
      deleteFamily(familyId);
    }
  };

  const handleShareProfile = (resumeId: string, resumeName: string) => {
    setShareModal({ isOpen: true, resumeId, resumeName });
  };

  const handleShareSuccess = () => {
    loadCollaborations();
  };

  // Filter families based on current filters
  const filteredFamilies = useMemo(() => {
    return families.filter(family => {
      if (filters.search && !family.childName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.gender !== "all" && family.gender !== filters.gender) {
        return false;
      }
      if (filters.ageRange !== "all") {
        const [min, max] = filters.ageRange.split('-').map(Number);
        if (family.age < min || family.age > max) {
          return false;
        }
      }
      if (filters.location && !family.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.occupation && !family.occupation.toLowerCase().includes(filters.occupation.toLowerCase())) {
        return false;
      }
      if (filters.background && !family.background.toLowerCase().includes(filters.background.toLowerCase())) {
        return false;
      }
      if (filters.hashkafa && !family.hashkafa.toLowerCase().includes(filters.hashkafa.toLowerCase())) {
        return false;
      }
      if (filters.status !== "all" && family.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [families, filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      gender: "all",
      ageRange: "all",
      location: "",
      occupation: "",
      background: "",
      hashkafa: "",
      status: "all"
    });
  };

  if (isLoading) {
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

        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger
              value="suggestions"
              className="flex items-center space-x-2"
            >
              <Heart className="h-4 w-4" />
              <span>Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="families">Single</TabsTrigger>
            <TabsTrigger value="notes">Notes & AI Profiles</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-6">
              {showAddSuggestion && (
                <AddSuggestionForm
                  families={families}
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
                      disabled={families.length < 2}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Suggestion
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {families.length < 2 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Add more families
                      </h3>
                      <p className="text-gray-500 mb-4">
                        You need at least 2 families to create suggestions.
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
                        disabled={families.length < 2}
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

          {/* Families Tab */}
          <TabsContent value="families">
            <div className="space-y-6">
              {showAddFamily && (
                <AddFamilyForm
                  onAddFamily={addFamily}
                  onCancel={() => setShowAddFamily(false)}
                />
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>Single ({filteredFamilies.length})</span>
                      </CardTitle>
                      <CardDescription>
                        Singles you've added to the system. Click the share button to collaborate with other shadchanim.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                      <Button
                        onClick={() => setShowAddFamily(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Single
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Filter Singles</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear All
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="search">Search Name</Label>
                          <Input
                            id="search"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ageRange">Age Range</Label>
                          <Select value={filters.ageRange} onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Ages</SelectItem>
                              <SelectItem value="18-25">18-25</SelectItem>
                              <SelectItem value="26-30">26-30</SelectItem>
                              <SelectItem value="31-35">31-35</SelectItem>
                              <SelectItem value="36-40">36-40</SelectItem>
                              <SelectItem value="41-50">41-50</SelectItem>
                              <SelectItem value="51-100">51+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="Filter by location..."
                            value={filters.location}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            placeholder="Filter by occupation..."
                            value={filters.occupation}
                            onChange={(e) => setFilters(prev => ({ ...prev, occupation: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="background">Background</Label>
                          <Input
                            id="background"
                            placeholder="Filter by background..."
                            value={filters.background}
                            onChange={(e) => setFilters(prev => ({ ...prev, background: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hashkafa">Hashkafa</Label>
                          <Input
                            id="hashkafa"
                            placeholder="Filter by hashkafa..."
                            value={filters.hashkafa}
                            onChange={(e) => setFilters(prev => ({ ...prev, hashkafa: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="matched">Matched</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  {filteredFamilies.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFamilies.map((family) => (
                        <Card key={family.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {family.childName}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {family.age} years old • {family.gender}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Added{" "}
                                  {new Date(
                                    family.dateAdded
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Location:</strong> {family.location}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Occupation:</strong> {family.occupation}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Background:</strong> {family.background}
                              </p>
                              <p className="text-sm text-gray-500">
                                <strong>Looking for:</strong> {family.lookingFor}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  family.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : family.status === "paused"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {family.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShareProfile(family.id, family.childName)}
                                className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteFamily(family.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : families.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No singles yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Add singles to start making match suggestions and collaborating with other shadchanim.
                      </p>
                      <Button
                        onClick={() => setShowAddFamily(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Single
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No singles match your filters
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Try adjusting your filters to see more results.
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
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
