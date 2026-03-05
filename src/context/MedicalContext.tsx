"use client"

import * as React from "react"

export type Patient = {
  id: string
  firstName: string
  lastName: string
  dob: string
  phone: string
  email: string
  address: string
  mrn: string
  status: "Active" | "Inactive" | "Archived"
  lastVisit: string
  regDate: string
  gender: string
  bloodType: string
  allergies: string
  primaryCare: string
}

export type Appointment = {
  id: string
  patientId: string
  provider: string
  date: string
  time: string
  duration: string
  type: string
  status: "Confirmed" | "In Waiting Room" | "Scheduled" | "Pending"
}

type MedicalContextType = {
  patients: Patient[]
  addPatient: (patient: Omit<Patient, "id" | "mrn" | "regDate">) => void
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, "id">) => void
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void
}

const MedicalContext = React.createContext<MedicalContextType | undefined>(undefined)

const initialPatients: Patient[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Miller",
    dob: "1994-05-12",
    phone: "+1 (555) 123-4567",
    email: "sarah.m@example.com",
    address: "456 Elm St, Cityville",
    mrn: "PT-89421",
    status: "Active",
    lastVisit: "2026-10-24",
    regDate: "2026-01-12",
    gender: "Female",
    bloodType: "A-",
    allergies: "Latex, Sulfa",
    primaryCare: "Dr. Jane Smith",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Doe",
    dob: "1994-01-01",
    phone: "+1 (555) 000-0000",
    email: "jane.doe@example.com",
    address: "123 Maple St, Anytown",
    mrn: "PT-89422",
    status: "Active",
    lastVisit: "2026-10-24",
    regDate: "2026-02-15",
    gender: "Female",
    bloodType: "O+",
    allergies: "Penicillin, Peanuts",
    primaryCare: "Dr. Jane Smith",
  },
  {
    id: "3",
    firstName: "John",
    lastName: "Davis",
    dob: "1980-08-20",
    phone: "+1 (555) 987-6543",
    email: "john.d@example.com",
    address: "789 Pine Ave, Townsville",
    mrn: "PT-89423",
    status: "Active",
    lastVisit: "2026-09-15",
    regDate: "2025-11-05",
    gender: "Male",
    bloodType: "B+",
    allergies: "None",
    primaryCare: "Dr. Robert Chen",
  },
]

const initialAppointments: Appointment[] = [
  { id: "1", patientId: "1", time: "09:00", date: "2026-10-24", duration: "30 min", type: "Follow-up", provider: "dr_smith", status: "Confirmed" },
  { id: "2", patientId: "3", time: "10:00", date: "2026-10-24", duration: "60 min", type: "New Patient", provider: "dr_smith", status: "In Waiting Room" },
  { id: "3", patientId: "2", time: "11:30", date: "2026-10-24", duration: "30 min", type: "Lab Results", provider: "dr_chen", status: "Scheduled" },
]

export function MedicalProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = React.useState<Patient[]>(initialPatients)
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointments)

  const addPatient = (patientData: Omit<Patient, "id" | "mrn" | "regDate" | "lastVisit"> & Partial<Patient>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substr(2, 9),
      mrn: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      regDate: new Date().toISOString().split("T")[0],
      lastVisit: patientData.lastVisit || new Date().toISOString().split("T")[0],
      email: patientData.email || "",
      address: patientData.address || "",
      dob: patientData.dob || "",
      gender: patientData.gender || "Unknown",
      bloodType: patientData.bloodType || "Unknown",
      allergies: patientData.allergies || "None",
      primaryCare: patientData.primaryCare || "Unassigned"
    } as Patient
    
    setPatients((prev) => [newPatient, ...prev])
  }

  const addAppointment = (appointmentData: Omit<Appointment, "id">) => {
    const newApt: Appointment = {
      ...appointmentData,
      id: Math.random().toString(36).substr(2, 9),
    }
    setAppointments((prev) => [...prev, newApt])
  }

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt))
  }

  return (
    <MedicalContext.Provider value={{ patients, addPatient, appointments, addAppointment, updateAppointment }}>
      {children}
    </MedicalContext.Provider>
  )
}

export function useMedical() {
  const context = React.useContext(MedicalContext)
  if (context === undefined) {
    throw new Error("useMedical must be used within a MedicalProvider")
  }
  return context
}
