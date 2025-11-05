import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialFormData = {
  jobTitle: "",
  jobType: "",
  description: "",
  keyResponsibilities: "",
  requirements: "",
  allowedBranches: [],
  requiredSkills: [],
  niceToHaveSkills: [],
  ctcType: "",
  experienceBand: "",
  minCtc: "",
  maxCtc: "",
  workMode: "",
  location: "",
  applyByDate: "",
  numberOfOpenings: "",
  applicationLimit: "",
  customQuestions: [""],
  ndaRequired: false
};

const steps = [
  { id: 1, title: "Basics", weight: 20 },
  { id: 2, title: "Eligibility", weight: 20 },
  { id: 3, title: "Compensation & Mode", weight: 20 },
  { id: 4, title: "Dates & Limits", weight: 20 },
  { id: 5, title: "Extras", weight: 20 }
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
const skills = ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "AWS"];
const ctcTypes = ["CTC", "Stipend"];
const experienceBands = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];
const workModes = ["Remote", "On-site", "Hybrid"];

export function PostJob() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const calculateProgress = () => {
    let completedWeight = 0;
    
    // Step 1 validation
    if (formData.jobTitle && formData.jobType && formData.description) {
      completedWeight += steps[0].weight;
    }
    
    // Step 2 validation
    if (formData.allowedBranches.length > 0 && formData.requiredSkills.length > 0) {
      completedWeight += steps[1].weight;
    }
    
    // Step 3 validation
    if (formData.ctcType && formData.workMode && formData.location) {
      completedWeight += steps[2].weight;
    }
    
    // Step 4 validation
    if (formData.applyByDate && formData.numberOfOpenings) {
      completedWeight += steps[3].weight;
    }
    
    // Step 5 is always considered complete
    if (currentStep >= 5) {
      completedWeight += steps[4].weight;
    }
    
    return completedWeight;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleArrayUpdate = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const addCustomQuestion = () => {
    if (formData.customQuestions.length < 5) {
      setFormData(prev => ({
        ...prev,
        customQuestions: [...prev.customQuestions, ""]
      }));
    }
  };

  const removeCustomQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const updateCustomQuestion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => i === index ? value : q)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (2200 characters)</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, what the candidate will be doing..."
                className="min-h-32"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="text-sm text-muted-foreground">
                {formData.description.length}/2200 characters minimum
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyResponsibilities">Key Responsibilities</Label>
              <Textarea
                id="keyResponsibilities"
                placeholder="List the main responsibilities..."
                value={formData.keyResponsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, keyResponsibilities: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List the required qualifications, skills..."
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Allowed Branches *</Label>
              <div className="space-y-2">
                {branches.map(branch => (
                  <div key={branch} className="flex items-center space-x-2">
                    <Checkbox
                      id={branch}
                      checked={formData.allowedBranches.includes(branch)}
                      onCheckedChange={(checked) => handleArrayUpdate('allowedBranches', branch, checked)}
                    />
                    <Label htmlFor={branch}>{branch}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Required Skills *</Label>
              <div className="space-y-2">
                {skills.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`req-${skill}`}
                      checked={formData.requiredSkills.includes(skill)}
                      onCheckedChange={(checked) => handleArrayUpdate('requiredSkills', skill, checked)}
                    />
                    <Label htmlFor={`req-${skill}`}>{skill}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Nice-to-Have Skills</Label>
              <div className="space-y-2">
                {skills.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nice-${skill}`}
                      checked={formData.niceToHaveSkills.includes(skill)}
                      onCheckedChange={(checked) => handleArrayUpdate('niceToHaveSkills', skill, checked)}
                    />
                    <Label htmlFor={`nice-${skill}`}>{skill}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTC/Stipend Type</Label>
                <Select value={formData.ctcType} onValueChange={(value) => setFormData(prev => ({ ...prev, ctcType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctcTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Band</Label>
                <Select value={formData.experienceBand} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceBand: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceBands.map(band => (
                      <SelectItem key={band} value={band}>{band}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min CTC/Stipend (₹)</Label>
                <Input
                  placeholder="e.g. 500000"
                  value={formData.minCtc}
                  onChange={(e) => setFormData(prev => ({ ...prev, minCtc: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Max CTC/Stipend (₹)</Label>
                <Input
                  placeholder="e.g. 800000"
                  value={formData.maxCtc}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCtc: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Mode *</Label>
              <Select value={formData.workMode} onValueChange={(value) => setFormData(prev => ({ ...prev, workMode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  {workModes.map(mode => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                placeholder="e.g. Mumbai, Maharashtra, India"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Apply-by Date *</Label>
              <Input
                type="date"
                value={formData.applyByDate}
                onChange={(e) => setFormData(prev => ({ ...prev, applyByDate: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Openings *</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.numberOfOpenings}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfOpenings: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Application Limit</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.applicationLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicationLimit: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Questions (Up to 5)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCustomQuestion}
                  disabled={formData.customQuestions.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {formData.customQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Custom question ${index + 1}...`}
                    value={question}
                    onChange={(e) => updateCustomQuestion(index, e.target.value)}
                  />
                  {formData.customQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ndaRequired"
                checked={formData.ndaRequired}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ndaRequired: checked }))}
              />
              <Label htmlFor="ndaRequired">NDA Required</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/alumni/postings")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Post a Job</h1>
      </div>

      {/* Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-primary font-medium">{progress}% Complete</span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline">
            Save Draft
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button>
              Publish Job
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}