"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PatientLoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    mrn: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.mrn || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/patient-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      await response.json();

      toast.success("Login successful!");
      router.push("/patient-portal");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Patient Portal</CardTitle>
          <CardDescription>
            Sign in to access your medical records and appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="gap-2 flex flex-col">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
              <Input
                id="mrn"
                placeholder="Your MRN"
                value={formData.mrn}
                onChange={(e) =>
                  setFormData({ ...formData, mrn: e.target.value })
                }
                required
              />
            </div>

            <div className="gap-2 flex flex-col">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-xs text-neutral-500 text-center">
              Don&apos;t have an account? Contact your healthcare provider to
              register.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
