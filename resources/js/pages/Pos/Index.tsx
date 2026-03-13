import { Head, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { echo, echoIsConfigured } from '@laravel/echo-react';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Package,
    CheckCircle,
    User,
    X,
    Delete,
    Hash,
    ArrowLeft,
    ScanBarcode,
    XCircle,
    Printer,
    FileText,
    Percent,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import pos from '@/routes/pos';
import type { BreadcrumbItem } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PosProduct {
    id_variante: number;
    nom: string;
    prix: number;
    stock: number;
    image_url: string | null;
    id_categorie: number | null;
    est_pack: boolean;
    code_barre: string | null;
}

const resolveImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
        return null;
    }

    if (/^(https?:)?\/\//.test(imageUrl) || imageUrl.startsWith('/')) {
        return imageUrl;
    }

    return `/${imageUrl.replace(/^\/+/, '')}`;
};

interface Category {
    id_categorie: number;
    nom: string;
}

interface ClientOption {
    id_client: number;
    name: string;
}

interface OrderLine {
    id_variante: number;
    nom: string;
    prix_unitaire: number;
    quantite: number;
    stock: number;
    est_pack: boolean;
    remise_type: 'percent' | 'fixed';
    remise_value: number; // Discount value (percentage or MGA amount)
}

interface CommandeLigne {
    designation: string;
    quantite: number;
    prix_unitaire: number;
    remise_ligne: number;
    sous_total: number;
    taux_tva: number;
}

interface CommandeData {
    id: number;
    numero_commande: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    remise: number;
    created_at: string;
    client: { name: string; telephone: string | null } | null;
    lignes: CommandeLigne[];
}

interface PageProps {
    produits: PosProduct[];
    categories: Category[];
    clients: ClientOption[];
    flash: { success?: string; message?: string; commande?: CommandeData };
    auth: { user: { id: number } };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Point de vente', href: pos.index().url },
];

const TVA_RATE = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────────

function computeLineDiscount(line: OrderLine): number {
    const brut = line.prix_unitaire * line.quantite;
    if (line.remise_type === 'percent') {
        return Math.round(brut * (line.remise_value / 100));
    }
    return Math.min(line.remise_value, brut); // fixed, capped
}

function computeLineTotal(line: OrderLine): number {
    return line.prix_unitaire * line.quantite - computeLineDiscount(line);
}

// ─── Receipt Print ──────────────────────────────────────────────────────────────

function printReceipt(commande: CommandeData, format: 'thermal' | 'a4') {
    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
    const date = new Date(commande.created_at);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (format === 'thermal') {
        // ── 80mm thermal receipt ──
        const w = window.open('', '_blank', 'width=320,height=600');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket</title>
<style>
  @page { margin: 2mm; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 76mm; padding: 2mm; color: #000; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; }
  .items td { padding: 1px 0; }
  .items { width: 100%; border-collapse: collapse; }
  .items .qty { width: 24px; text-align: center; }
  .items .price { text-align: right; white-space: nowrap; }
  .total-row { font-size: 14px; font-weight: bold; }
  .small { font-size: 10px; color: #555; }
</style></head><body>
  <div class="center bold" style="font-size:16px;margin-bottom:4px;">🍽️ KIOSK POS</div>
  <div class="center small">Ticket de caisse</div>
  <div class="line"></div>
  <div class="row small"><span>N°: ${commande.numero_commande}</span><span>${dateStr} ${timeStr}</span></div>
  ${commande.client ? `<div class="small">Client: ${commande.client.name}</div>` : ''}
  <div class="line"></div>
  <table class="items">
    <tbody>
      ${commande.lignes.map(l => `
        <tr>
          <td class="qty">${l.quantite}x</td>
          <td>${l.designation}</td>
          <td class="price">${fmt(l.sous_total)}</td>
        </tr>
        ${l.remise_ligne > 0 ? `<tr><td></td><td class="small" colspan="2" style="text-align:right;">Remise: -${fmt(l.remise_ligne)}</td></tr>` : ''}
      `).join('')}
    </tbody>
  </table>
  <div class="line"></div>
  <div class="row"><span>Sous-total HT</span><span>${fmt(commande.montant_ht)} MGA</span></div>
  <div class="row"><span>TVA</span><span>${fmt(commande.montant_tva)} MGA</span></div>
  ${commande.remise > 0 ? `<div class="row"><span>Remise</span><span>-${fmt(commande.remise)} MGA</span></div>` : ''}
  <div class="line"></div>
  <div class="row total-row"><span>TOTAL TTC</span><span>${fmt(commande.montant_ttc)} MGA</span></div>
  <div class="line"></div>
  <div class="center small" style="margin-top:6px;">Merci de votre visite !</div>
  <div class="center small">━━━━━━━━━━━━━━━━━━━</div>
</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 400);
    } else {
        // ── A4 invoice ──
        const w = window.open('', '_blank', 'width=800,height=900');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${commande.numero_commande}</title>
<style>
  @page { margin: 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; max-width: 210mm; margin: 0 auto; padding: 20mm; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
  .brand { font-size: 28px; font-weight: bold; color: #2563eb; }
  .brand-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .doc-info { text-align: right; }
  .doc-title { font-size: 20px; font-weight: bold; color: #111; }
  .doc-num { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .client-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
  .client-box .label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.3px; border-bottom: 2px solid #e5e7eb; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
  tbody tr:hover { background: #fafafa; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals .total-final { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 6px; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
</style></head><body>
  <div class="header">
    <div>
      <div class="brand">KIOSK POS</div>
      <div class="brand-sub">Système de Point de Vente</div>
    </div>
    <div class="doc-info">
      <div class="doc-title">FACTURE</div>
      <div class="doc-num">${commande.numero_commande}</div>
      <div class="doc-num">${dateStr} à ${timeStr}</div>
    </div>
  </div>

  ${commande.client ? `
  <div class="client-box">
    <div class="label">Client</div>
    <div style="font-weight:600;">${commande.client.name}</div>
    ${commande.client.telephone ? `<div style="color:#6b7280;">${commande.client.telephone}</div>` : ''}
  </div>` : ''}

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th class="text-right">P.U.</th>
        <th class="text-right">Qté</th>
        <th class="text-right">Remise</th>
        <th class="text-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      ${commande.lignes.map(l => `
        <tr>
          <td>${l.designation}</td>
          <td class="text-right">${fmt(l.prix_unitaire)} MGA</td>
          <td class="text-right">${l.quantite}</td>
          <td class="text-right">${l.remise_ligne > 0 ? `-${fmt(l.remise_ligne)}` : '—'}</td>
          <td class="text-right" style="font-weight:600;">${fmt(l.sous_total)} MGA</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Sous-total HT</span><span>${fmt(commande.montant_ht)} MGA</span></div>
    <div class="row"><span>TVA (${commande.lignes[0]?.taux_tva ?? 20}%)</span><span>${fmt(commande.montant_tva)} MGA</span></div>
    ${commande.remise > 0 ? `<div class="row"><span>Remise globale</span><span>-${fmt(commande.remise)} MGA</span></div>` : ''}
    <div class="row total-final"><span>Total TTC</span><span>${fmt(commande.montant_ttc)} MGA</span></div>
  </div>

  <div class="footer">
    <p>Merci pour votre confiance !</p>
    <p style="margin-top:4px;">KIOSK POS — Système de gestion commerciale</p>
  </div>
</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 400);
    }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PosIndex() {
    const { produits, categories, clients, flash, auth } = usePage<PageProps>().props;

    // ── Order state ──
    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [numpadMode, setNumpadMode] = useState<'qty' | 'price' | 'discount'>('qty');
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
    const [numpadBuffer, setNumpadBuffer] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── Barcode scanner state ──
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanToast, setScanToast] = useState<{ type: 'success' | 'not_found'; message: string; code: string } | null>(null);

    // ── Receipt dialog state ──
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [lastCommande, setLastCommande] = useState<CommandeData | null>(null);

    // ── Form ──
    const { post, processing } = useForm();

    // ── Flash message ──
    useEffect(() => {
        if (flash.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            // If a commande was returned, show the receipt dialog
            if (flash.commande) {
                setLastCommande(flash.commande);
                setReceiptDialogOpen(true);
            }
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.commande]);

    // ── Scan toast auto-dismiss ──
    useEffect(() => {
        if (scanToast) {
            const timer = setTimeout(() => setScanToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [scanToast]);

    // ── Product filtering ──
    const filteredProducts = useMemo(() => {
        let items = produits;
        if (selectedCategory !== null) {
            items = items.filter((p) => p.id_categorie === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter((p) => p.nom.toLowerCase().includes(q));
        }
        return items;
    }, [produits, selectedCategory, searchQuery]);

    // ── Client filtering ──
    const filteredClients = useMemo(() => {
        if (!clientSearch.trim()) return clients;
        const q = clientSearch.toLowerCase();
        return clients.filter((c) => c.name.toLowerCase().includes(q));
    }, [clients, clientSearch]);

    const selectedClientName = useMemo(() => {
        if (!selectedClient) return null;
        return clients.find((c) => c.id_client === selectedClient)?.name ?? null;
    }, [clients, selectedClient]);

    // ── Order operations ──
    const addProduct = useCallback((product: PosProduct) => {
        setOrderLines((prev) => {
            const existing = prev.findIndex((l) => l.id_variante === product.id_variante);
            if (existing >= 0) {
                return prev.map((l, i) =>
                    i === existing
                        ? { ...l, quantite: Math.min(l.quantite + 1, Math.max(1, l.stock)) }
                        : l
                );
            }
            if (product.stock <= 0) {
                return prev;
            }
            return [
                ...prev,
                {
                    id_variante: product.id_variante,
                    nom: product.nom,
                    prix_unitaire: product.prix,
                    quantite: 1,
                    stock: product.stock,
                    est_pack: product.est_pack,
                    remise_type: 'percent',
                    remise_value: 0,
                },
            ];
        });
    }, []);

    // ── Barcode scan handler ──
    const handleBarcodeScan = useCallback(async (barcode: string, isRemote = false) => {
        // If it's a local scan, broadcast to other devices (like computer) in the background
        if (!isRemote) {
            axios.post('/pos/broadcast-scan', { code: barcode }).catch(() => {});
        }

        // 1. Try client-side match first (fast)
        const matchedProduct = produits.find(
            (p) => p.code_barre && p.code_barre === barcode
        );

        if (matchedProduct) {
            const inOrder = orderLines.find((l) => l.id_variante === matchedProduct.id_variante);
            if (matchedProduct.stock <= 0 || (inOrder && inOrder.quantite >= matchedProduct.stock)) {
                setScanToast({ type: 'not_found', message: `Stock dépassé pour ${matchedProduct.nom}`, code: barcode });
                return;
            }
            addProduct(matchedProduct);
            setScanToast({ type: 'success', message: matchedProduct.nom, code: barcode });
            return;
        }

        // 2. Fallback to server-side lookup (handles out-of-stock or filtered products)
        try {
            const response = await axios.post('/pos/barcode-lookup', { code: barcode });
            const data = response.data;

            if (data.found && data.produit) {
                const p = data.produit;
                const inOrder = orderLines.find((l) => l.id_variante === p.id_variante);
                if (p.stock <= 0 || (inOrder && inOrder.quantite >= p.stock)) {
                    setScanToast({ type: 'not_found', message: `Stock dépassé pour ${p.nom}`, code: barcode });
                    return;
                }
                addProduct(p);
                setScanToast({ type: 'success', message: p.nom, code: barcode });
            } else {
                setScanToast({
                    type: 'not_found',
                    message: data.message || 'Aucun produit trouvé.',
                    code: barcode,
                });
            }
        } catch {
            setScanToast({
                type: 'not_found',
                message: 'Erreur lors de la recherche du code-barres.',
                code: barcode,
            });
        }
    }, [produits, orderLines, addProduct]);

    // ── Remote scanner listener (WebSockets) ──
    useEffect(() => {
        const userId = auth?.user?.id;
        try {
            if (userId && echoIsConfigured()) {
                const instance = echo();
                const channel = instance.private(`user.${userId}`);
                
                channel.listen('BarcodeScanned', (e: any) => {
                    if (e.barcode) {
                        console.log('Remote scan received:', e.barcode);
                        handleBarcodeScan(e.barcode, true);
                    }
                });

                return () => {
                    channel.stopListening('BarcodeScanned');
                };
            }
        } catch (error) {
            console.error('Echo configuration error:', error);
        }
    }, [handleBarcodeScan, auth?.user?.id]);

    const updateLineQuantity = useCallback((index: number, delta: number) => {
        setOrderLines((prev) =>
            prev
                .map((l, i) => {
                    if (i !== index) return l;
                    const newQty = l.quantite + delta;
                    if (newQty <= 0) return null;
                    return { ...l, quantite: Math.min(newQty, l.stock) };
                })
                .filter(Boolean) as OrderLine[]
        );
    }, []);

    const removeLine = useCallback((index: number) => {
        setOrderLines((prev) => prev.filter((_, i) => i !== index));
        setSelectedLine(null);
    }, []);

    const clearOrder = useCallback(() => {
        setOrderLines([]);
        setSelectedLine(null);
        setSelectedClient(null);
        setNumpadBuffer('');
    }, []);

    // ── Numpad ──
    const handleNumpadPress = useCallback(
        (key: string) => {
            if (selectedLine === null && key !== 'C') return;

            if (key === 'C') {
                setNumpadBuffer('');
                // Also reset discount on the selected line
                if (selectedLine !== null && numpadMode === 'discount') {
                    setOrderLines((prev) =>
                        prev.map((l, i) =>
                            i === selectedLine ? { ...l, remise_value: 0 } : l
                        )
                    );
                }
                return;
            }

            if (key === '⌫') {
                setNumpadBuffer((prev) => prev.slice(0, -1));
                return;
            }

            // Dot: only one allowed
            if (key === '.' && numpadBuffer.includes('.')) return;

            const newBuffer = numpadBuffer + key;
            setNumpadBuffer(newBuffer);

            const value = parseFloat(newBuffer);
            if (isNaN(value)) return;

            if (numpadMode === 'qty') {
                setOrderLines((prev) =>
                    prev.map((l, i) =>
                        i === selectedLine
                            ? { ...l, quantite: Math.min(Math.max(1, Math.floor(value)), l.stock) }
                            : l
                    )
                );
            } else if (numpadMode === 'price') {
                setOrderLines((prev) =>
                    prev.map((l, i) =>
                        i === selectedLine ? { ...l, prix_unitaire: value } : l
                    )
                );
            } else if (numpadMode === 'discount') {
                // Clamp percentage to 100
                const clampedValue = discountType === 'percent' ? Math.min(value, 100) : value;
                setOrderLines((prev) =>
                    prev.map((l, i) =>
                        i === selectedLine
                            ? { ...l, remise_type: discountType, remise_value: clampedValue }
                            : l
                    )
                );
            }
        },
        [selectedLine, numpadMode, numpadBuffer, discountType]
    );

    const switchNumpadMode = useCallback((mode: 'qty' | 'price' | 'discount') => {
        setNumpadMode(mode);
        setNumpadBuffer('');
    }, []);

    // ── Totals ──
    const subtotal = useMemo(
        () => orderLines.reduce((sum, l) => sum + computeLineTotal(l), 0),
        [orderLines]
    );
    const totalDiscount = useMemo(
        () => orderLines.reduce((sum, l) => sum + computeLineDiscount(l), 0),
        [orderLines]
    );
    const tva = useMemo(() => subtotal * (TVA_RATE / 100), [subtotal]);
    const total = useMemo(() => subtotal + tva, [subtotal, tva]);

    // ── Submit ──
    function handleSubmit() {
        if (orderLines.length === 0 || processing) return;

        const payload = {
            id_client: selectedClient,
            lignes: orderLines.map((l) => ({
                id_variante: l.id_variante,
                quantite: l.quantite,
                prix_unitaire: l.prix_unitaire,
                taux_tva: TVA_RATE,
                remise_ligne: computeLineDiscount(l),
            })),
        };

        router.post(pos.store().url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                clearOrder();
                // Receipt dialog will be triggered by the flash effect
            },
        });
    }

    // ── Format price ──
    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' MGA';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point de vente" />

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2">
                    <CheckCircle className="h-4 w-4" />
                    {flash.success}
                </div>
            )}

            {/* Barcode scan toast */}
            {scanToast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2 ${
                    scanToast.type === 'success' ? 'bg-green-600' : 'bg-orange-500'
                }`}>
                    {scanToast.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <div>
                        <p>{scanToast.message}</p>
                        <p className="text-xs opacity-80 font-mono">Code: {scanToast.code}</p>
                    </div>
                </div>
            )}

            {/* Barcode Scanner Dialog */}
            <BarcodeScanner
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleBarcodeScan}
            />

            {/* ═══════════ RECEIPT DIALOG ═══════════ */}
            <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Vente enregistrée !
                        </DialogTitle>
                        <DialogDescription>
                            {lastCommande && (
                                <span>
                                    Commande <strong className="text-foreground">{lastCommande.numero_commande}</strong>
                                    {' — '}
                                    <strong className="text-foreground">
                                        {new Intl.NumberFormat('fr-MG').format(lastCommande.montant_ttc)} MGA
                                    </strong>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground text-center">
                            Souhaitez-vous imprimer un document ?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                                onClick={() => {
                                    if (lastCommande) printReceipt(lastCommande, 'thermal');
                                }}
                            >
                                <Printer className="h-6 w-6 text-primary" />
                                <span className="text-xs font-medium">Ticket de caisse</span>
                                <span className="text-[10px] text-muted-foreground">Imprimante thermique</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                                onClick={() => {
                                    if (lastCommande) printReceipt(lastCommande, 'a4');
                                }}
                            >
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-xs font-medium">Facture A4</span>
                                <span className="text-[10px] text-muted-foreground">Format standard</span>
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setReceiptDialogOpen(false)}
                        >
                            Fermer sans imprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* ═══════════ LEFT PANEL — Order ═══════════ */}
                <div className="flex w-[380px] shrink-0 flex-col border-r border-border bg-card">
                    {/* Order header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <h2 className="text-sm font-semibold">Commande en cours</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {orderLines.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearOrder}
                                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Vider
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Client selector */}
                    <div className="border-b border-border px-4 py-2">
                        {showClientPicker ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Rechercher un client..."
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="h-8 text-sm"
                                        autoFocus
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => {
                                            setShowClientPicker(false);
                                            setClientSearch('');
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="max-h-32 overflow-y-auto rounded-md border border-border">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedClient(null);
                                            setShowClientPicker(false);
                                            setClientSearch('');
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
                                    >
                                        Aucun client
                                    </button>
                                    {filteredClients.map((c) => (
                                        <button
                                            key={c.id_client}
                                            type="button"
                                            onClick={() => {
                                                setSelectedClient(c.id_client);
                                                setShowClientPicker(false);
                                                setClientSearch('');
                                            }}
                                            className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent ${
                                                selectedClient === c.id_client
                                                    ? 'bg-accent font-medium'
                                                    : ''
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowClientPicker(true)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <User className="h-4 w-4" />
                                {selectedClientName ?? 'Sélectionner un client'}
                            </button>
                        )}
                    </div>

                    {/* Order lines */}
                    <div className="flex-1 overflow-y-auto">
                        {orderLines.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <ShoppingCart className="h-10 w-10 opacity-30" />
                                <p className="text-sm">Commande vide</p>
                                <p className="text-xs">Cliquez sur un produit pour l&apos;ajouter</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orderLines.map((line, index) => {
                                    const lineDiscount = computeLineDiscount(line);
                                    const lineTotal = computeLineTotal(line);
                                    return (
                                        <button
                                            key={line.id_variante}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLine(selectedLine === index ? null : index);
                                                setNumpadBuffer('');
                                            }}
                                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                selectedLine === index
                                                    ? 'bg-primary/10 ring-1 ring-inset ring-primary/30'
                                                    : 'hover:bg-accent/50'
                                            }`}
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                                                {line.quantite}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium">{line.nom}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {fmt(line.prix_unitaire)} × {line.quantite}
                                                    {lineDiscount > 0 && (
                                                        <span className="ml-1 text-orange-500">
                                                            -{line.remise_type === 'percent' ? `${line.remise_value}%` : fmt(line.remise_value)}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    {lineDiscount > 0 && (
                                                        <span className="block text-xs text-muted-foreground line-through">
                                                            {fmt(line.prix_unitaire * line.quantite)}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-semibold">
                                                        {fmt(lineTotal)}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeLine(index);
                                                    }}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Numpad + Totals */}
                    <div className="border-t border-border">
                        {/* Numpad mode selector */}
                        {selectedLine !== null && (
                            <div className="border-b border-border px-4 py-2">
                                <div className="flex gap-1">
                                    {(['qty', 'price', 'discount'] as const).map((mode) => (
                                        <Button
                                            key={mode}
                                            variant={numpadMode === mode ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => switchNumpadMode(mode)}
                                        >
                                            {mode === 'qty' ? 'Qté' : mode === 'price' ? 'Prix' : 'Remise'}
                                        </Button>
                                    ))}
                                </div>

                                {/* Discount type toggle (only when discount mode is active) */}
                                {numpadMode === 'discount' && (
                                    <div className="flex gap-1 mt-2">
                                        <Button
                                            variant={discountType === 'percent' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => {
                                                setDiscountType('percent');
                                                setNumpadBuffer('');
                                                if (selectedLine !== null) {
                                                    setOrderLines((prev) =>
                                                        prev.map((l, i) =>
                                                            i === selectedLine ? { ...l, remise_type: 'percent', remise_value: 0 } : l
                                                        )
                                                    );
                                                }
                                            }}
                                        >
                                            <Percent className="h-3 w-3 mr-1" />
                                            Pourcentage
                                        </Button>
                                        <Button
                                            variant={discountType === 'fixed' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1 text-xs"
                                            onClick={() => {
                                                setDiscountType('fixed');
                                                setNumpadBuffer('');
                                                if (selectedLine !== null) {
                                                    setOrderLines((prev) =>
                                                        prev.map((l, i) =>
                                                            i === selectedLine ? { ...l, remise_type: 'fixed', remise_value: 0 } : l
                                                        )
                                                    );
                                                }
                                            }}
                                        >
                                            <Minus className="h-3 w-3 mr-1" />
                                            Montant fixe
                                        </Button>
                                    </div>
                                )}

                                {numpadBuffer && (
                                    <p className="mt-1 text-center text-xs text-muted-foreground">
                                        {numpadMode === 'qty' ? 'Quantité' : numpadMode === 'price' ? 'Prix' : (
                                            discountType === 'percent' ? 'Remise (%)' : 'Remise (MGA)'
                                        )}: {numpadBuffer}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Numpad grid */}
                        {selectedLine !== null && (
                            <div className="grid grid-cols-4 gap-1 px-4 py-2">
                                {['1', '2', '3', '⌫', '4', '5', '6', 'C', '7', '8', '9', '.', '+1', '0', '-1'].map(
                                    (key) => (
                                        <Button
                                            key={key}
                                            variant={key === 'C' ? 'destructive' : 'outline'}
                                            size="sm"
                                            className="h-10 text-sm font-medium"
                                            onClick={() => {
                                                if (key === '+1') updateLineQuantity(selectedLine, 1);
                                                else if (key === '-1') updateLineQuantity(selectedLine, -1);
                                                else handleNumpadPress(key);
                                            }}
                                        >
                                            {key === '⌫' ? <Delete className="h-4 w-4" /> : key}
                                        </Button>
                                    )
                                )}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-1 px-4 py-3">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Sous-total</span>
                                <span>{fmt(orderLines.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0))}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex items-center justify-between text-sm text-orange-500">
                                    <span>Remises</span>
                                    <span>-{fmt(totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>TVA ({TVA_RATE}%)</span>
                                <span>{fmt(tva)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <div className="px-4 pb-4">
                            <Button
                                className="w-full h-12 text-base font-semibold"
                                size="lg"
                                disabled={orderLines.length === 0 || processing}
                                onClick={handleSubmit}
                            >
                                {processing ? (
                                    'Traitement...'
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Valider — {fmt(total)}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ═══════════ RIGHT PANEL — Products ═══════════ */}
                <div className="flex flex-1 flex-col overflow-hidden bg-background">
                    {/* Search bar + Scan button */}
                    <div className="border-b border-border px-4 py-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                        onClick={() => {
                                            setSearchQuery('');
                                            searchInputRef.current?.focus();
                                        }}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => setScannerOpen(true)}
                                title="Scanner un code-barres"
                            >
                                <ScanBarcode className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="border-b border-border px-4 py-2">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <Button
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                size="sm"
                                className="shrink-0 text-xs"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tous
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id_categorie}
                                    variant={selectedCategory === cat.id_categorie ? 'default' : 'outline'}
                                    size="sm"
                                    className="shrink-0 text-xs"
                                    onClick={() =>
                                        setSelectedCategory(
                                            selectedCategory === cat.id_categorie ? null : cat.id_categorie
                                        )
                                    }
                                >
                                    {cat.nom}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredProducts.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Package className="h-12 w-12 opacity-30" />
                                <p className="text-sm font-medium">Aucun produit trouvé</p>
                                {searchQuery && (
                                    <p className="text-xs">
                                        Essayez avec un autre terme de recherche
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {filteredProducts.map((product) => {
                                    const inOrder = orderLines.find(
                                        (l) => l.id_variante === product.id_variante
                                    );
                                    const isLowStock = product.stock <= 5;

                                    return (
                                        <button
                                            key={product.id_variante}
                                            type="button"
                                            onClick={() => addProduct(product)}
                                            disabled={product.stock <= 0 || (inOrder ? inOrder.quantite >= product.stock : false)}
                                            className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                                                inOrder ? 'ring-2 ring-primary/40' : ''
                                            }`}
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                                {product.image_url ? (
                                                    <img
                                                        src={resolveImageUrl(product.image_url) ?? undefined}
                                                        alt={product.nom}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-8 w-8 text-muted-foreground/40" />
                                                    </div>
                                                )}

                                                {/* LE BADGE PACK */}
                                                {product.est_pack && (
                                                    <div className="absolute top-1.5 left-1.5 z-10">
                                                        <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] px-1.5 py-0 shadow border-none">
                                                            PACK
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Quantity badge */}
                                                {inOrder && (
                                                    <div className="absolute top-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow">
                                                        {inOrder.quantite}
                                                    </div>
                                                )}

                                                {/* Low stock badge */}
                                                {isLowStock && (
                                                    <div className="absolute bottom-1.5 left-1.5">
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            {product.stock} en stock
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-1 flex-col gap-1 p-2.5">
                                                <p className="line-clamp-2 text-left text-xs font-medium leading-tight">
                                                    {product.nom}
                                                </p>
                                                <p className="mt-auto text-left text-sm font-bold text-primary">
                                                    {fmt(product.prix)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
