import React from "react";
import { Sidebar } from "./sidebar";
import { Toaster } from "@/components/ui/sonner";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <h2 className="text-lg font-medium text-gray-800">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
