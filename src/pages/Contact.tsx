import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sendContactMail } from "@/lib/contactMail";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ParishLogo from "@/components/ui/logo";

// Mock — replace with your actual mail function (Node/Nodemailer backend)

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await sendContactMail({
      to: ["hasanch406@gmail.com"],
      subject: "User Contacted!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
          <h2 style="color: #4CAF50; margin-bottom: 10px;">📩 New Contact Message</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd;">
            ${formData.message.replace(/\n/g, "<br>")}
          </div>
          <hr style="margin:20px 0; border:none; border-top:1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            This message was sent from the <strong>Parish Contact Form</strong>.
          </p>
        </div>
      `,
      replyTo: formData.email,
    });

    setLoading(false);

    if (response.success) {
      toast({ title: "Message sent successfully" });
      setFormData({ name: "", email: "", message: "" });
    } else {
      toast({ title: "Message not sent", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="cursor-pointer flex items-center space-x-1 shrink-0">
              <img
                className="w-10 h-8 mr-2 object-contain"
                src="/Parishus logo.png"
                alt="Logo"
                onClick={() => navigate("/")}
              />
              <h1
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap"
                style={{
                  fontSize: "30px",
                  color: "#9dc0b3",
                  fontFamily: "cooper",
                }}
                onClick={() => navigate("/")}
              >
                Parish
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 justify-end">
                <nav className=" md:flex items-center gap-8 text-sm font-medium mx-4">
                    <a  onClick={() => navigate('/')} className=" cursor-pointer text-foreground/70 hover:text-primary transition-colors">Home</a>
                </nav>
                <Button variant="default" size="default" onClick={() => setShowAuth(true)}>
                              Reserve My Seat 
                </Button>
            </div>
        </div>
       
      </header>

      {/* Contact Section */}
<main className="flex-grow flex items-center justify-center px-4 py-20 bg-card/20">
  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
    {/* Info Section */}
    <section className=" p-4 flex flex-col justify-center">
      <h1 className="text-4xl font-bold mb-8">Let's Start a Conversation</h1>
      <p className="text-foreground/70 mb-12 text-base">
        We are always excited to work on new projects and help businesses achieve their digital goals. Whether you need a simple website or a complex software solution, we're here to help.
      </p>
      <div className="mb-12 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <svg width="24" height="24" fill="none" stroke="currentColor" className="text-primary"><path d="M4 4h16v16H4V4zm8 8v4m0-4a4 4 0 1 0-4-4m4 4a4 4 0 1 1 4-4" /></svg>
        </div>
        <div>
          <div className="font-medium">Email</div>
          <a href="mailto:info@websolixs.com" className="text-primary underline">support@parishus.com</a>
        </div>
      </div>
      <div className="bg-card border border-border  p-4 mt-4 py-6 px-6">
        <h2 className="text-xl font-bold mb-1">Response Time</h2>
        <div className="text-foreground/70 text-base">
          We typically respond to all inquiries within 24 hours. For urgent projects, feel free to contact us via email.
        </div>
      </div>
    </section>

    {/* Contact Card */}
    <Card className="w-full shadow-lg border border-border flex flex-col justify-center">
      <CardContent className="p-10">
        <h2 className="text-4xl font-extrabold mb-4 text-center bg-gradient-primary bg-clip-text text-transparent">
          Get in Touch
        </h2>
        <p className="text-foreground/70 text-center mb-10 max-w-md mx-auto">
          Have questions, feedback, or just want to say hello? Fill out the
          form below and our team will get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label
              htmlFor="name"
              className="mb-2 block text-foreground font-medium"
            >
              Your Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="mb-2 block text-foreground font-medium"
            >
              Your Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label
              htmlFor="message"
              className="mb-2 block text-foreground font-medium"
            >
              Message
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="Type your message..."
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <Button type="submit" size="default" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <ParishLogo />
            </div>
            <p className="text-primary-foreground/80 text-center">
              © {new Date().getFullYear()} Parish
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
