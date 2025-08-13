import { supabase } from "@/integrations/supabase/client";

export const sendEventInvite = async ({
  to,
  subject,
  text,
}: {
  to: string[];
  subject: string;
  text: string;
}) => {
  const session = supabase.auth.getSession ? (await supabase.auth.getSession()).data.session : null;

  if (!session) {
    throw new Error("User session not found");
  }

  const { data, error } = await supabase.functions.invoke("send-event-invite", {
    body: { to, subject, text },
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};
