import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ParishLogo from "@/components/ui/logo";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SocialLinks = () => {
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const handleEmailLogin = async (e) => {
    if (!linkedin && !instagram) {
      toast({
        title: "Social Media is Required",
        description: " Please Enter Instagram or Linkedin ",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        instagram_username: instagram,
        linkedin_username: linkedin,
      })
      .eq("id", profile.id);

      error
              ? toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                })
              : toast({
                  title: "Social Meida Accounts are updated",
                });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-gradient-card border-border shadow-card animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center">
            <div className="mb-6 ">
              <ParishLogo />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold font-playfair text-primary"
                style={{
                  fontSize: "60px",
                  color: "#9dc0b3",
                  fontFamily: "cooper",
                }}
              >
                ParishUs
              </h1>
            </div>
          </div>
          <div className="w-6" />
        </div>
        <h2 className="text-xl font-semibold">Share your socials</h2>
        <p className="text-muted-foreground">
          Add your LinkedIn or Instagram to make it easier to connect with
          others
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-4">
            {/* LinkedIn */}
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="Enter your LinkedIn username*"
                value={data.linkedin || ""}
                onChange={(e) => setLinkedin(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="flex-grow border-t border-primary"></div>
              <span className="text-primary font-semibold px-2">OR</span>
              <div className="flex-grow border-t border-primary"></div>
            </div>

            {/* Instagram */}
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="Enter your Instagram username*"
                value={data.instagram || ""}
                onChange={(e) => setInstagram(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
