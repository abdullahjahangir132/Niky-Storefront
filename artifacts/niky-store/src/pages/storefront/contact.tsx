import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setName(""); setEmail(""); setSubject(""); setMessage("");
    toast({ title: "Message sent!", description: "Our team will respond within 24 hours." });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Get In Touch</p>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter">Contact Us</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Have a question or need help with an order? Our team in Lahore is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" required />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@email.com" required />
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Order issue, size question, etc." required />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Tell us how we can help..." required />
            </div>
            <Button type="submit" className="w-full h-12 font-display uppercase tracking-wider" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Our Office</h3>
                <p className="text-muted-foreground text-sm">123 Main Boulevard, Gulberg III<br />Lahore, Punjab 54000, Pakistan</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Phone</h3>
                <p className="text-muted-foreground text-sm">+92 300 1234567</p>
                <p className="text-muted-foreground text-xs mt-1">WhatsApp available</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Email</h3>
                <p className="text-muted-foreground text-sm">support@nanoshoes.pk</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-1">Support Hours</h3>
                <p className="text-muted-foreground text-sm">Mon–Sat: 9 AM – 7 PM PKT<br />Sunday: 11 AM – 4 PM PKT</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-2xl p-6 bg-secondary/10">
            <h3 className="font-display font-bold text-lg uppercase tracking-tight mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/track-order" className="block text-muted-foreground hover:text-foreground transition-colors">Track Your Order</a>
              <a href="/faqs" className="block text-muted-foreground hover:text-foreground transition-colors">Frequently Asked Questions</a>
              <a href="/size-guide" className="block text-muted-foreground hover:text-foreground transition-colors">Size Guide</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
