import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, AlertTriangle } from 'lucide-react';

export interface LigneItem {
    id_variante: number;
    designation: string;
    quantite: number;
    prix_unitaire: number;
    taux_tva: number;
    remise_ligne: number;
    stock_reel: number;
}

interface LineItemsTableProps {
    lignes: LigneItem[];
    onUpdateQuantite: (index: number, quantite: number) => void;
    onRemove: (index: number) => void;
    disabled?: boolean;
}

export function LineItemsTable({ lignes, onUpdateQuantite, onRemove, disabled }: LineItemsTableProps) {
    if (lignes.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                Aucun produit ajouté. Utilisez la recherche ci-dessus pour ajouter des produits.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Désignation</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="w-[120px] text-center">Quantité</TableHead>
                        <TableHead className="text-right">TVA (%)</TableHead>
                        <TableHead className="text-right">Sous-total</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lignes.map((ligne, index) => {
                        const sousTotal = ligne.prix_unitaire * ligne.quantite - ligne.remise_ligne;
                        return (
                            <TableRow key={`${ligne.id_variante}-${index}`} className={ligne.quantite >= ligne.stock_reel ? 'bg-orange-50 dark:bg-orange-950/20' : ''}>
                                <TableCell>
                                    <span className="font-medium">{ligne.designation}</span>
                                    {ligne.quantite >= ligne.stock_reel && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                            <AlertTriangle className="h-3 w-3" />
                                            Stock limité ({ligne.stock_reel})
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {Number(ligne.prix_unitaire).toLocaleString('fr-FR')} Ar
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={ligne.stock_reel}
                                        value={ligne.quantite}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (!isNaN(val) && val >= 1) {
                                                onUpdateQuantite(index, val);
                                            }
                                        }}
                                        className="h-8 w-20 text-center mx-auto"
                                        disabled={disabled}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    {ligne.taux_tva}%
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {sousTotal.toLocaleString('fr-FR')} Ar
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(index)}
                                        disabled={disabled}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
