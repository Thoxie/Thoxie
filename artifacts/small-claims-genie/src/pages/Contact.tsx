import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";

function Content() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contact Us</h1>
        <p className="text-muted-foreground text-lg">Get in touch with the Small Claims Genie team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reach Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We are a technology company providing tools to help self-represented individuals prepare for small claims court. <strong>We are not a law firm and cannot provide legal advice.</strong>
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email Support</h3>
                <p className="text-muted-foreground text-sm mt-1">For technical issues and account questions.</p>
                <a href="mailto:support@smallclaimsgenie.com" className="text-primary hover:underline font-medium mt-2 inline-block">
                  support@smallclaimsgenie.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mailing Address</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Small Claims Genie LLC<br />
                  123 Tech Boulevard, Suite 400<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Contact() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) {
    return <AppLayout><Content /></AppLayout>;
  }
  
  return <PublicLayout><div className="container mx-auto py-12 px-4"><Content /></div></PublicLayout>;
}
