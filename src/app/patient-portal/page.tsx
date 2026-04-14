"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Calendar, FileText, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mrn: string;
}

export default function PatientPortalPage() {
  const [patient, setPatient] = React.useState<PatientData | null>(null);
  const [appointments, setAppointments] = React.useState<Array<{ id: string; type: string; provider: string; status: string }>>([]);
  const [labResults, setLabResults] = React.useState<Array<{ id: string; testName: string; resultValue: string | null; unit: string | null; status: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchPatientData();
  }, [router]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const overviewResponse = await fetch("/api/patient-portal/overview");

      if (!overviewResponse.ok) {
        throw new Error("Failed to fetch patient data");
      }

      const overview = await overviewResponse.json();
      setPatient(overview.patient);
      setAppointments(overview.appointments);
      setLabResults(overview.labResults);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      router.push("/patient-login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/patient-auth/logout", {
      method: "POST",
    });

    toast.success("Logged out successfully");
    router.push("/patient-login");
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Welcome, {patient.firstName}
            </h1>
            <p className="text-sm text-neutral-500">
              MRN: {patient.mrn || "N/A"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" /> Book Appointment
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" /> View Medical Records
              </Button>
              <Button variant="outline" className="justify-start">
                <MessageSquare className="w-4 h-4 mr-2" /> Message Provider
              </Button>
              <Button variant="outline" className="justify-start">
                <Heart className="w-4 h-4 mr-2" /> View Health Summary
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500">Name</p>
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium">{patient.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">MRN</p>
                <p className="font-medium">{patient.mrn || "N/A"}</p>
              </div>
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-neutral-500">Loading...</p>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border rounded p-3 hover:bg-neutral-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {apt.type || "General Checkup"}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {apt.provider || "Dr. TBD"}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                No upcoming appointments
              </p>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Lab Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lab Results</CardTitle>
            <CardDescription>Your test results</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-neutral-500">Loading...</p>
            ) : labResults.length > 0 ? (
              <div className="space-y-3">
                {labResults.map((lab) => (
                  <div
                    key={lab.id}
                    className="border rounded p-3 hover:bg-neutral-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{lab.testName}</p>
                        <p className="text-sm text-neutral-500">
                          {lab.resultValue} {lab.unit}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          lab.status === "abnormal"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">
                No lab results available
              </p>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Results
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
