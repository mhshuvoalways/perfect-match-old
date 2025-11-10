import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface ResumeData {
  id?: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  education: string;
  background: string;
  looking_for: string;
  additional_info: string;
  gender?: string;
  hashkafa?: string;
}

const initialResumeData: ResumeData = {
  name: "",
  age: "",
  location: "",
  occupation: "",
  education: "",
  background: "",
  looking_for: "",
  additional_info: "",
  gender: "",
  hashkafa: "",
};

export const useResumeForm = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!resumeData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!resumeData.age.trim()) {
      toast({
        title: "Validation Error",
        description: "Age is required",
        variant: "destructive",
      });
      return false;
    }
    if (!resumeData.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Location is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const saveResume = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      const resumePayload = {
        user_id: user.id,
        name: resumeData.name,
        age: parseInt(resumeData.age),
        location: resumeData.location,
        occupation: resumeData.occupation || null,
        education: resumeData.education || null,
        background: resumeData.background || null,
        gender: resumeData.gender || null,
        hashkafa: resumeData.hashkafa || null,
        family_info: {
          looking_for: resumeData.looking_for,
          additional_info: resumeData.additional_info,
        },
      };

      let result;
      if (resumeData.id) {
        // Update existing resume
        result = await supabase
          .from("resumes")
          .update(resumePayload)
          .eq("id", resumeData.id)
          .eq("user_id", user.id);
      } else {
        // Create new resume
        result = await supabase
          .from("resumes")
          .insert(resumePayload)
          .select()
          .single();

        if (result.data) {
          setResumeData((prev) => ({ ...prev, id: result.data.id }));
        }
      }

      if (result.error) throw result.error;

      // Reload all resumes to update the list
      await loadResumes();

      toast({
        title: "Success!",
        description: "Resume saved successfully",
      });
    } catch (error) {
      console.error("Save resume error:", error);
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        const formattedResumes = data.map((resume) => ({
          id: resume.id,
          name: resume.name || "",
          age: resume.age?.toString() || "",
          location: resume.location || "",
          occupation: resume.occupation || "",
          education: resume.education || "",
          background: resume.background || "",
          looking_for: resume.family_info?.looking_for || "",
          additional_info: resume.family_info?.additional_info || "",
          gender: resume.gender || "",
          hashkafa: resume.hashkafa || "",
        }));

        setResumes(formattedResumes);

        // If no current resume is selected and we have resumes, select the first one
        if (!resumeData.id && formattedResumes.length > 0) {
          setResumeData(formattedResumes[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
    }
  };

  const selectResume = (resume: ResumeData) => {
    setResumeData(resume);
  };

  const deleteResume = async (resumeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Remove from local state
      setResumes((prev) => prev.filter((resume) => resume.id !== resumeId));

      // If we deleted the currently selected resume, clear the form
      if (resumeData.id === resumeId) {
        setResumeData(initialResumeData);
      }

      toast({
        title: "Resume Deleted",
        description: "Resume has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  const clearResume = () => {
    setResumeData(initialResumeData);
    toast({
      title: "Resume Cleared",
      description: "All fields have been cleared",
    });
  };

  const handleDownloadPDF = (resume: any) => {
    // Create a simple HTML content for the resume
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.name} - Resume</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section h3 { 
              color: #2c5aa0; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
            }
            .field { 
              margin-bottom: 10px; 
            }
            .label { 
              font-weight: bold; 
              color: #555; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${resume.name}</h1>
            <p>Age: ${resume.age} | Location: ${resume.location}</p>
          </div>
          
          <div class="section">
            <h3>Personal Information</h3>
            <div class="field"><span class="label">Gender:</span> ${
              resume.gender || "Not specified"
            }</div>
            <div class="field"><span class="label">Hashkafa:</span> ${
              resume.hashkafa || "Not specified"
            }</div>
            <div class="field"><span class="label">Occupation:</span> ${
              resume.occupation || "Not specified"
            }</div>
            <div class="field"><span class="label">Education:</span> ${
              resume.education || "Not specified"
            }</div>
          </div>
          
          <div class="section">
            <h3>Background</h3>
            <p>${resume.background || "No background information provided"}</p>
          </div>
          
          <div class="section">
            <h3>Looking For</h3>
            <p>${resume.looking_for || "No preferences specified"}</p>
          </div>
          
          ${
            resume.additional_info
              ? `
          <div class="section">
            <h3>Additional Information</h3>
            <p>${resume.additional_info}</p>
          </div>
          `
              : ""
          }
        </body>
      </html>
    `;

    // Create a blob and download link
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.name.replace(/\s+/g, "_")}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  return {
    resumeData,
    resumes,
    isLoading,
    handleInputChange,
    saveResume,
    loadResumes,
    selectResume,
    deleteResume,
    clearResume,
    handleDownloadPDF,
  };
};
