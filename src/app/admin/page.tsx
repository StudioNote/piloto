import Link from "next/link";
import { Mic, Hammer } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur Piloto</h2>
      <p className="text-gray-500 mb-10">Tableau de bord administrateur.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/sos-ordi"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
            SOS Ordi
          </p>
          <p className="text-xs text-gray-400 mt-1">Clients &amp; interventions</p>
        </Link>
        <Link
          href="/admin/radio"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
            Radio
          </p>
          <p className="text-xs text-gray-400 mt-1">Radios &amp; facturation mensuelle</p>
        </Link>
        <Link
          href="/admin/voix-off"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Mic size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
              Voix-Off
            </p>
          </div>
          <p className="text-xs text-gray-400">Prestations de voix-off</p>
        </Link>
        <Link
          href="/admin/builder"
          className="bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Hammer size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
              Builder
            </p>
          </div>
          <p className="text-xs text-gray-400">Clients &amp; projets web</p>
        </Link>
        {["Documents", "Paramètres"].map((module) => (
          <div
            key={module}
            className="bg-white rounded-xl border border-gray-100 p-6 opacity-40"
          >
            <p className="font-medium text-gray-700">{module}</p>
            <p className="text-xs text-gray-400 mt-1">Module à venir</p>
          </div>
        ))}
      </div>
    </div>
  );
}
