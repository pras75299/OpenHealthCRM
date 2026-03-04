import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, Settings, Activity } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-white dark:bg-neutral-950 flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          <Activity className="w-6 h-6 mr-2 text-indigo-600" />
          HealthCRM
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <LayoutDashboard className="w-4 h-4"/> Dashboard
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Users className="w-4 h-4"/> Patients
          </Link>
          <Link href="/appointments" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Calendar className="w-4 h-4"/> Appointments
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Settings className="w-4 h-4"/> Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center text-sm font-bold">
                DR
             </div>
             <div className="text-sm dark:text-neutral-300">
               <p className="font-medium">Dr. Jane Smith</p>
               <p className="text-xs text-neutral-500">Admin Mode</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-neutral-950 shrink-0 lg:hidden">
            <div className="flex items-center text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              <Activity className="w-6 h-6 mr-2 text-indigo-600" />
              HealthCRM
            </div>
        </header>
        <div className="p-6 md:p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}
