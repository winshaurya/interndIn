import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function JobFilters() {
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [stipendRange, setStipendRange] = useState([0, 1500000]);
  const [selectedExperience, setSelectedExperience] = useState([]);

  const branches = [
    "Computer Science & Engineering",
    "Information Technology", 
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering"
  ];

  const workModes = ["Remote", "On-site", "Hybrid"];
  const jobTypes = ["Full-time", "Internship", "Contract", "Part-time"];
  const experienceLevels = ["0-1 years", "1-2 years", "2-3 years", "3+ years"];

  const toggleSelection = (value, selected, setter) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        <Button variant="link" className="text-muted-foreground p-0 h-auto w-fit">
          Clear all
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branch Filter */}
        <div>
          <h3 className="font-medium mb-3">Branch</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {branches.map((branch) => (
              <div key={branch} className="flex items-center space-x-2">
                <Checkbox
                  id={branch}
                  checked={selectedBranches.includes(branch)}
                  onCheckedChange={() => toggleSelection(branch, selectedBranches, setSelectedBranches)}
                />
                <label htmlFor={branch} className="text-sm cursor-pointer">
                  {branch}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Job Type Filter */}
        <div>
          <h3 className="font-medium mb-3">Job Type</h3>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                />
                <label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Work Mode Filter */}
        <div>
          <h3 className="font-medium mb-3">Work Mode</h3>
          <div className="space-y-2">
            {workModes.map((mode) => (
              <div key={mode} className="flex items-center space-x-2">
                <Checkbox
                  id={mode}
                  checked={selectedModes.includes(mode)}
                  onCheckedChange={() => toggleSelection(mode, selectedModes, setSelectedModes)}
                />
                <label htmlFor={mode} className="text-sm cursor-pointer">
                  {mode}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stipend Range Filter */}
        <div>
          <h3 className="font-medium mb-3">Stipend Range</h3>
          <div className="px-2">
            <Slider
              value={stipendRange}
              onValueChange={setStipendRange}
              max={1500000}
              min={0}
              step={50000}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{(stipendRange[0] / 100000).toFixed(1)}L</span>
              <span>₹{(stipendRange[1] / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Experience Filter */}
        <div>
          <h3 className="font-medium mb-3">Experience Level</h3>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={selectedExperience.includes(level)}
                  onCheckedChange={() => toggleSelection(level, selectedExperience, setSelectedExperience)}
                />
                <label htmlFor={level} className="text-sm cursor-pointer">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Popular Skills */}
        <div>
          <h3 className="font-medium mb-3">Popular Skills</h3>
          <div className="flex flex-wrap gap-2">
            {["React", "Python", "JavaScript", "Java", "Node.js", "AWS", "MongoDB", "SQL"].map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}