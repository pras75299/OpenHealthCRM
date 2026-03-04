import Link from "next/link";
import { Users, Calendar, ClipboardList, Activity, Settings, MessageSquare } from "lucide-react";

export function Sidebar() {
  const routes = [
    { label: "Dashboard", icon: Activity, href: "/" },
    { label: "Patients", icon: Users, href: "/patients" },
    { label: "Appointments", icon: Calendar, href: "/appointments" },
    { label: "Encounters", icon: ClipboardList, href: "/encounters" },
    { label: "Tasks", icon: MessageSquare, href: "/tasks" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold">HealthCare MVP</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col space-y-1 px-3">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white"
            >
              <route.icon className="mr-3 h-5 w-5 text-gray-400" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
