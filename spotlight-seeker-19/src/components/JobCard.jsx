import { useState } from "react";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ApplicationModal from "@/components/ApplicationModals";
const typeColors = {
  "Full-time": "bg-orange-100 text-orange-800 border-orange-200",
  "Internship": "bg-blue-100 text-blue-800 border-blue-200", 
  "Contract": "bg-green-100 text-green-800 border-green-200"
};

export default function JobCard({ id = "1", title, company, location, type }) {
  const navigate = useNavigate();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleViewDetails = () => {
    navigate(`/jobs/${id}`);
  };

  const jobDetails = { id, title, company, location, type };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleViewDetails}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground">{company}</p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={typeColors[type]}>
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