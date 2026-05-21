interface ClientLike {
  societe?: string | null;
  nom?: string | null;
  prenom?: string | null;
}

export function clientLabel(c: ClientLike): string {
  if (c.societe) return c.societe;
  return [c.prenom, c.nom].filter(Boolean).join(" ") || "—";
}

export function clientContact(c: ClientLike): string | null {
  if (!c.societe) return null;
  const contact = [c.prenom, c.nom].filter(Boolean).join(" ");
  return contact || null;
}
