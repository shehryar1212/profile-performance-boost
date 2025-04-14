
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface AnalysisResultsProps {
  result: {
    match_percentage: number;
    missing_keywords: string[];
    improvement_summary: string;
  };
  onReset: () => void;
}

const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  const { match_percentage, missing_keywords, improvement_summary } = result;
  
  // Determine score category and styling
  const getScoreDetails = () => {
    if (match_percentage >= 80) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        progressColor: "bg-green-500",
        message: "Excellent match!"
      };
    } else if (match_percentage >= 60) {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        progressColor: "bg-amber-500",
        message: "Good match with room for improvement"
      };
    } else {
      return {
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        progressColor: "bg-red-500",
        message: "Significant gaps detected"
      };
    }
  };
  
  const scoreDetails = getScoreDetails();

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center p-6 rounded-lg border bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Match Score</h2>
        
        <div className="relative w-full h-8 mb-4">
          <Progress 
            value={match_percentage} 
            className="h-8 rounded-full"
            indicatorColor={scoreDetails.progressColor}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-white drop-shadow-sm">
              {Math.round(match_percentage)}%
            </span>
          </div>
        </div>
        
        <div className={`flex items-center ${scoreDetails.color} mt-2`}>
          {scoreDetails.icon}
          <span className="ml-2 font-medium">{scoreDetails.message}</span>
        </div>
      </div>
      
      {missing_keywords.length > 0 && (
        <div className={`p-6 rounded-lg border ${scoreDetails.borderColor} ${scoreDetails.bgColor}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Missing Keywords
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {missing_keywords.map((keyword, index) => (
              <li key={index} className="text-gray-700">
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="p-6 rounded-lg border bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          AI Improvement Suggestions
        </h2>
        <div className="text-gray-700 whitespace-pre-line">
          {improvement_summary}
        </div>
      </div>
      
      <Button 
        onClick={onReset}
        variant="outline" 
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Analyze Another Resume
      </Button>
    </div>
  );
};

export default AnalysisResults;
