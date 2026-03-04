import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks & Follow-ups</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-8 text-center text-sm text-muted-foreground">
              No pending tasks.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
