"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  DollarSign,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  Activity,
  Bell,
  Settings,
  HelpCircle,
  User,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Patients", href: "/patients" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  { icon: ClipboardList, label: "Encounters", href: "/encounters" },
  { icon: DollarSign, label: "Billing", href: "/billing" },
];

const accountItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/help" },
];

interface DashboardWithCollapsibleSidebarProps {
  children: React.ReactNode;
}

export function DashboardWithCollapsibleSidebar({ children }: DashboardWithCollapsibleSidebarProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <CollapsibleSidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function CollapsibleSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <nav
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out hidden md:flex flex-col",
        open ? "w-64" : "w-16",
        "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-sm"
      )}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} open={open} />
        ))}
      </div>

      {open && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-1 shrink-0">
          <div className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Account
          </div>
          {accountItems.map((item) => (
            <NavLink key={item.href} item={item} open={open} />
          ))}
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
}

function NavLink({
  item,
  open,
}: {
  item: { icon: React.ElementType; label: string; href: string };
  open: boolean;
}) {
  const pathname = usePathname();
  const isSelected =
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex h-11 w-full items-center rounded-[5px] transition-all duration-200",
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm border-l-2 border-indigo-500"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200"
      )}
    >
      <div className="grid h-full w-12 shrink-0 place-content-center">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      {open && (
        <span className="text-sm font-medium transition-opacity duration-200 truncate">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function TitleSection({ open }: { open: boolean }) {
  return (
    <div className="mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4 shrink-0">
      <Link
        href="/"
        className="flex cursor-pointer items-center justify-between rounded-[5px] p-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          {open && (
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                HealthCRM
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                Healthcare
              </span>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500 shrink-0" aria-hidden />
        )}
      </Link>
    </div>
  );
}

function Logo() {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-[5px] bg-linear-to-br from-indigo-500 to-indigo-600 shadow-sm">
      <Activity className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
    </div>
  );
}

function ToggleClose({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpen(!open)}
      className="w-full justify-start rounded-[5px] border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      <div className="grid size-10 shrink-0 place-content-center">
        <ChevronsRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 text-neutral-500 dark:text-neutral-400",
            open ? "rotate-180" : ""
          )}
          aria-hidden
        />
      </div>
      {open && (
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 ml-2">
          Collapse
        </span>
      )}
    </Button>
  );
}

function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shrink-0">
      <div className="md:hidden flex items-center gap-2">
        <Activity className="h-6 w-6 text-indigo-600" aria-hidden />
        <span className="font-bold text-neutral-900 dark:text-neutral-100">HealthCRM</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-[5px] h-9 w-9"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full" aria-hidden />
        </Button>
        {mounted ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-[5px] h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden />
            ) : (
              <Moon className="h-4 w-4" aria-hidden />
            )}
          </Button>
        ) : (
          <div
            className="h-9 w-9 shrink-0 rounded-[5px] flex items-center justify-center"
            aria-hidden
          >
            <Moon className="h-4 w-4 text-neutral-500" aria-hidden />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-[5px] h-9 w-9">
              <User className="h-5 w-5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default DashboardWithCollapsibleSidebar;
