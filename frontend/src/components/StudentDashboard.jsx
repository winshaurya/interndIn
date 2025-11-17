import { useState } from "react";
import Header from "./Header";
import SkillTrends from "./SkillTrends";
import MarketShare from "./MarketShare";
import PersonalizedTips from "./PersonalizedTips";
import JobCard from "./JobCard";
import ApplicationHistory from "./ApplicationHistory";
import SettingsProfile from "./SettingsProfile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch student profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => apiClient.getStudentProfile(),
  });

  // Fetch recommended jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.getJobs(),
  });

  const profile = profileData?.data;
  const jobs = jobsData?.data?.jobs || [];

  // Progress calculation based on profile data
  const progress = profile ? (
    (profile.resume_url ? 25 : 0) +
    (profile.skills && profile.skills.length > 0 ? 25 : 0) +
    (profile.name ? 25 : 0) +
    (profile.grad_year ? 25 : 0)
  ) : 0;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        {/* 🔹 Profile Progress Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Profile Progress</h2>
            {/* ✅ Fixed navigation path */}
            <Button onClick={() => navigate("/student/profile")} className="bg-blue-500">
              Complete Profile
            </Button>
          </div>

          <p className="text-gray-600 mb-2">
            Complete your profile to unlock more opportunities and gain badges!
          </p>

          {/* Progress Bar */}
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold text-blue-600 mr-4">
              {progress}%
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tasks + Badges */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tasks */}
            <div>
              <h3 className="font-medium mb-2">Tasks to Complete</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  {profile?.resume_url ? "✅" : "⭕"} Upload your resume
                </li>
                <li>
                  {profile?.name ? "✅" : "⭕"} Complete your profile
                </li>
                <li>
                  {profile?.skills && profile.skills.length > 0 ? "✅" : "⭕"} Add skills
                </li>
                <li>
                  {profile?.grad_year ? "✅" : "⭕"} Add graduation year
                </li>
              </ul>
            </div>

            {/* Badges */}
            <div>
              <h3 className="font-medium mb-2">Your Badges</h3>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    ⭐
                  </div>
                  <p className="text-xs mt-1">Profile Pioneer</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    🔍
                  </div>
                  <p className="text-xs mt-1">Skill Seeker</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <SkillTrends />
          <MarketShare />
          <PersonalizedTips />
        </div>

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recommended for You</h2>
            <Button onClick={() => navigate("/jobs")} variant="outline">
              View All Jobs
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <JobCard
                key={job.job_id}
                id={job.job_id}
                title={job.job_title}
                company={job.company_name}
                location="Remote"
                type="Full-time"
              />
            ))}
          </div>
        </div>

        {/* Application History */}
        <ApplicationHistory />

        {/* Settings & Profile */}
        <SettingsProfile />
      </main>
    </div>
  );
}
