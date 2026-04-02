import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@clerk/react";

function Content() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-card border rounded-xl p-8 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Legal Disclaimers</h1>
        <p className="text-muted-foreground text-lg">Please read carefully before using our service.</p>
      </div>

      <div className="prose prose-slate max-w-none text-muted-foreground">
        <h2 className="text-foreground">Not a Law Firm</h2>
        <p>
          Small Claims Genie is a technology platform, not a law firm. The information provided on this website, and any documents generated through our platform, are for informational and self-help purposes only. They do not constitute legal advice.
        </p>

        <h2 className="text-foreground">No Attorney-Client Relationship</h2>
        <p>
          Use of our service, including communication via the AI "Genie" assistant, does not create an attorney-client relationship. If you need legal advice for your specific problem, or if your specific problem is too complex to be addressed by our tools, you should consult a licensed attorney in your area.
        </p>

        <h2 className="text-foreground">Accuracy of Forms and Information</h2>
        <p>
          While we strive to keep our platform accurate, current, and up-to-date, laws and court rules change frequently. We cannot guarantee that all information or forms are completely current. It is your responsibility to verify the rules with your local court.
        </p>

        <h2 className="text-foreground">Limitation of Liability</h2>
        <p>
          Small Claims Genie is not responsible for any loss, injury, claim, liability, or damage related to your use of this site or any site linked to this site, whether from errors or omissions in the content of our site or any other linked sites, from the site being down or from any other use of the site.
        </p>
        
        <h2 className="text-foreground">Service of Process & Filing</h2>
        <p>
          Small Claims Genie only assists with the preparation of documents. We do not file documents with the court on your behalf, nor do we arrange for service of process. You are solely responsible for ensuring your documents are properly filed and the opposing party is legally served within the statutory time limits.
        </p>
      </div>
    </div>
  );
}

export default function Disclaimers() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) {
    return <AppLayout><Content /></AppLayout>;
  }
  
  return <PublicLayout><div className="container mx-auto py-12 px-4"><Content /></div></PublicLayout>;
}
