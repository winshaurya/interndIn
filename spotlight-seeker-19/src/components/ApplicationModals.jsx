import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, AlertCircle, ChevronLeft, ChevronRight, User, FileUp, HelpCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationModal({ isOpen, onClose, jobDetails }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    coverLetter: "",
    whyInterestedSGSITS: "",
    expectedSalary: "",
    availableStartDate: "",
    ndaAccepted: false,
    customAnswers: {}
  });
  
  const [uploadedFiles, setUploadedFiles] = useState({
    resume: null,
    portfolio: null,
    additionalDocs: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Documents", icon: FileUp },
    { number: 3, title: "Questions", icon: HelpCircle },
    { number: 4, title: "Review", icon: Check }
  ];

  const mockCustomQuestions = [
    { id: 1, question: "Why do you want to work for our company?", type: "textarea", required: true },
    { id: 2, question: "What is your expected salary range?", type: "text", required: false },
    { id: 3, question: "Are you willing to relocate?", type: "select", options: ["Yes", "No", "Maybe"], required: true }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomAnswerChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      customAnswers: { ...prev.customAnswers, [questionId]: value }
    }));
  };

  const handleFileUpload = (type, file) => {
    if (type === "additionalDocs") {
      setUploadedFiles(prev => ({
        ...prev,
        additionalDocs: [...prev.additionalDocs, file]
      }));
    } else {
      setUploadedFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type, index = null) => {
    if (type === "additionalDocs" && index !== null) {
      setUploadedFiles(prev => ({
        ...prev,
        additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
      }));
    } else {
      setUploadedFiles(prev => ({ ...prev, [type]: null }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return uploadedFiles.resume;
      case 3:
        const requiredQuestions = mockCustomQuestions.filter(q => q.required);
        return requiredQuestions.every(q => formData.customAnswers[q.id]);
      case 4:
        return formData.ndaAccepted;
      default:
        return true;
    }
  };

  const goToStep = (stepNumber) => setCurrentStep(stepNumber);

  const nextStep = (e) => {
    e.stopPropagation();
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, steps.length));
    else toast({ variant: "destructive", title: "Please complete all required fields", description: "Fill in all required information before proceeding." });
  };

  const prevStep = (e) => {
    e.stopPropagation();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!validateStep(4)) {
      toast({ variant: "destructive", title: "Please complete all steps", description: "Make sure all required information is filled out." });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({ title: "Application Submitted!", description: "We'll review your application and get back to you soon.", variant: "default" });
      setIsSubmitting(false);
      onClose();

      setCurrentStep(1);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", coverLetter: "", whyInterestedSGSITS: "", expectedSalary: "", availableStartDate: "", ndaAccepted: false, customAnswers: {} });
      setUploadedFiles({ resume: null, portfolio: null, additionalDocs: [] });
    }, 2000);
  };

  const FileUploadSection = ({ title, type, accept, required = false }) => (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <Label className="text-sm font-medium">{title} {required && <span className="text-destructive">*</span>}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
        <Input type="file" accept={accept} onChange={(e) => e.target.files[0] && handleFileUpload(type, e.target.files[0])} className="hidden" id={`file-${type}`} />
        <label htmlFor={`file-${type}`} className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">{accept}</p>
        </label>
      </div>
      {uploadedFiles[type] && (
        <div className="flex items-center justify-between p-2 bg-accent rounded-md">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{uploadedFiles[type].name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(type); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-accent/5">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
              <div>
                <h3 className="font-bold text-xl">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["firstName", "lastName", "email", "phone"].map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)} <span className="text-destructive">*</span></Label>
                  <Input
                    id={field} value={formData[field]} onChange={(e) => handleInputChange(field, e.target.value)}
                    onClick={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}
                    required className="h-11 border-2 focus:border-primary transition-colors bg-background"
                    placeholder={`Enter your ${field}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

      case 2: return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-accent/5">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center"><FileUp className="h-6 w-6 text-blue-600" /></div>
              <div>
                <h3 className="font-bold text-xl">Upload Documents</h3>
                <p className="text-sm text-muted-foreground">Share your resume and cover letter</p>
              </div>
            </div>
            <div className="space-y-6">
              <FileUploadSection title="Resume" type="resume" accept=".pdf,.doc,.docx" required />
              <FileUploadSection title="Cover Letter (Optional)" type="portfolio" accept=".pdf,.doc,.docx" />
              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="text-sm font-semibold">Additional Cover Letter</Label>
                <Textarea id="coverLetter" placeholder="Tell us why you're interested in this position..." value={formData.coverLetter} onChange={(e) => handleInputChange("coverLetter", e.target.value)} onClick={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()} rows={4} className="border-2 focus:border-primary transition-colors resize-none bg-background" />
              </div>
            </div>
          </CardContent>
        </Card>
      );

      case 3: return (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Additional Questions</h3>
            {mockCustomQuestions.map(question => (
              <div key={question.id}>
                <Label>{question.question}{question.required && <span className="text-destructive ml-1">*</span>}</Label>
                {question.type === "textarea" ? (
                  <Textarea value={formData.customAnswers[question.id] || ""} onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)} rows={3} className="mt-1" />
                ) : question.type === "select" ? (
                  <select value={formData.customAnswers[question.id] || ""} onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)} className="mt-1 w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select an option</option>
                    {question.options.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <Input value={formData.customAnswers[question.id] || ""} onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)} className="mt-1" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      );

      case 4: return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Review Your Application</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">{formData.firstName} {formData.lastName} • {formData.email} • {formData.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium">Documents</h4>
                  <p className="text-sm text-muted-foreground">Resume: {uploadedFiles.resume?.name || "Not uploaded"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-warning">Non-Disclosure Agreement</h3>
                  <p className="text-sm text-muted-foreground">
                    By applying to this position, you agree to keep all information shared during the application process confidential.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="nda" checked={formData.ndaAccepted} onCheckedChange={(checked) => handleInputChange("ndaAccepted", checked)} />
                    <Label htmlFor="nda" className="text-sm">I agree to the Non-Disclosure Agreement terms<span className="text-destructive ml-1">*</span></Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-background via-background to-accent/10 flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:bg-accent/50 rounded-full w-10 h-10 p-0">
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">Apply for {jobDetails?.title || "Position"}</h1>
              <p className="text-sm text-muted-foreground">{jobDetails?.company} • {jobDetails?.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <div className="w-32 bg-accent/30 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold text-primary">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-card/50 border-b border-border/10 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center space-x-8">
            {steps.map(step => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <button key={step.number} onClick={(e) => { e.stopPropagation(); goToStep(step.number); }} className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary border-2 border-primary/30 shadow-lg transform scale-105' : isCompleted ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100' : 'bg-accent/20 text-muted-foreground border-2 border-transparent hover:bg-accent/40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base">{step.title}</div>
                    <div className="text-xs opacity-70">Step {step.number}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {renderStepContent()}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/20 px-6 py-6 shadow-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="h-6 w-6 mr-2" /> Previous
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Step {currentStep} of {steps.length}</div>
            <div className="text-xl font-semibold">{steps[currentStep - 1]?.title}</div>
          </div>
          {currentStep < steps.length ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)} className="px-8 py-4 h-14 font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              Next <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!validateStep(4) || isSubmitting} className="px-8 py-4 h-14 font-semibold text-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isSubmitting ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" /> Submitting...</> : <><Check className="h-5 w-5 mr-2" /> Submit Application</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
