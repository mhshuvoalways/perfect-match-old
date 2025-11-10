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
import { Progress } from "@/components/ui/progress";
import { AIMatchResult } from "@/hooks/useAISearch";
import { useResumeForm } from "@/hooks/useResumeForm";
import { useResumeLibrary } from "@/hooks/useResumeLibrary";
import {
  Briefcase,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Play,
  Trash,
  Upload,
  User,
} from "lucide-react";
import React, { useEffect } from "react";

interface AISearchResultsProps {
  matchResults: AIMatchResult[];
  onDeleteMatch: (matchId: string) => void;
  onRunAISearchForChild: (childId: string) => void;
  isSearching: boolean;
}

const AISearchResults: React.FC<AISearchResultsProps> = ({
  matchResults,
  onDeleteMatch,
  onRunAISearchForChild,
  isSearching,
}) => {
  const {
    uploadResume,
    isUploading,
    items: resumeItems,
    loadResumeLibrary,
    deleteResumeLibraryItem,
  } = useResumeLibrary();
  const { resumes, loadResumes } = useResumeForm();

  useEffect(() => {
    loadResumes();
    loadResumeLibrary("AI Search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadResume(file, "AI Search");
    await loadResumeLibrary("AI Search");
    // Clear the input
    event.target.value = "";
  };

  const handleDeleteResume = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      await deleteResumeLibraryItem(itemId);
      await loadResumeLibrary("AI Search");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const aiSearchResumeItems = resumeItems.filter(
    (item) => item.uploaded_for === "AI Search"
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Upload Resume for AI Search</span>
          </CardTitle>
          <CardDescription>
            Upload resumes from shadchanim to find matches for your children
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            {isUploading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading and processing...</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">Supported formats: PDF or TXT</p>

          {/* Show uploaded resumes */}
          {aiSearchResumeItems.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Uploaded Resumes ({aiSearchResumeItems.length})
              </h4>
              <div className="grid gap-2">
                {aiSearchResumeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
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
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResume(item.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Children's Resumes Section for AI Search */}
      {resumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Run AI Search for Your Children</span>
            </CardTitle>
            <CardDescription>
              Select a child to run AI search against all uploaded resumes. The
              system will automatically filter by gender compatibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <Card key={resume.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
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
                        {resume.gender && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {resume.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        resume.id && onRunAISearchForChild(resume.id)
                      }
                      disabled={isSearching || !resume.id}
                      className="w-full"
                      size="sm"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run AI Search
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {matchResults.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            No AI search results yet. Upload resumes and run AI search to see
            matches for your children.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Match Results</h3>
          {matchResults.map((match) => (
            <Card key={match.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Match for {match.child_resume?.name}</span>
                      <Badge className={getScoreBadgeColor(match.match_score)}>
                        {match.match_score}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Matched with resume uploaded by{" "}
                      {match.matched_resume?.uploaded_by}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteMatch(match.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Match Score Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Compatibility Score</span>
                    <span className={getScoreColor(match.match_score)}>
                      {match.match_score}%
                    </span>
                  </div>
                  <Progress value={match.match_score} className="h-2" />
                </div>

                {/* Child's Profile Summary */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Your Child's Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-blue-600" />
                      <span>{match.child_resume?.age} years old</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      <span>{match.child_resume?.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="h-3 w-3 text-blue-600" />
                      <span>{match.child_resume?.occupation}</span>
                    </div>
                  </div>
                </div>

                {/* Matched Profile Summary */}
                {match.matched_resume?.parsed_data && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Matched Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {match.matched_resume.parsed_data.name && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-600" />
                          <span>{match.matched_resume.parsed_data.name}</span>
                        </div>
                      )}
                      {match.matched_resume.parsed_data.age && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-600" />
                          <span>
                            {match.matched_resume.parsed_data.age} years old
                          </span>
                        </div>
                      )}
                      {match.matched_resume.parsed_data.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-600" />
                          <span>
                            {match.matched_resume.parsed_data.location}
                          </span>
                        </div>
                      )}
                      {match.matched_resume.parsed_data.occupation && (
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3 text-gray-600" />
                          <span>
                            {match.matched_resume.parsed_data.occupation}
                          </span>
                        </div>
                      )}
                      {match.matched_resume.parsed_data.education && (
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="h-3 w-3 text-gray-600" />
                          <span>
                            {match.matched_resume.parsed_data.education}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compatibility Highlights */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      Strengths
                    </h4>
                    <ul className="text-sm space-y-1">
                      {match.highlights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {match.highlights.concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-amber-700 mb-2">
                        Considerations
                      </h4>
                      <ul className="text-sm space-y-1">
                        {match.highlights.concerns.map((concern, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-amber-600 mt-1">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Summary
                    </h4>
                    <p className="text-sm text-gray-700">
                      {match.highlights.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISearchResults;
