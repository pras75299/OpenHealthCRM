"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, Calendar, Activity, Clock } from "lucide-react"
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

import { useMedical, Patient } from "@/context/MedicalContext"
import { PatientProfileSheet } from "@/components/patients/patient-profile-sheet"
import { AddPatientDialog } from "@/components/patients/add-patient-dialog"

export default function DashboardPage() {
  const { patients, refetchPatients } = useMedical()

  const stats = [
    { name: "Total Patients", value: "2,400", change: "+12%", icon: Users },
    { name: "Appointments Today", value: "32", change: "+4%", icon: Calendar },
    { name: "Active Encounters", value: "12", change: "+2%", icon: Activity },
    { name: "Avg Wait Time", value: "14 min", change: "-2%", icon: Clock },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      className="flex flex-col gap-8 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            variants={itemVariants}
            key={idx} 
            className="relative overflow-hidden bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[5px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{stat.name}</p>
                <h3 className="text-3xl font-bold mt-2 text-neutral-900 dark:text-neutral-50 tracking-tight">{stat.value}</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-[5px] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="relative mt-4 flex items-center text-sm">
              <span className={`font-medium px-2 py-0.5 rounded-[5px] ${stat.change.startsWith("+") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
                {stat.change}
              </span>
              <span className="text-neutral-500 ml-2">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Patient List Section */}
      <motion.div variants={itemVariants} className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-[5px] shadow-sm flex-1 overflow-hidden">
        <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center bg-white/40 dark:bg-neutral-950/40">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Recent Patients</h2>
          
          <AddPatientDialog onSuccess={refetchPatients} />

        </div>
        
        <div className="p-0 overflow-x-auto">
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
                <tr key={patient.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-4 font-medium">{patient.firstName} {patient.lastName}</td>
                  <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{patient.mrn}</td>
                  <td className="px-6 py-4">{new Date(patient.lastVisit).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-[5px] text-xs font-semibold tracking-wide border border-emerald-200/50 dark:border-emerald-800/50">
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="link" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:no-underline p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform">
                          View Profile <span aria-hidden="true" className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
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
  )
}

