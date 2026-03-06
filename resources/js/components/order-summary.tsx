import type { LigneItem } from '@/components/line-items-table';

interface OrderSummaryProps {
    lignes: LigneItem[];
}

export function OrderSummary({ lignes }: OrderSummaryProps) {
    const totals = lignes.reduce(
        (acc, ligne) => {
            const sousTotal = ligne.prix_unitaire * ligne.quantite - ligne.remise_ligne;
            const tva = sousTotal * (ligne.taux_tva / 100);
            return {
                ht: acc.ht + sousTotal,
                tva: acc.tva + tva,
            };
        },
        { ht: 0, tva: 0 }
    );

    const ttc = totals.ht + totals.tva;

    return (
        <div className="rounded-md border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Total HT</span>
                    <span>{totals.ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                </div>
                <div className="flex justify-between">
                    <span>TVA</span>
                    <span>{totals.tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total TTC</span>
                    <span>{ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</span>
                </div>
            </div>
            {lignes.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Ajoutez des produits pour voir le récapitulatif.</p>
            )}
        </div>
    );
}
