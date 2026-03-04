import * as React from "react"
import { Users, Calendar, Activity, Clock } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { name: "Total Patients", value: "2,400", change: "+12%", icon: Users },
    { name: "Appointments Today", value: "32", change: "+4%", icon: Calendar },
    { name: "Active Encounters", value: "12", change: "+2%", icon: Activity },
    { name: "Avg Wait Time", value: "14 min", change: "-2%", icon: Clock },
  ]

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-neutral-900 border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-neutral-500 text-sm font-medium">{stat.name}</p>
                <h3 className="text-2xl font-bold mt-2 text-neutral-900 dark:text-neutral-50">{stat.value}</h3>
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <stat.icon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-emerald-600"}`}>
                {stat.change}
              </span>
              <span className="text-neutral-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Patient List Section */}
      <div className="bg-white dark:bg-neutral-900 border rounded-xl shadow-sm flex-1">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Recent Patients</h2>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            Add Patient
          </button>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">ID / MRN</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-neutral-800 dark:text-neutral-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                  <td className="px-6 py-4 font-medium">Jane Doe</td>
                  <td className="px-6 py-4 text-neutral-500">MRN-7890{item}</td>
                  <td className="px-6 py-4">Oct 24, 2026</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline">View Profile</button>
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
