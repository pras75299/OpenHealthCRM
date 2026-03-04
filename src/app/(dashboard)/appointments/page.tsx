"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function AppointmentsPage() {
  const [open, setOpen] = React.useState(false)

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast.success("Appointment booked successfully!")
  }

  const appointments = [
    { id: 1, patient: "Sarah Miller", time: "09:00 AM", duration: "30 min", type: "Follow-up", provider: "Dr. Jane Smith", status: "Confirmed" },
    { id: 2, patient: "John Davis", time: "10:00 AM", duration: "60 min", type: "New Patient", provider: "Dr. Jane Smith", status: "In Waiting Room" },
    { id: 3, patient: "Maria Garcia", time: "11:30 AM", duration: "30 min", type: "Lab Results", provider: "Dr. Robert Chen", status: "Scheduled" },
    { id: 4, patient: "James Wilson", time: "01:00 PM", duration: "45 min", type: "Consultation", provider: "Dr. Jane Smith", status: "Pending" },
  ]

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">Appointments</h2>
          <p className="text-sm text-neutral-500">Manage schedules, book appointments, and view daily calendars.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleBook}>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment for a patient.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah_miller">Sarah Miller</SelectItem>
                      <SelectItem value="john_davis">John Davis</SelectItem>
                      <SelectItem value="maria_garcia">Maria Garcia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr_smith">Dr. Jane Smith</SelectItem>
                      <SelectItem value="dr_chen">Dr. Robert Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="new_patient">New Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Book</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-neutral-900 border rounded-xl flex-1 shadow-sm flex flex-col pt-2">
         <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-lg font-medium">
               <CalendarIcon className="w-5 h-5 text-neutral-500" />
               Today, Oct 24
             </div>
             <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="flex items-center">
                     <Filter className="w-4 h-4 mr-2" />
                     All Providers
                 </Button>
                 <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 flex">
                     <button className="px-3 py-1 rounded-md bg-white dark:bg-neutral-700 shadow-sm text-sm font-medium">List</button>
                     <button className="px-3 py-1 rounded-md text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm font-medium">Calendar</button>
                 </div>
             </div>
         </div>
         
         <div className="p-0 overflow-x-auto flex-1">
             <table className="w-full text-sm text-left">
                 <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-medium">
                     <tr>
                         <th className="px-6 py-4 border-b">Time</th>
                         <th className="px-6 py-4 border-b">Patient</th>
                         <th className="px-6 py-4 border-b">Type</th>
                         <th className="px-6 py-4 border-b hidden md:table-cell">Provider</th>
                         <th className="px-6 py-4 border-b">Status</th>
                         <th className="px-6 py-4 border-b">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y text-neutral-800 dark:text-neutral-200">
                     {appointments.map((apt) => (
                         <tr key={apt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                             <td className="px-6 py-4">
                                <div className="font-medium">{apt.time}</div>
                                <div className="text-xs text-neutral-500 flex items-center mt-1">
                                    <Clock className="w-3 h-3 mr-1" /> {apt.duration}
                                </div>
                             </td>
                             <td className="px-6 py-4 font-medium">{apt.patient}</td>
                             <td className="px-6 py-4">{apt.type}</td>
                             <td className="px-6 py-4 hidden md:table-cell text-neutral-500">{apt.provider}</td>
                             <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    apt.status === "Confirmed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                    apt.status === "In Waiting Room" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                    apt.status === "Scheduled" ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" :
                                    "bg-neutral-100 text-neutral-500"
                               }`}>
                                    {apt.status}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                                 <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto mr-3">Edit</Button>
                                 <Button variant="link" className="text-neutral-400 hover:text-red-600 p-0 h-auto">Cancel</Button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  )
}
