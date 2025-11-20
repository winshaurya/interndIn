import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, FileText, Users, PenTool, AlertTriangle, LifeBuoy, Mail, MessageSquare } from "lucide-react";

const principles = [
  {
    title: "Data minimisation",
    description: "We only collect fields that help students find roles and alumni share opportunities.",
    icon: Lock,
  },
  {
    title: "Human review first",
    description: "Sensitive actions require verified staff approval.",
    icon: Shield,
  },
  {
    title: "Transparent audit trail",
    description: "Every action is logged with timestamps.",
    icon: FileText,
  },
];

const supportChannels = [
  {
    title: "Email support",
    description: "Drop us a note and we respond within 12 hours.",
    icon: Mail,
    contact: "support@interndin.com",
  },
  {
    title: "Live chat",
    description: "Connect with specialists during business hours.",
    icon: MessageSquare,
    contact: "Mon–Sat · 9am-7pm IST",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <section className="bg-background py-16 border-b">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <Badge variant="outline" className="w-fit">Updated 20 Nov 2025</Badge>
          <h1 className="text-4xl font-semibold">Privacy, Policies & Support</h1>
          <p className="text-muted-foreground max-w-3xl">
            interndIn is built for students, alumni mentors, and campus admins. These policies keep interactions constructive and secure.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title} className="h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <principle.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{principle.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {principle.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12 bg-background/80 border-y">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-primary" />
                Privacy & data handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
                <li>Account credentials stay encrypted and are never shared.</li>
                <li>Personal data is retained for 24 months after inactivity.</li>
                <li>You can export or delete your profile anytime.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {supportChannels.map((channel) => (
                  <div key={channel.title} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <channel.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{channel.title}</p>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                      <p className="text-xs text-primary">{channel.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Contact & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>For violations or security incidents, contact <a className="text-primary underline" href="mailto:support@interndin.com">support@interndin.com</a>.</p>
              <p>We respond within 24 hours and escalate severe issues immediately.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}