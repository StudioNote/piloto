import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BuilderClientForm } from "@/components/admin/builder/BuilderClientForm";
import { creerClientBuilder } from "../actions";

export default function NouveauClientBuilderPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Builder", href: "/admin/builder" },
          { label: "Nouveau client" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h2>
      <BuilderClientForm action={creerClientBuilder} cancelHref="/admin/builder" />
    </div>
  );
}
