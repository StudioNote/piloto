import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { creerProspect } from "../actions";
import { ProspectForm } from "@/components/admin/prospects/ProspectForm";

export default function NouveauProspectPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Prospects", href: "/admin/prospects" },
          { label: "Nouveau prospect" },
        ]}
      />
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-indigo-600 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Nouveau prospect</h1>
      </div>
      <ProspectForm action={creerProspect} cancelHref="/admin/prospects" />
    </div>
  );
}
