// ─── Shared Print Utility ────────────────────────────────────────────────────
// Used by both Pos/Index and Ventes/Show so the output is always identical.

export interface Entreprise {
    nom: string | null;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    nif: string | null;
    stat: string | null;
    logo_url: string | null;
    note_pied_page: string | null;
}

export interface PrintLigne {
    designation: string;
    quantite: number;
    prix_unitaire: number;
    remise_ligne: number;
    sous_total: number;
    taux_tva: number;
}

export interface PrintCommande {
    numero_commande: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    remise: number;
    created_at: string;
    client: { name: string; telephone: string | null } | null;
    lignes: PrintLigne[];
}

function fmt(n: number): string {
    return new Intl.NumberFormat('fr-MG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

export function printReceipt(
    commande: PrintCommande,
    format: 'thermal' | 'a4',
    entreprise?: Entreprise | null,
): void {
    const date    = new Date(commande.created_at);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const companyName = entreprise?.nom || 'Mon Entreprise';

    // ═══════════════════════════════════════════════════════════════════════════
    //  80 mm thermal ticket
    // ═══════════════════════════════════════════════════════════════════════════
    if (format === 'thermal') {
        const w = window.open('', '_blank', 'width=320,height=600');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket</title>
<style>
  @page { margin: 2mm; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 76mm; padding: 2mm; color: #000; }
  .center { text-align: center; }
  .bold   { font-weight: bold; }
  .line   { border-top: 1px dashed #000; margin: 4px 0; }
  .row    { display: flex; justify-content: space-between; }
  .items  { width: 100%; border-collapse: collapse; }
  .items td { padding: 1px 0; }
  .qty   { width: 24px; text-align: center; }
  .price { text-align: right; white-space: nowrap; }
  .total-row { font-size: 14px; font-weight: bold; }
  .small { font-size: 10px; color: #555; }
</style></head><body>
  <div class="center bold" style="font-size:16px;margin-bottom:4px;">${companyName}</div>
  ${entreprise?.adresse   ? `<div class="center small">${entreprise.adresse}</div>`        : ''}
  ${entreprise?.telephone ? `<div class="center small">Tél: ${entreprise.telephone}</div>` : ''}
  <div class="center small">Ticket de caisse</div>
  <div class="line"></div>
  <div class="row small"><span>N°: ${commande.numero_commande}</span><span>${dateStr} ${timeStr}</span></div>
  ${commande.client ? `<div class="small">Client: ${commande.client.name}</div>` : ''}
  <div class="line"></div>
  <table class="items"><tbody>
    ${commande.lignes.map((l) => `
      <tr>
        <td class="qty">${l.quantite}x</td>
        <td>${l.designation}</td>
        <td class="price">${fmt(l.sous_total)}</td>
      </tr>
      ${l.remise_ligne > 0
          ? `<tr><td></td><td class="small" colspan="2" style="text-align:right;">Remise: -${fmt(l.remise_ligne)}</td></tr>`
          : ''}
    `).join('')}
  </tbody></table>
  <div class="line"></div>
  <div class="row"><span>Total HT</span><span>${fmt(commande.montant_ht)} Ar</span></div>
  <div class="row"><span>TVA</span><span>${fmt(commande.montant_tva)} Ar</span></div>
  ${commande.remise > 0 ? `<div class="row"><span>Remise</span><span>-${fmt(commande.remise)} Ar</span></div>` : ''}
  <div class="line"></div>
  <div class="row total-row"><span>TOTAL TTC</span><span>${fmt(commande.montant_ttc)} Ar</span></div>
  <div class="line"></div>
  <div class="center small" style="margin-top:6px;">${entreprise?.note_pied_page || 'Merci de votre visite !'}</div>
  <div class="center small">━━━━━━━━━━━━━━━━━━━</div>
</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 400);
        return;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  A4 invoice  — identical layout for POS and Journal des Ventes
    // ═══════════════════════════════════════════════════════════════════════════
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${commande.numero_commande}</title>
<style>
  @page { margin: 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #1a1a1a;
    background: white;
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm;
  }

  /* ── Header ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .company-logo { max-height: 52px; width: auto; margin-bottom: 8px; display: block; }
  .company-name { font-size: 22px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .company-info { font-size: 12px; color: #6b7280; line-height: 1.7; }
  .doc-info     { text-align: right; }
  .doc-title    { font-size: 26px; font-weight: 700; color: #111; letter-spacing: 1px; }
  .doc-num      { font-size: 15px; font-weight: 600; color: #2563eb; margin-top: 6px; }
  .doc-date     { font-size: 12px; color: #6b7280; margin-top: 6px; }

  /* ── Client box ── */
  .client-box   { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px; margin-bottom: 28px; }
  .client-label { font-size: 10px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.6px; font-weight: 600; margin-bottom: 6px; }
  .client-name  { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 2px; }
  .client-detail { font-size: 12px; color: #6b7280; }
  .client-italic { font-size: 13px; color: #9ca3af; font-style: italic; }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  thead tr  { border-bottom: 2px solid #d1d5db; }
  thead th  { padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; }
  .text-right  { text-align: right; }
  .text-center { text-align: center; }
  tbody td  { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  tbody tr:last-child td { border-bottom: none; }
  .font-medium { font-weight: 600; }

  /* ── Totals ── */
  .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 32px; }
  .totals         { width: 260px; }
  .totals .row    { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
  .totals .label  { color: #6b7280; }
  .total-final    { display: flex; justify-content: space-between; border-top: 2px solid #d1d5db; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 700; color: #111; }

  /* ── Footer ── */
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
</style></head><body>

  <div class="header">
    <div>
      ${entreprise?.logo_url ? `<img src="${entreprise.logo_url}" alt="Logo" class="company-logo" />` : ''}
      <div class="company-name">${companyName}</div>
      <div class="company-info">
        ${entreprise?.adresse   ? `${entreprise.adresse}<br>`                  : ''}
        ${entreprise?.telephone ? `Tél : ${entreprise.telephone}<br>`          : ''}
        ${entreprise?.email     ? `Email : ${entreprise.email}<br>`            : ''}
        ${entreprise?.nif       ? `NIF : ${entreprise.nif}<br>`                : ''}
        ${entreprise?.stat      ? `STAT : ${entreprise.stat}`                  : ''}
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-title">FACTURE</div>
      <div class="doc-num">${commande.numero_commande}</div>
      <div class="doc-date">Date : ${dateStr} à ${timeStr}</div>
    </div>
  </div>

  <div class="client-box">
    <div class="client-label">Facturé à</div>
    ${commande.client
        ? `<div class="client-name">${commande.client.name}</div>
           ${commande.client.telephone ? `<div class="client-detail">Tél : ${commande.client.telephone}</div>` : ''}`
        : `<div class="client-italic">Vente au comptoir</div>`
    }
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th class="text-right">Prix unitaire</th>
        <th class="text-center">Quantité</th>
        <th class="text-right">TVA (%)</th>
        <th class="text-right">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      ${commande.lignes.map((l) => `
        <tr>
          <td>${l.designation}</td>
          <td class="text-right">${fmt(l.prix_unitaire)} Ar</td>
          <td class="text-center">${l.quantite}</td>
          <td class="text-right">${l.taux_tva}%</td>
          <td class="text-right font-medium">${fmt(l.sous_total)} Ar</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <div class="totals">
      <div class="row"><span class="label">Total HT</span><span>${fmt(commande.montant_ht)} Ar</span></div>
      <div class="row"><span class="label">TVA</span><span>${fmt(commande.montant_tva)} Ar</span></div>
      ${commande.remise > 0
          ? `<div class="row"><span class="label">Remise</span><span>-${fmt(commande.remise)} Ar</span></div>`
          : ''}
      <div class="total-final"><span>Total TTC</span><span>${fmt(commande.montant_ttc)} Ar</span></div>
    </div>
  </div>

  <div class="footer">${entreprise?.note_pied_page || 'Merci pour votre confiance !'}</div>

</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 400);
}
