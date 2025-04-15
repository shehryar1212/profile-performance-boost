
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setResume(file);
    }
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
    
    const formData = new FormData();
    // Use the field name 'file' instead of 'resume' as expected by the backend
    formData.append("file", resume);
    formData.append("job_description", jobDescription);
    
    try {
      console.log("Sending request to backend...");
      const response = await fetch("https://resume-analyzer-flask-production.up.railway.app/analyze/", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(`Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      // Extract and parse the JSON string from the markdown-formatted response
      const jsonString = responseData.result.replace(/```json\n|\n```/g, '');
      console.log("Extracted JSON string:", jsonString);
      
      const parsedData = JSON.parse(jsonString);
      console.log("Parsed data:", parsedData);
      
      // Map the backend response to our expected format
      const formattedResult: AnalysisResult = {
        match_percentage: parsedData.match_score,
        missing_keywords: parsedData.missing_keywords,
        improvement_summary: parsedData.summary
      };
      
      setResult(formattedResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze your resume. Please try again.",
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
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Resume Analyzer</CardTitle>
        <CardDescription className="text-blue-100">
          Powered by Gemini AI
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
                    <p className="font-medium">{resume.name}</p>
                    <p className="text-sm text-gray-500">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="font-medium">Click to upload your resume</p>
                    <p className="text-sm">PDF format only</p>
                  </div>
                )}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-32 resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  </div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Resume
                </div>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeAnalyzer;
