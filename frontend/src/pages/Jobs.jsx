import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, SlidersHorizontal, ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch jobs from API
  const { data: jobsData, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchQuery, sortBy, activeFilters],
    queryFn: () => apiClient.getJobs({
      search: searchQuery,
      sort: sortBy,
      ...activeFilters,
    }),
    onError: (error) => {
      toast({
        title: "Error loading jobs",
        description: error.message || "Failed to load job listings",
        variant: "destructive",
      });
    },
  });

  const jobs = jobsData?.data?.jobs || [];
  const jobCount = jobsData?.data?.count || 0;

  const handleSearch = () => {
    refetch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
  };

  const removeFilter = (filterKey, value) => {
    if (filterKey === 'search') {
      setSearchQuery("");
    } else {
      setActiveFilters(prev => {
        const newFilters = { ...prev };
        if (Array.isArray(newFilters[filterKey])) {
          newFilters[filterKey] = newFilters[filterKey].filter(item => item !== value);
          if (newFilters[filterKey].length === 0) {
            delete newFilters[filterKey];
          }
        } else {
          delete newFilters[filterKey];
        }
        return newFilters;
      });
    }
  };

  const getActiveFilterBadges = () => {
    const badges = [];

    if (searchQuery.trim()) {
      badges.push({
        key: 'search',
        value: searchQuery,
        label: `Search: "${searchQuery}"`,
      });
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          badges.push({
            key,
            value: item,
            label: `${key}: ${item}`,
          });
        });
      } else if (value) {
        badges.push({
          key,
          value,
          label: `${key}: ${value}`,
        });
      }
    });

    return badges;
  };

  const getUserHomeRoute = () => {
    if (!user) return "/";
    return user.role === "student" ? "/student" : "/alumni";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate(getUserHomeRoute())}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Opportunity</h1>
          <p className="text-primary-foreground/80 mb-6">
            Discover internships, jobs, and projects tailored for SGSITS students
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
            </div>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <JobFilters onFilterChange={handleFilterChange} activeFilters={activeFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : `${jobCount} opportunities found`}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Job Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {getActiveFilterBadges().length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {getActiveFilterBadges().map((badge) => (
                  <Badge
                    key={`${badge.key}-${badge.value}`}
                    variant="secondary"
                    className="bg-primary/10 text-primary flex items-center gap-1"
                  >
                    {badge.label}
                    <button
                      onClick={() => removeFilter(badge.key, badge.value)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button variant="link" className="text-muted-foreground p-0 h-auto" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Jobs Grid */}
            <motion.div
              className="grid gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading jobs...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Failed to load jobs. Please try again.</p>
                  <Button onClick={() => refetch()} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                  {getActiveFilterBadges().length > 0 && (
                    <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                jobs.map((job, index) => (
                  <motion.div
                    key={job.job_id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <JobCard
                      id={job.job_id}
                      title={job.job_title}
                      company={job.company_name || "Company"}
                      location={job.location || "Remote"}
                      type={job.employment_type || "Full-time"}
                      description={job.job_description}
                      alumniName={job.alumni_name}
                      alumniDesignation={job.alumni_designation}
                      createdAt={job.created_at}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
