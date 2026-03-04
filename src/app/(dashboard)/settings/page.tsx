"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">Settings</h2>
          <p className="text-sm text-neutral-500">Manage clinic preferences, billing structures, and practitioner records.</p>
        </div>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
         <div className="w-full md:w-64 border-r bg-neutral-50/50 dark:bg-neutral-950 p-4">
             <nav className="flex flex-col gap-1">
                <button className="text-left px-3 py-2 bg-white dark:bg-neutral-800 shadow-sm border rounded-md text-sm font-medium text-indigo-600">General</button>
                <button className="text-left px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">Billing & Invoices</button>
                <button className="text-left px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">Team Members</button>
                <button className="text-left px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800">Notifications</button>
             </nav>
         </div>
         <div className="p-6 flex-1 flex flex-col gap-6">
             <div>
                <h3 className="text-lg font-medium border-b dark:border-neutral-800 pb-2 mb-4">Clinic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="clinicName">Clinic Name</Label>
                        <Input id="clinicName" defaultValue="HealthFirst Associates" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="regNumber">Registration Number</Label>
                        <Input id="regNumber" defaultValue="CLI-98234-XYZ" />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue="123 Medical Parkway, Suite 100, Cityville, ST 12345" />
                    </div>
                </div>
             </div>

             <div>
                <h3 className="text-lg font-medium border-b dark:border-neutral-800 pb-2 mb-4">Appointment Preferences</h3>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-sm">Require Patient Confirmation</p>
                        <p className="text-xs text-neutral-500">Send an SMS 24 hours prior requesting confirmation</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                </div>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-sm">Allow Online Booking</p>
                        <p className="text-xs text-neutral-500">Let patients schedule their own encounters</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                </div>
             </div>
         </div>
      </div>
    </div>
  )
}
