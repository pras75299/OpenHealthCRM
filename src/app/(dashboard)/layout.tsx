import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, Settings, Activity } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MedicalProvider } from "@/context/MedicalContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MedicalProvider>
      <div className="flex min-h-screen bg-neutral-50/50 dark:bg-neutral-900/50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl flex-col hidden md:flex shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 transition-all">
        <div className="h-16 flex items-center px-6 border-b text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          <Activity className="w-6 h-6 mr-2 text-indigo-600" />
          HealthCRM
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <LayoutDashboard className="w-4 h-4"/> Dashboard
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Users className="w-4 h-4"/> Patients
          </Link>
          <Link href="/appointments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Calendar className="w-4 h-4"/> Appointments
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Settings className="w-4 h-4"/> Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center gap-3 w-full hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 p-2 rounded-lg transition-all text-left group">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex justify-center items-center text-sm font-bold shrink-0 transition-colors">
                    DR
                 </div>
                 <div className="text-sm dark:text-neutral-300 flex-1 overflow-hidden">
                   <p className="font-medium truncate">Dr. Jane Smith</p>
                   <p className="text-xs text-neutral-500 truncate">Admin Mode</p>
                 </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Customize</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between px-6 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl shrink-0 lg:hidden z-10 shadow-sm">
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
    </MedicalProvider>
  )
}
