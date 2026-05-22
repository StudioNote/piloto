"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { changerStatutProspect } from "@/app/admin/prospects/actions";

export interface Prospect {
  id: string;
  societe: string | null;
  nom: string | null;
  prenom: string | null;
  montant_estime: number | null;
  statut: string;
  prochaine_action_date: string | null;
  converted_client_id: string | null;
}

const COLONNES: { key: string; label: string }[] = [
  { key: "a_contacter",  label: "À contacter" },
  { key: "contacte",     label: "Contacté" },
  { key: "rdv",          label: "RDV" },
  { key: "devis_envoye", label: "Devis envoyé" },
  { key: "gagne",        label: "Gagné" },
  { key: "perdu",        label: "Perdu" },
];

const COLONNE_COLORS: Record<string, string> = {
  a_contacter:  "border-t-gray-400",
  contacte:     "border-t-blue-400",
  rdv:          "border-t-indigo-500",
  devis_envoye: "border-t-amber-500",
  gagne:        "border-t-emerald-500",
  perdu:        "border-t-red-400",
};

function prospectLabel(p: Prospect): string {
  return p.societe ?? `${p.prenom ?? ""} ${p.nom ?? ""}`.trim();
}

function ProspectCard({ prospect, isDragging = false }: { prospect: Prospect; isDragging?: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue =
    prospect.prochaine_action_date &&
    prospect.prochaine_action_date < today &&
    prospect.statut !== "gagne" &&
    prospect.statut !== "perdu";

  return (
    <Link
      href={`/admin/prospects/${prospect.id}`}
      data-card="true"
      className={`block bg-white rounded-lg border border-gray-100 p-3 hover:border-indigo-200 hover:shadow-sm transition-all ${
        isDragging ? "shadow-lg rotate-1 opacity-90" : ""
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-drag-handle]")) e.preventDefault();
      }}
    >
      <p className="text-sm font-medium text-gray-800 leading-snug truncate">
        {prospectLabel(prospect)}
      </p>
      {prospect.montant_estime != null && (
        <p className="text-xs text-indigo-600 font-medium mt-0.5">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(prospect.montant_estime)}
        </p>
      )}
      {prospect.prochaine_action_date && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {overdue && <AlertCircle size={11} className="shrink-0" />}
          {new Date(prospect.prochaine_action_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      )}
      {prospect.converted_client_id && (
        <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">
          Converti
        </span>
      )}
    </Link>
  );
}

function DraggableCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: prospect.id,
    data: { prospect },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-0" : ""}`}
    >
      <ProspectCard prospect={prospect} />
    </div>
  );
}

function DroppableColumn({
  statut,
  label,
  prospects,
}: {
  statut: string;
  label: string;
  prospects: Prospect[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });

  return (
    <div className="flex flex-col min-w-[180px]">
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 leading-none">
          {prospects.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border-2 border-dashed p-2 min-h-[120px] transition-colors space-y-2 ${
          isOver
            ? "border-indigo-400 bg-indigo-50/50"
            : "border-gray-100 bg-gray-50/50"
        } ${COLONNE_COLORS[statut] ?? ""} border-t-4 border-t-solid`}
        style={{ borderTopStyle: "solid" }}
      >
        {prospects.map((p) => (
          <DraggableCard key={p.id} prospect={p} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialProspects }: { initialProspects: Prospect[] }) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const p = prospects.find((x) => x.id === event.active.id);
    if (p) setActiveProspect(p);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveProspect(null);
    const { active, over } = event;
    if (!over) return;
    const prospectId = active.id as string;
    const newStatut = over.id as string;
    const current = prospects.find((p) => p.id === prospectId);
    if (!current || current.statut === newStatut) return;

    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, statut: newStatut } : p))
    );

    try {
      await changerStatutProspect(prospectId, newStatut);
    } catch {
      setProspects((prev) =>
        prev.map((p) => (p.id === prospectId ? { ...p, statut: current.statut } : p))
      );
    }
  }

  const byStatut = Object.fromEntries(
    COLONNES.map((c) => [c.key, prospects.filter((p) => p.statut === c.key)])
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {COLONNES.map((col) => (
            <DroppableColumn
              key={col.key}
              statut={col.key}
              label={col.label}
              prospects={byStatut[col.key] ?? []}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeProspect && <ProspectCard prospect={activeProspect} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
