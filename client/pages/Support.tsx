import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <main className="relative container grid gap-10 py-10 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="mt-1 text-foreground/70">We usually respond within 24 hours.</p>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-foreground/70">Name</label>
            <Input placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">Email</label>
            <Input type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">Message</label>
            <Textarea placeholder="How can we help?" />
          </div>
          <Button>Send Message</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I book a session?</AccordionTrigger>
            <AccordionContent>Go to Scheduling, select a date, and pick an available slot.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How are payments processed?</AccordionTrigger>
            <AccordionContent>We support Stripe and PayPal for secure transactions.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I reschedule a session?</AccordionTrigger>
            <AccordionContent>Yes, go to your dashboard and select Reschedule on the session.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <button
        className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label="Open chatbot"
      >
        <MessageCircle />
      </button>
    </main>
  );
}
