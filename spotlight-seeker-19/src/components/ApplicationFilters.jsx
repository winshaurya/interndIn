import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "under-review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Not Selected" },
  { value: "withdrawn", label: "Withdrawn" }
];

const jobTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Full-time", label: "Full-time" },
  { value: "Internship", label: "Internship" },
  { value: "Contract", label: "Contract" },
  { value: "Part-time", label: "Part-time" }
];

const dateRangeOptions = [
  { value: "all", label: "All Time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "365", label: "Last year" }
];

export default function ApplicationFilters({ 
  filters, 
  onFiltersChange, 
  totalApplications,
  filteredCount 
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      jobType: "all",
      dateRange: "all"
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status !== "all" || 
    filters.jobType !== "all" || 
    filters.dateRange !== "all";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by company, position, or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.jobType} 
              onValueChange={(value) => handleFilterChange("jobType", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalApplications} applications
            </div>
            
            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex space-x-1">
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{filters.search}"
                    </Badge>
                  )}
                  {filters.status !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusOptions.find(o => o.value === filters.status)?.label}
                    </Badge>
                  )}
                  {filters.jobType !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Type: {filters.jobType}
                    </Badge>
                  )}
                  {filters.dateRange !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Date: {dateRangeOptions.find(o => o.value === filters.dateRange)?.label}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}