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

import { useMedical, Appointment } from "@/context/MedicalContext"

export default function AppointmentsPage() {
  const [open, setOpen] = React.useState(false)
  const { appointments, patients, addAppointment, updateAppointment } = useMedical()

  const handleBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    addAppointment({
      patientId: formData.get("patientId") as string,
      provider: formData.get("provider") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      type: formData.get("type") as string,
      duration: "30 min",
      status: "Scheduled"
    })
    
    setOpen(false)
    toast.success("Appointment booked successfully!")
  }

  const handleEdit = (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const rawStatus = formData.get("status") as string
    const statusMap: Record<string, Appointment["status"]> = {
        "scheduled": "Scheduled",
        "confirmed": "Confirmed",
        "waiting": "In Waiting Room",
        "pending": "Pending"
    }

    updateAppointment(id, {
        provider: formData.get("provider") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        status: statusMap[rawStatus] || "Pending"
    })
    
    toast.success("Appointment updated successfully!")
  }

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
                  <Label htmlFor="patientId">Patient</Label>
                  <Select name="patientId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select name="provider" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Jane Smith">Dr. Jane Smith</SelectItem>
                      <SelectItem value="Dr. Robert Chen">Dr. Robert Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" name="time" type="time" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="New Patient">New Patient</SelectItem>
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
                     {appointments.map((apt: Appointment) => {
                         const patient = patients.find(p => p.id === apt.patientId);
                         const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
                         return (
                         <tr key={apt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                             <td className="px-6 py-4">
                                <div className="font-medium">{apt.time}</div>
                                <div className="text-xs text-neutral-500 flex items-center mt-1">
                                    <Clock className="w-3 h-3 mr-1" /> {apt.duration}
                                </div>
                             </td>
                             <td className="px-6 py-4 font-medium">{patientName}</td>
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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto mr-3">Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <form onSubmit={(e) => {
                                            const form = e.target as HTMLFormElement;
                                            const closeBtn = form.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                            if (closeBtn) closeBtn.click();
                                            handleEdit(apt.id, e);
                                        }}>
                                            <DialogHeader>
                                                <DialogTitle>Edit Appointment</DialogTitle>
                                                <DialogDescription>
                                                Update details for {patientName}&apos;s appointment.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`provider-${apt.id}`}>Provider</Label>
                                                    <Select name="provider" defaultValue={apt.provider}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a provider" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Dr. Jane Smith">Dr. Jane Smith</SelectItem>
                                                            <SelectItem value="Dr. Robert Chen">Dr. Robert Chen</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`date-${apt.id}`}>Date</Label>
                                                        <Input id={`date-${apt.id}`} name="date" type="date" defaultValue={apt.date} required />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`time-${apt.id}`}>Time</Label>
                                                        <Input id={`time-${apt.id}`} name="time" type="time" defaultValue={apt.time.includes("AM") ? apt.time.replace(" AM", "") : apt.time.replace(" PM", "")} required />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`status-${apt.id}`}>Status</Label>
                                                    <Select name="status" defaultValue={
                                                        apt.status === "Confirmed" ? "confirmed" : 
                                                        apt.status === "In Waiting Room" ? "waiting" : 
                                                        apt.status === "Scheduled" ? "scheduled" : "pending"}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Appointment status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="waiting">In Waiting Room</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                {/* Hidden close button to trigger close on submit */}
                                                <Button type="button" data-dialog-close variant="outline" className="hidden">Cancel</Button>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline">Cancel</Button>
                                                </DialogTrigger>
                                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="link" className="text-neutral-400 hover:text-red-600 p-0 h-auto" onClick={() => toast.success("Appointment cancelled!")}>Cancel</Button>
                             </td>
                         </tr>
                     )})}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  )
}

