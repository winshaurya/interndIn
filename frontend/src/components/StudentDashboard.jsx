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

const recommendedJobs = [
  { id: "1", title: "Junior Frontend Developer", company: "InnovaTech - New York, NY", location: "New York, NY", type: "Full-time" },
  { id: "2", title: "Data Analyst Intern", company: "Global Insights - Remote", location: "Remote", type: "Internship" },
  { id: "3", title: "Cloud Support Engineer", company: "CloudWorks - Seattle, WA", location: "Seattle, WA", type: "Full-time" },
  { id: "4", title: "UI/UX Designer", company: "CreativeFlow - Austin, TX", location: "Austin, TX", type: "Contract" },
  { id: "5", title: "Backend Developer", company: "CodeForge - San Francisco, CA", location: "San Francisco, CA", type: "Full-time" },
  { id: "6", title: "Software Engineering Intern", company: "Apex Solutions - Boston, MA", location: "Boston, MA", type: "Internship" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  // ✅ Profile data state
  const [profileData, setProfileData] = useState({
    resumeUploaded: true,
    experiences: ["Frontend Developer"],
    skills: [],
    summary: "",
  });

  // Progress calculation
  const progress =
    (profileData.resumeUploaded ? 25 : 0) +
    (profileData.experiences.length > 0 ? 25 : 0) +
    (profileData.skills.length >= 3 ? 25 : 0) +
    (profileData.summary ? 25 : 0);

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
                  {profileData.resumeUploaded ? "✅" : "⭕"} Upload your resume
                </li>
                <li>
                  {profileData.experiences.length > 0 ? "✅" : "⭕"} Fill out work
                  experience
                </li>
                <li>
                  {profileData.skills.length >= 3 ? "✅" : "⭕"} Add 3 key skills
                </li>
                <li>
                  {profileData.summary ? "✅" : "⭕"} Write a professional
                  summary
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
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                type={job.type}
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
