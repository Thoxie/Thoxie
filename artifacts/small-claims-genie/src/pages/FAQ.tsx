import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUser } from "@clerk/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need a lawyer?",
    a: "No. In fact, in California Small Claims Court, lawyers are generally not allowed to represent parties during the hearing itself. The system is designed for everyday people to represent themselves."
  },
  {
    q: "How much does it cost?",
    a: "The court filing fee ranges from $30 to $100 depending on the amount of your claim. You may also need to pay for service of process, which usually costs $40-$75 if you use the sheriff or a private process server."
  },
  {
    q: "How long does it take?",
    a: "Usually, a hearing is scheduled 30 to 70 days after you file your claim. The actual hearing typically lasts about 15-20 minutes."
  },
  {
    q: "Can I recover fees if I win?",
    a: "Yes. If you win, you can ask the judge to include your court costs (like the filing fee and service of process fee) in the judgment against the defendant. You generally cannot recover lost wages for taking time off work to attend court."
  },
  {
    q: "Can I settle before the hearing?",
    a: "Yes! The court encourages parties to settle their disputes. If you reach an agreement, you can file a form to dismiss the case. This is why sending a formal Demand Letter is so important—it often leads to settlement."
  },
  {
    q: "Does Small Claims Genie handle service of process?",
    a: "No. We help you prepare your case, generate demand letters, and organize your intake forms. You are responsible for officially filing the papers with the court and arranging for the defendant to be served."
  },
  {
    q: "Can I file against a business?",
    a: "Yes. You must make sure you sue the exact legal entity. If they are a corporation or LLC, you will need to serve their 'Agent for Service of Process', which you can look up on the California Secretary of State website."
  },
  {
    q: "Is my information secure?",
    a: "We take privacy seriously. Your data is encrypted and only accessible by you. We do not sell your case information to third parties or law firms."
  }
];

function Content() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Common questions about Small Claims Genie and the California Small Claims process.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card rounded-xl border p-2 shadow-sm">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="px-4">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function FAQ() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) {
    return <AppLayout><Content /></AppLayout>;
  }
  
  return <PublicLayout><div className="container mx-auto py-12 px-4"><Content /></div></PublicLayout>;
}
