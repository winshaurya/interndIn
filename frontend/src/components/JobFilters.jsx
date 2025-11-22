import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function JobFilters({ onFilterChange, activeFilters = {} }) {
  const [selectedTypes, setSelectedTypes] = useState(activeFilters.employment_type || []);
  const [selectedLocations, setSelectedLocations] = useState(activeFilters.location || []);
  const [selectedSkills, setSelectedSkills] = useState(activeFilters.skills || []);

  const jobTypes = ["Full-time", "Internship", "Contract", "Part-time", "Freelance"];
  const locations = ["Remote", "Indore", "Bhopal", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune"];
  const popularSkills = ["React", "Python", "JavaScript", "Java", "Node.js", "AWS", "MongoDB", "SQL", "HTML", "CSS"];

  const toggleSelection = (value, selected, setter) => {
    const newSelection = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    setter(newSelection);
  };

  // Update parent component when filters change
  useEffect(() => {
    const filters = {
      ...(selectedTypes.length > 0 && { employment_type: selectedTypes }),
      ...(selectedLocations.length > 0 && { location: selectedLocations }),
      ...(selectedSkills.length > 0 && { skills: selectedSkills }),
    };
    onFilterChange && onFilterChange(filters);
  }, [selectedTypes, selectedLocations, selectedSkills, onFilterChange]);

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedSkills([]);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedLocations.length > 0 || selectedSkills.length > 0;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="link"
            className="text-muted-foreground p-0 h-auto w-fit justify-start"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Type Filter */}
        <div>
          <h3 className="font-medium mb-3">Job Type</h3>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                />
                <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Location Filter */}
        <div>
          <h3 className="font-medium mb-3">Location</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={selectedLocations.includes(location)}
                  onCheckedChange={() => toggleSelection(location, selectedLocations, setSelectedLocations)}
                />
                <label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                  {location}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Popular Skills */}
        <div>
          <h3 className="font-medium mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
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