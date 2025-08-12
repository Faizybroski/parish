// EmailInviteModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const EmailInviteModal = ({ open, onClose, onInviteResolved, getInviteEmails }) => {
  const [emails, setEmails] = useState([""])
  const [errors, setErrors] = useState([])
  const [sending, setSending] = useState(false)

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails]
    updated[index] = value
    setEmails(updated)
  }

    const addEmailField = () => {
    if (emails[emails.length - 1].trim() === "") return;
    setEmails([...emails, ""]);
  };

    const removeEmailField = (index: number) => {
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated.length ? updated : [""]); 
  };

const handleSubmit = async () => {
    setSending(true)
    // setErrors([])
    // console.log("emails====>",emails);
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email")
      .in("email", emails)

    if (error) {
      console.error("Error fetching profiles:", error)
      setSending(false)
      return
    }
    // const foundEmails = users.map(u => u.email)
    // const notFound = emails.filter(email => !foundEmails.includes(email))

    // if (notFound.length > 0) {
    //   setErrors(notFound)
    //   setSending(false)
    //   return
    // }
    const guestIds = users.map(u => u.id)
    onInviteResolved(guestIds) 
    
    // Getting all emails to send invites
    getInviteEmails(emails);
    setSending(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Guests</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {emails.map((email, idx) => (
            <div key={idx} className="flex space-x-2 items-center">
              <Input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(idx, e.target.value)}
                placeholder="Enter guest email"
              />
              {idx === emails.length - 1 && (
                <Button onClick={addEmailField} variant="ghost">
                  ➕
                </Button>
              )}
              {emails.length > 1 && (
                <Button
                  onClick={() => removeEmailField(idx)}
                  variant="ghost"
                  className="text-red-500"
                >
                  ❌
                </Button>
              )}
            </div>
          ))}

          {errors.length > 0 && (
            <div className="text-red-500 text-sm">
              These emails are not signed up: {errors.join(", ")}
            </div>
          )}

          <Button disabled={sending} onClick={handleSubmit}>
            {sending ? "Sending..." : "Send Invitations"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
