
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
import { Badge } from "@/components/ui/badge";
import { useAIProfiles } from "@/hooks/useAIProfiles";
import { useNotes } from "@/hooks/useNotes";
import { useResumeLibrary } from "@/hooks/useResumeLibrary";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { usePremium } from "@/hooks/usePremium";
import { Download, FileText, Mic, Sparkles, Trash, Upload, Crown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotesAIProfiles = () => {
  const navigate = useNavigate();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { notes, isLoading: notesLoading, createNote, deleteNote } = useNotes();
  const {
    items: resumeItems,
    isLoading: resumeLoading,
    isUploading,
    uploadResume,
    loadResumeLibrary,
    deleteResumeLibraryItem,
  } = useResumeLibrary();
  const {
    profiles,
    isLoading: profilesLoading,
    isGenerating,
    generateAIProfile,
    loadAIProfiles,
    deleteAIProfile,
    downloadProfileAsPDF,
  } = useAIProfiles();
  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceRecording();
  const { isPremium, isLoading: premiumLoading } = usePremium();

  useEffect(() => {
    loadResumeLibrary("AI Profile");
    if (isPremium) {
      loadAIProfiles();
    }
  }, [isPremium]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;

    const uploadedItem = await uploadResume(selectedFile);
    if (uploadedItem) {
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        "resume-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    await createNote({
      title: newNoteTitle,
      content: newNoteContent,
      resume_id: selectedResumeId || undefined,
      is_private: false,
    });

    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      const transcript = await stopRecording();
      if (transcript) {
        setNewNoteContent((prev) =>
          prev ? `${prev}\n\n${transcript}` : transcript
        );
      }
    } else {
      await startRecording();
    }
  };

  const handleGenerateAIProfile = async (resumeId: string) => {
    if (!isPremium) {
      alert("AI Profile generation requires a premium subscription.");
      return;
    }

    const relatedNotes = notes
      .filter((note) => note.resume_id === resumeId)
      .map((note) => `${note.title}: ${note.content || ""}`);

    if (relatedNotes.length === 0) {
      alert(
        "Please add some notes for this resume before generating an AI profile."
      );
      return;
    }

    await generateAIProfile(resumeId, relatedNotes);
  };

  const handleDeleteResume = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      await deleteResumeLibraryItem(itemId);
    }
  };

  const aiProfileResumeItems = resumeItems.filter(item => item.uploaded_for === "AI Profile");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="notes">Add Notes</TabsTrigger>
          <TabsTrigger value="ai-profiles">AI Profiles</TabsTrigger>
        </TabsList>

        {/* Upload Resume Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <span>Upload Resume</span>
              </CardTitle>
              <CardDescription>
                Upload a PDF or txt file to analyze and create notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume-upload">Select Resume File</Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)}KB)
                  </p>
                </div>
              )}

              <Button
                onClick={handleUploadResume}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload Resume"}
              </Button>
            </CardContent>
          </Card>

          {/* Resume Library List */}
          {aiProfileResumeItems.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Uploaded Resumes ({aiProfileResumeItems.length})</CardTitle>
                <CardDescription>
                  Manage uploaded resumes and generate AI profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiProfileResumeItems.map((item) => {
                    const relatedNotes = notes.filter(
                      (note) => note.resume_id === item.id
                    );
                    return (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">
                              {item.parsed_data?.name || "Resume"}
                            </span>
                            {item.parsed_data?.gender && (
                              <Badge variant="outline" className="text-xs">
                                {item.parsed_data.gender}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.created_at).toLocaleDateString()}
                            </Badge>
                            <p className="text-xs text-blue-600">
                              {relatedNotes.length} note(s) linked
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {isPremium ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateAIProfile(item.id)}
                                disabled={
                                  isGenerating || relatedNotes.length === 0
                                }
                              >
                                <Sparkles className="h-4 w-4 mr-1" />
                                {isGenerating
                                  ? "Generating..."
                                  : "Generate AI Profile"}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/premium")}
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                Upgrade for AI
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResume(item.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Add Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Add Notes</span>
              </CardTitle>
              <CardDescription>
                Create typed notes or voice recordings for your resumes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume-select">Link to Resume (Optional)</Label>
                <select
                  id="resume-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select a resume...</option>
                  {resumeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.parsed_data?.name || item.uploaded_by} -{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="note-title">Note Title</Label>
                <Input
                  id="note-title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  id="note-content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Type your notes here or use voice recording"
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVoiceRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  disabled={isTranscribing}
                  className="flex items-center space-x-2"
                >
                  <Mic
                    className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`}
                  />
                  <span>
                    {isTranscribing
                      ? "Transcribing..."
                      : isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </span>
                </Button>

                <Button
                  onClick={handleCreateNote}
                  disabled={!newNoteTitle.trim()}
                >
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Notes */}
          {notes.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Notes ({notes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{note.title}</h4>
                          {note.content && (
                            <p className="text-sm text-gray-600 mt-1">
                              {note.content}
                            </p>
                          )}
                          {note.resume && (
                            <p className="text-xs text-blue-600 mt-1">
                              Linked to: {note.resume.name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Profiles Tab */}
        <TabsContent value="ai-profiles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>AI Generated Profiles</span>
              </CardTitle>
              <CardDescription>
                Generate comprehensive profiles using AI based on your notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!premiumLoading && !isPremium ? (
                <div className="text-center py-12">
                  <Crown className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Premium Feature
                  </h3>
                  <p className="text-gray-500 mb-4">
                    AI Profiles require a premium subscription to access.
                  </p>
                  <Button onClick={() => navigate("/premium")}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              ) : profiles.length > 0 ? (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">AI Profile</h4>
                          <p className="text-xs text-gray-500">
                            Generated on{" "}
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadProfileAsPDF(profile)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAIProfile(profile.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {profile.summary}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No AI Profiles Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Upload resumes and add notes to generate AI profiles
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesAIProfiles;
