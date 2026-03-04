"use client"

import * as React from "react"
import { Users, Plus } from "lucide-react"
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
import { toast } from "sonner"

export default function PatientsPage() {
  const [open, setOpen] = React.useState(false)

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast.success("Patient added successfully!")
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">Patients</h2>
          <p className="text-sm text-neutral-500">Manage your clinic's patients, medical histories, and health records.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddPatient}>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter the patient's basic information to register them in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input id="firstName" placeholder="Jane" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input id="lastName" placeholder="Doe" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    DOB
                  </Label>
                  <Input id="dob" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Patient</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-neutral-900 border rounded-xl flex-1 shadow-sm">
         <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <Input 
                type="search" 
                placeholder="Search MRN, Name, or Phone..."
                className="w-full sm:max-w-sm"
             />
             <div className="flex gap-2">
                 <Button variant="outline" size="sm">Filter</Button>
                 <Button variant="outline" size="sm">Export</Button>
             </div>
         </div>
         <div className="p-0 overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-medium">
                     <tr>
                         <th className="px-6 py-4 border-b">Patient</th>
                         <th className="px-6 py-4 border-b">MRN</th>
                         <th className="px-6 py-4 border-b">Status</th>
                         <th className="px-6 py-4 border-b">Contact</th>
                         <th className="px-6 py-4 border-b hidden md:table-cell">Reg. Date</th>
                         <th className="px-6 py-4 border-b">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y text-neutral-800 dark:text-neutral-200">
                     {[1, 2, 3, 4, 5, 6].map((i) => (
                         <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex justify-center items-center text-xs">SM</div>
                                   <div>
                                     <p className="font-medium">Sarah Miller</p>
                                     <p className="text-xs text-neutral-500">32F • DOB: 05/12/1994</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 font-mono text-xs text-neutral-500">PT-8942{i}</td>
                             <td className="px-6 py-4">
                                 <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                                     Active
                                 </span>
                             </td>
                             <td className="px-6 py-4">
                               <p className="text-xs">+1 (555) 123-4567</p>
                               <p className="text-xs text-neutral-500">sarah.m@example.com</p>
                             </td>
                             <td className="px-6 py-4 text-neutral-500 hidden md:table-cell">Jan 12, 2026</td>
                             <td className="px-6 py-4">
                                 <Button variant="link" className="text-indigo-600 hover:text-indigo-700 p-0 h-auto">Manage</Button>
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
