"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sms: MessageCircle,
  email: Mail,
  whatsapp: Send,
};

export default function CommunicationsPage() {
  const [comms, setComms] = React.useState<Array<{
    id: string;
    channel: string;
    type: string;
    status: string;
    content: string;
    sentAt: string | null;
    patient?: { firstName: string; lastName: string };
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/communications")
      .then((r) => r.json())
      .then((data) => { setComms(Array.isArray(data) ? data : []); })
      .catch(() => setComms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-8 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Communications & Engagement</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Send Message</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Communication Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading...</div>
          ) : comms.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 border rounded-[5px]">
              No communications yet. SMS, email, and WhatsApp interactions will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {comms.map((c) => {
                const Icon = channelIcons[c.channel] ?? MessageSquare;
                return (
                  <div
                    key={c.id}
                    className="flex gap-4 p-4 border rounded-[5px] hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                  >
                    <div className="w-10 h-10 rounded-[5px] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : "Unknown"}
                        </span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-500 capitalize">{c.channel}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded-[5px] text-xs ${
                          c.status === "sent" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-neutral-100"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 truncate">{c.content}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {c.sentAt ? new Date(c.sentAt).toLocaleString() : new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
