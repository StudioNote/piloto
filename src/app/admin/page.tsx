import Link from "next/link";
import { Mic, Hammer, TrendingUp, FileText, Settings, Radio, Calendar, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModuleItem {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon | null;
  dot: string;
  iconHover: string;
  textHover: string;
  borderHover: string;
}

const modules: ModuleItem[] = [
  {
    href: "/admin/cockpit",
    label: "Cockpit",
    desc: "CA multi-activités en temps réel",
    icon: TrendingUp,
    dot: "bg-slate-700",
    iconHover: "group-hover:text-slate-700",
    textHover: "group-hover:text-slate-800",
    borderHover: "hover:border-slate-200",
  },
  {
    href: "/admin/agenda",
    label: "Agenda",
    desc: "Rendez-vous et synchro Calendrier",
    icon: Calendar,
    dot: "bg-rose-600",
    iconHover: "group-hover:text-rose-600",
    textHover: "group-hover:text-rose-700",
    borderHover: "hover:border-rose-200",
  },
  {
    href: "/admin/sos-ordi",
    label: "SOS Ordi",
    desc: "Clients & interventions",
    icon: null,
    dot: "bg-blue-500",
    iconHover: "",
    textHover: "group-hover:text-blue-600",
    borderHover: "hover:border-blue-200",
  },
  {
    href: "/admin/radio",
    label: "Radio",
    desc: "Radios & facturation mensuelle",
    icon: Radio,
    dot: "bg-emerald-500",
    iconHover: "group-hover:text-emerald-600",
    textHover: "group-hover:text-emerald-600",
    borderHover: "hover:border-emerald-200",
  },
  {
    href: "/admin/voix-off",
    label: "Voix-Off",
    desc: "Prestations de voix-off",
    icon: Mic,
    dot: "bg-violet-500",
    iconHover: "group-hover:text-violet-500",
    textHover: "group-hover:text-violet-600",
    borderHover: "hover:border-violet-200",
  },
  {
    href: "/admin/prospects",
    label: "Prospects",
    desc: "Pipeline commercial Builder",
    icon: Target,
    dot: "bg-indigo-600",
    iconHover: "group-hover:text-indigo-600",
    textHover: "group-hover:text-indigo-700",
    borderHover: "hover:border-indigo-200",
  },
  {
    href: "/admin/builder",
    label: "Builder",
    desc: "Clients & projets web",
    icon: Hammer,
    dot: "bg-amber-500",
    iconHover: "group-hover:text-amber-500",
    textHover: "group-hover:text-amber-600",
    borderHover: "hover:border-amber-200",
  },
  {
    href: "/admin/modeles",
    label: "Modèles",
    desc: "Bibliothèque de documents réutilisables",
    icon: FileText,
    dot: "bg-teal-500",
    iconHover: "group-hover:text-teal-500",
    textHover: "group-hover:text-teal-600",
    borderHover: "hover:border-teal-200",
  },
  {
    href: "/admin/parametres",
    label: "Paramètres",
    desc: "Sécurité & infos professionnelles",
    icon: Settings,
    dot: "bg-slate-400",
    iconHover: "group-hover:text-slate-500",
    textHover: "group-hover:text-slate-600",
    borderHover: "hover:border-slate-200",
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur Piloto</h2>
      <p className="text-gray-500 mb-10">Tableau de bord administrateur.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`bg-white rounded-xl border border-gray-100 p-6 ${m.borderHover} hover:shadow-sm transition-all group`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${m.dot}`} />
                {Icon && (
                  <Icon size={15} className={`text-gray-400 transition-colors ${m.iconHover}`} />
                )}
                <p className={`font-medium text-gray-800 transition-colors ${m.textHover}`}>
                  {m.label}
                </p>
              </div>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
