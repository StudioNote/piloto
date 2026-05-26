import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

type Prestataire = {
  raison_sociale: string | null;
  siret: string | null;
  adresse: string | null;
  cp_ville: string | null;
  telephone: string | null;
  email: string | null;
  site_web?: string | null;
  mentions: string | null;
};

type Ligne = {
  libelle: string;
  description: string | null;
  quantite: number;
  prix_unitaire_ht: number;
  total_ligne: number;
};

type DevisData = {
  numero: string;
  date_emission: string;
  date_validite: string;
  client_nom: string | null;
  client_adresse: string | null;
  client_cp_ville: string | null;
  client_tel: string | null;
  client_email: string | null;
  objet: string | null;
  remise_libelle: string | null;
  remise_montant: number;
  notes: string | null;
  total_ht: number;
};

const ORANGE = "#ea580c";
const GRAY = "#6b7280";
const DARK = "#111827";
const LIGHT_BG = "#fff7ed";
const BORDER = "#e5e7eb";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: DARK, padding: 40 },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end" },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: ORANGE, marginBottom: 4 },
  companyInfo: { color: GRAY, lineHeight: 1.5, fontSize: 8.5 },
  devisTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: ORANGE, letterSpacing: 2 },
  devisNumero: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginTop: 4, marginBottom: 6 },
  devisDate: { fontSize: 8.5, color: GRAY, lineHeight: 1.6 },
  // Separator
  sep: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 12 },
  sepOrange: { borderBottomWidth: 2, borderBottomColor: ORANGE, marginBottom: 12 },
  // Client block
  clientBlock: { backgroundColor: LIGHT_BG, padding: 12, borderRadius: 4, marginBottom: 16 },
  clientLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: ORANGE, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  clientName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  clientInfo: { color: GRAY, lineHeight: 1.5, fontSize: 8.5 },
  // Objet
  objetRow: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  objetLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GRAY, width: 60 },
  objetValue: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: ORANGE, padding: "6 8", borderRadius: 2, marginBottom: 0 },
  tableHeaderText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  tableRow: { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: "row", padding: "5 8", borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: "#fafafa" },
  colDesignation: { flex: 1 },
  colQte: { width: 36, textAlign: "right" },
  colPrix: { width: 72, textAlign: "right" },
  colTotal: { width: 72, textAlign: "right" },
  lineLibelle: { fontSize: 9, color: DARK },
  lineDesc: { fontSize: 7.5, color: GRAY, marginTop: 1 },
  // Totaux
  totauxBlock: { alignItems: "flex-end", marginTop: 10, marginBottom: 16 },
  totauxRow: { flexDirection: "row", gap: 16, marginBottom: 3 },
  totauxLabel: { fontSize: 8.5, color: GRAY, width: 100, textAlign: "right" },
  totauxValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: DARK, width: 80, textAlign: "right" },
  netRow: { flexDirection: "row", gap: 16, borderTopWidth: 2, borderTopColor: ORANGE, paddingTop: 5 },
  netLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, width: 100, textAlign: "right" },
  netValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: ORANGE, width: 80, textAlign: "right" },
  // TVA
  tvaText: { fontSize: 7.5, color: GRAY, textAlign: "right", marginBottom: 16 },
  // Conditions
  conditionsTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 },
  conditionsText: { fontSize: 8, color: GRAY, lineHeight: 1.6 },
  // Bon pour accord
  bpaBlock: { marginTop: 16, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 12 },
  bpaTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  bpaSubtitle: { fontSize: 8, color: GRAY, marginBottom: 16 },
  bpaRow: { flexDirection: "row", gap: 40, marginTop: 8 },
  bpaLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: GRAY },
  bpaLineLabel: { fontSize: 8, color: GRAY, marginBottom: 2 },
});

//   = narrow no-break space,   = non-breaking space — not rendered by @react-pdf fonts
function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, " ") + " €";
}

function fmtDate(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

const CONDITIONS = [
  "Acompte de 40 % à la commande, solde de 60 % à la livraison.",
  "Hébergement inclus la 1re année.",
  "2 séries d'ajustements incluses après livraison.",
  "Évolutions ultérieures sur devis.",
  "Maintenance mensuelle optionnelle sur devis séparé.",
  "Devis valable 30 jours à compter de sa date d'émission.",
  "Tarif de lancement accordé en échange d'un témoignage.",
];

export function DevisPDF({
  devis,
  lignes,
  prestataire,
}: {
  devis: DevisData;
  lignes: Ligne[];
  prestataire: Prestataire;
}) {
  const totalLignes = lignes.reduce((s, l) => s + Number(l.total_ligne), 0);
  const avecRemise = devis.remise_montant > 0;

  return (
    <Document title={`${devis.numero} — Devis`} author={prestataire.raison_sociale ?? ""}>
      <Page size="A4" style={s.page}>

        {/* ── En-tête ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.companyName}>{prestataire.raison_sociale ?? ""}</Text>
            {prestataire.adresse && <Text style={s.companyInfo}>{prestataire.adresse}</Text>}
            {prestataire.cp_ville && <Text style={s.companyInfo}>{prestataire.cp_ville}</Text>}
            {prestataire.telephone && <Text style={s.companyInfo}>{prestataire.telephone}</Text>}
            {prestataire.email && <Text style={s.companyInfo}>{prestataire.email}</Text>}
            {prestataire.site_web && <Text style={s.companyInfo}>{prestataire.site_web}</Text>}
            {prestataire.siret && <Text style={[s.companyInfo, { marginTop: 4 }]}>SIRET {prestataire.siret}</Text>}
          </View>
          <View style={s.headerRight}>
            <Text style={s.devisTitle}>DEVIS</Text>
            <Text style={s.devisNumero}>{devis.numero}</Text>
            <Text style={s.devisDate}>Date : {fmtDate(devis.date_emission)}</Text>
            <Text style={s.devisDate}>Validité : {fmtDate(devis.date_validite)}</Text>
          </View>
        </View>

        <View style={s.sepOrange} />

        {/* ── Destinataire ── */}
        <View style={s.clientBlock}>
          <Text style={s.clientLabel}>Destinataire</Text>
          {devis.client_nom && <Text style={s.clientName}>{devis.client_nom}</Text>}
          {devis.client_adresse && <Text style={s.clientInfo}>{devis.client_adresse}</Text>}
          {devis.client_cp_ville && <Text style={s.clientInfo}>{devis.client_cp_ville}</Text>}
          {devis.client_tel && <Text style={s.clientInfo}>{devis.client_tel}</Text>}
          {devis.client_email && <Text style={s.clientInfo}>{devis.client_email}</Text>}
        </View>

        {/* ── Objet ── */}
        {devis.objet && (
          <View style={s.objetRow}>
            <Text style={s.objetLabel}>Objet :</Text>
            <Text style={s.objetValue}>{devis.objet}</Text>
          </View>
        )}

        {/* ── Tableau des lignes ── */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colDesignation]}>Désignation</Text>
          <Text style={[s.tableHeaderText, s.colQte]}>Qté</Text>
          <Text style={[s.tableHeaderText, s.colPrix]}>Prix U. HT</Text>
          <Text style={[s.tableHeaderText, s.colTotal]}>Total HT</Text>
        </View>

        {lignes.map((l, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <View style={s.colDesignation}>
              <Text style={s.lineLibelle}>{l.libelle}</Text>
              {l.description ? <Text style={s.lineDesc}>{l.description}</Text> : null}
            </View>
            <Text style={[s.colQte, s.lineLibelle]}>
              {Number(l.quantite) === 1 ? "1" : Number(l.quantite).toLocaleString("fr-FR").replace(/[  ]/g, " ")}
            </Text>
            <Text style={[s.colPrix, s.lineLibelle]}>{fmt(Number(l.prix_unitaire_ht))}</Text>
            <Text style={[s.colTotal, s.lineLibelle]}>{fmt(Number(l.total_ligne))}</Text>
          </View>
        ))}

        {/* ── Totaux ── */}
        <View style={s.totauxBlock}>
          <View style={s.totauxRow}>
            <Text style={s.totauxLabel}>Total HT</Text>
            <Text style={s.totauxValue}>{fmt(totalLignes)}</Text>
          </View>
          {avecRemise && (
            <View style={s.totauxRow}>
              <Text style={s.totauxLabel}>{devis.remise_libelle || "Remise"}</Text>
              <Text style={s.totauxValue}>- {fmt(Number(devis.remise_montant))}</Text>
            </View>
          )}
          <View style={s.netRow}>
            <Text style={s.netLabel}>Net à payer HT</Text>
            <Text style={s.netValue}>{fmt(Number(devis.total_ht))}</Text>
          </View>
        </View>

        <Text style={s.tvaText}>TVA non applicable, art. 293 B du CGI</Text>

        <View style={s.sep} />

        {/* ── Conditions ── */}
        <Text style={s.conditionsTitle}>Conditions</Text>
        {CONDITIONS.map((c, i) => (
          <Text key={i} style={s.conditionsText}>• {c}</Text>
        ))}

        {/* ── Bon pour accord ── */}
        <View style={s.bpaBlock}>
          <Text style={s.bpaTitle}>Bon pour accord</Text>
          <Text style={s.bpaSubtitle}>Signature précédée de la mention « Lu et approuvé »</Text>
          <View style={s.bpaRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.bpaLineLabel}>Date</Text>
              <View style={s.bpaLine} />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={s.bpaLineLabel}>Signature</Text>
              <View style={[s.bpaLine, { height: 36 }]} />
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
