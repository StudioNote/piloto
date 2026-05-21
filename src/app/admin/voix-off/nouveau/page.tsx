import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { ClientVoixOffForm } from "@/components/admin/voix-off/ClientVoixOffForm";
import { creerClientVoixOff } from "../actions";

export default function NouveauClientVoixOffPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Voix-Off", href: "/admin/voix-off" },
          { label: "Nouveau client" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h2>
      <ClientVoixOffForm action={creerClientVoixOff} cancelHref="/admin/voix-off" />
    </div>
  );
}
