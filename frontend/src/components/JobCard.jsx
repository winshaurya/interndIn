import { useState } from "react";
import { MapPin, Clock, ChevronRight, Building, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ApplicationModal from "@/components/ApplicationModals";

const typeColors = {
  "Full-time": "bg-orange-100 text-orange-800 border-orange-200",
  "Internship": "bg-blue-100 text-blue-800 border-blue-200",
  "Contract": "bg-green-100 text-green-800 border-green-200",
  "Part-time": "bg-purple-100 text-purple-800 border-purple-200",
  "Freelance": "bg-pink-100 text-pink-800 border-pink-200",
};

export default function JobCard({
  id = "1",
  title,
  company,
  location,
  type,
  description,
  alumniName,
  alumniDesignation,
  createdAt
}) {
  const navigate = useNavigate();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleViewDetails = () => {
    navigate(`/jobs/${id}`);
  };

  const jobDetails = {
    id,
    title,
    company,
    location,
    type,
    description,
    alumniName,
    alumniDesignation,
    createdAt
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleViewDetails}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              {company}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            {createdAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {truncateText(description)}
            </p>
          )}

          {(alumniName || alumniDesignation) && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                Posted by {alumniName}
                {alumniDesignation && ` • ${alumniDesignation}`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={typeColors[type] || "bg-gray-100 text-gray-800"}>
              {type}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}>
                View Details
              </Button>
              <Button size="sm" onClick={(e) => {
                e.stopPropagation();
                setIsApplicationModalOpen(true);
              }}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        jobDetails={jobDetails}
      />
    </Card>
  );
}