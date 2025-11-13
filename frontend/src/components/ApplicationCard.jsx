import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "./StatusBadge";
import { Calendar, Building, MapPin, Eye, MessageCircle } from "lucide-react";

export default function ApplicationCard({ application, onViewDetails }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString) => {
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{application.company}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{application.location}</span>
                </div>
              </div>
            </div>
            <StatusBadge status={application.status} />
          </div>

          {/* Application Details */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Applied {getDaysAgo(application.appliedDate)}</span>
            </div>
            {application.lastUpdated && (
              <div className="flex items-center space-x-1">
                <span>Updated {formatDate(application.lastUpdated)}</span>
              </div>
            )}
          </div>

          {/* Job Type Badge */}
          <div>
            <Badge variant="outline" className="text-xs">
              {application.jobType}
            </Badge>
          </div>

          {/* Status Message */}
          {application.statusMessage && (
            <div className="p-3 rounded-md bg-muted/50 border-l-4 border-primary">
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Update from {application.company}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application.statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Guidance */}
          {application.status === 'rejected' && application.rejectionFeedback && (
            <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-1">
                Feedback for improvement:
              </p>
              <p className="text-sm text-muted-foreground">
                {application.rejectionFeedback}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Application ID: {application.id}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(application)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              {application.status === 'interview' && (
                <Button size="sm">
                  Schedule Interview
                </Button>
              )}
              {application.status === 'offered' && (
                <Button size="sm">
                  View Offer
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}