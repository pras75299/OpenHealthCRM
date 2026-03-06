"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Activity,
  Clock,
  Bell,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useMedical, Patient } from "@/context/MedicalContext";
import { PatientProfileSheet } from "@/components/patients/patient-profile-sheet";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { patients, appointments, refetchPatients } = useMedical();

  const today = new Date().toISOString().split("T")[0];
  const cancelledStatus = (s: string) =>
    s?.toLowerCase() === "cancelled";

  const appointmentsToday = appointments.filter(
    (a) =>
      a.date === today && !cancelledStatus(a.status)
  );
  const activeEncounters = appointments.filter(
    (a) =>
      a.status?.toLowerCase() === "in waiting room" ||
      a.status?.toLowerCase() === "confirmed"
  ).length;

  const getAptTime = (a: { startTime?: string; date: string; time: string }) =>
    a.startTime ? new Date(a.startTime).getTime() : new Date(`${a.date}T${a.time}`).getTime();

  const upcomingAppointments = appointments
    .filter((a) => {
      if (cancelledStatus(a.status)) return false;
      return getAptTime(a) >= Date.now();
    })
    .sort((a, b) => getAptTime(a) - getAptTime(b))
    .slice(0, 5);

  const stats = [
    {
      name: "Total Patients",
      value: patients.length.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "indigo",
    },
    {
      name: "Appointments Today",
      value: appointmentsToday.length.toString(),
      change: "+4%",
      icon: Calendar,
      color: "emerald",
    },
    {
      name: "Active Encounters",
      value: activeEncounters.toString(),
      change: "+2%",
      icon: Activity,
      color: "violet",
    },
    {
      name: "Avg Wait Time",
      value: "14 min",
      change: "-2%",
      icon: Clock,
      color: "amber",
    },
  ];

  const activityItems = React.useMemo(() => {
    const items: Array<{
      icon: typeof Users;
      title: string;
      desc: string;
      time: string;
      color: "emerald" | "indigo" | "violet" | "amber" | "red";
    }> = [];

    patients.slice(0, 3).forEach((p, i) => {
      items.push({
        icon: Users,
        title: "New patient registered",
        desc: `${p.firstName} ${p.lastName}`,
        time: i === 0 ? "2 min ago" : i === 1 ? "15 min ago" : "1 hour ago",
        color: "indigo",
      });
    });

    appointments.slice(0, 2).forEach((a, i) => {
      const patient = patients.find((p) => p.id === a.patientId);
      const name = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";
      items.push({
        icon: Calendar,
        title: "Appointment scheduled",
        desc: `${name} · ${a.date} ${a.time}`,
        time: i === 0 ? "5 min ago" : "30 min ago",
        color: "emerald",
      });
    });

    items.push(
      {
        icon: Activity,
        title: "System update",
        desc: "Scheduled backup completed",
        time: "1 hour ago",
        color: "amber",
      },
      {
        icon: Bell,
        title: "Care campaign",
        desc: "Follow-up reminders sent",
        time: "2 hours ago",
        color: "violet",
      }
    );

    return items.slice(0, 6);
  }, [patients, appointments]);

  const quickStats = [
    { label: "Patient Retention", value: "92%", pct: 92, color: "indigo" },
    { label: "No-Show Rate", value: "4.2%", pct: 4.2, color: "amber" },
    { label: "Visit Frequency", value: "8.7/mo", pct: 87, color: "emerald" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const colorMap = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    violet:
      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };

  return (
    <motion.div
      className="flex flex-col gap-8 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Welcome back. Here is your practice overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            variants={itemVariants}
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-[5px] p-6 border transition-all duration-300 group",
              "border-neutral-200/50 dark:border-neutral-800/50",
              "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl",
              "shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[5px]",
                stat.color === "indigo" && "bg-linear-to-br from-indigo-50/60 to-transparent dark:from-indigo-950/30",
                stat.color === "emerald" && "bg-linear-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/30",
                stat.color === "violet" && "bg-linear-to-br from-violet-50/60 to-transparent dark:from-violet-950/30",
                stat.color === "amber" && "bg-linear-to-br from-amber-50/60 to-transparent dark:from-amber-950/30"
              )}
            />
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-bold mt-2 text-neutral-900 dark:text-neutral-50 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-3 rounded-[5px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  colorMap[stat.color as keyof typeof colorMap]
                )}
              >
                <stat.icon className="w-5 h-5" strokeWidth={2} aria-hidden />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <span
                className={cn(
                  "font-medium px-2 py-0.5 rounded-[5px]",
                  stat.change.startsWith("+")
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                )}
              >
                {stat.change}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                from last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <motion.div
            variants={itemVariants}
            className="rounded-[5px] border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Recent Activity
              </h2>
              <Button
                variant="link"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto font-medium text-sm"
                asChild
              >
                <a href="#">View all</a>
              </Button>
            </div>
            <div className="space-y-1">
              {activityItems.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-[5px] hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors cursor-default"
                >
                  <div
                    className={cn(
                      "p-2 rounded-[5px] shrink-0",
                      colorMap[activity.color]
                    )}
                  >
                    <activity.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {activity.desc}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats & Upcoming */}
        <div className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="rounded-[5px] border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              {quickStats.map((qs, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {qs.label}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {qs.value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(qs.pct, 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        qs.color === "indigo" && "bg-indigo-500",
                        qs.color === "amber" && "bg-amber-500",
                        qs.color === "emerald" && "bg-emerald-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-[5px] border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4">
              Upcoming Appointments
            </h2>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No upcoming appointments.
                </p>
              ) : (
                upcomingAppointments.map((apt) => {
                  const patient = patients.find((p) => p.id === apt.patientId);
                  const name = patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "—";
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-[5px] hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {name}
                        </span>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {apt.date} · {apt.time} · {apt.type}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-[5px] shrink-0 capitalize",
                          apt.status?.toLowerCase() === "confirmed" &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                          (apt.status?.toLowerCase() === "scheduled" ||
                            apt.status?.toLowerCase() === "in waiting room") &&
                            "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
                          apt.status?.toLowerCase() === "pending" &&
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                          !apt.status && "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        )}
                      >
                        {apt.status || "—"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Patients */}
      <motion.div
        variants={itemVariants}
        className="rounded-[5px] border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center bg-white/40 dark:bg-neutral-950/40">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Recent Patients
          </h2>
          <AddPatientDialog onSuccess={refetchPatients} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50/50 dark:bg-neutral-800/30 text-neutral-500 dark:text-neutral-400 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">ID / MRN</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50 text-neutral-800 dark:text-neutral-200">
              {patients.slice(0, 5).map((patient: Patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                    {patient.mrn}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-[5px] text-xs font-semibold tracking-wide border border-emerald-200/50 dark:border-emerald-800/50">
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="link"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:no-underline p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform"
                        >
                          View Profile{" "}
                          <span
                            aria-hidden
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            →
                          </span>
                        </Button>
                      </SheetTrigger>
                      <PatientProfileSheet patient={patient} />
                    </Sheet>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
