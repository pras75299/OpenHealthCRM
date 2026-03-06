"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  ClipboardList,
  Activity,
  Settings,
  MessageSquare,
  DollarSign,
  Package,
  BarChart3,
  Shield,
  Stethoscope,
} from "lucide-react";

const routes = [
  { label: "Dashboard", icon: Activity, href: "/" },
  { label: "Patients", icon: Users, href: "/patients" },
  { label: "Appointments", icon: Calendar, href: "/appointments" },
  { label: "Encounters", icon: ClipboardList, href: "/encounters" },
  { label: "Billing", icon: DollarSign, href: "/billing" },
  { label: "Inventory", icon: Package, href: "/inventory" },
  { label: "Communications", icon: MessageSquare, href: "/communications" },
  { label: "Tasks", icon: Stethoscope, href: "/tasks" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Audit Log", icon: Shield, href: "/audit" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-neutral-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-neutral-800 px-6">
        <h1 className="text-xl font-bold tracking-tight">Healthcare CRM</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col space-y-1 px-3">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center rounded-[5px] px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <route.icon className="mr-3 h-5 w-5 shrink-0" />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
