import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsProfile() {
  const handleGoToSettings = () => {
    // Navigate to settings page or show settings modal
    alert("Redirecting to Settings...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Settings & Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and profile details.
        </p>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoToSettings} className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Go to Settings
        </Button>
      </CardContent>
    </Card>
  );
}