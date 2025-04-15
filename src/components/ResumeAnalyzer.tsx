import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AnalysisResults from "@/components/AnalysisResults";

interface AnalysisResult {
  match_percentage: number;
  missing_keywords: string[];
  improvement_summary: string;
}

const ResumeAnalyzer = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      e.target.value = ""; // Reset input
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 5MB",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    
    setResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      toast({
        title: "Missing resume",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }
    
    if (!jobDescription.trim()) {
      toast({
        title: "Missing job description",
        description: "Please enter the job description",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", resume);
      formData.append("job_description", jobDescription);
      
      const response = await fetch("https://resume-analyzer-flask-production.up.railway.app/analyze", { // Removed trailing slash
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // More robust JSON extraction
      const jsonMatch = responseData.result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from server");
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      setResult({
        match_percentage: parsedData.match_score,
        missing_keywords: parsedData.missing_keywords || [],
        improvement_summary: parsedData.summary || "No summary provided"
      });
      
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze your resume",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setResume(null);
    setJobDescription("");
    // Reset file input
    const fileInput = document.getElementById("resume-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Resume Analyzer</CardTitle>
        <CardDescription className="text-blue-100">
          Get personalized feedback on your resume
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {result ? (
          <AnalysisResults 
            result={result}
            onReset={resetAnalysis}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Resume (PDF)
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  resume ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-400"
                }`}
                onClick={() => document.getElementById("resume-upload")?.click()}
              >
                {resume ? (
                  <div className="flex flex-col items-center text-green-600">
                    <CheckCircle className="h-8 w-8 mb-2" />
                    <p className="font-medium truncate max-w-xs">{resume.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{(resume.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="font-medium">Click to upload your resume</p>
                    <p className="text-sm">PDF, max 5MB</p>
                  </div>
                )}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <Textarea
                placeholder="Paste the job description you're applying for..."
                className="min-h-32 resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Resume
                </span>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeAnalyzer;
