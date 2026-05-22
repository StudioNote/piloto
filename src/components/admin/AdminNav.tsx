"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Cockpit",    href: "/admin/cockpit",    activeText: "text-slate-800",   activeBorder: "border-slate-700" },
  { label: "Agenda",    href: "/admin/agenda",     activeText: "text-rose-600",    activeBorder: "border-rose-600"  },
  { label: "SOS Ordi",  href: "/admin/sos-ordi",   activeText: "text-blue-600",    activeBorder: "border-blue-500"  },
  { label: "Radio",     href: "/admin/radio",       activeText: "text-emerald-600", activeBorder: "border-emerald-500" },
  { label: "Voix-Off",  href: "/admin/voix-off",   activeText: "text-violet-600",  activeBorder: "border-violet-500" },
  { label: "Builder",   href: "/admin/builder",     activeText: "text-amber-600",   activeBorder: "border-amber-500" },
  { label: "Modèles",   href: "/admin/modeles",     activeText: "text-teal-600",    activeBorder: "border-teal-500"  },
  { label: "Paramètres",href: "/admin/parametres",  activeText: "text-slate-600",   activeBorder: "border-slate-400" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch gap-0.5">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? `${item.activeText} ${item.activeBorder} font-semibold`
                : "text-gray-500 border-transparent hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
