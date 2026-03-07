import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Valeur {
    id_valeur: number;
    nom_valeur: string;
}

interface Attribut {
    id_attribut: number;
    nom: string;
    nom_attribut?: string;
    valeurs: Valeur[];
}

export interface VarianteFormData {
    id_variante?: number;
    sku: string;
    surcout: number;
    stock_reel: number;
    valeurs_ids: number[];
    valeurs_custom: { attribut: string; valeur: string }[];
}

interface Props {
    index: number;
    variante: VarianteFormData;
    attributs: Attribut[];
    onUpdate: (index: number, field: keyof VarianteFormData, value: any) => void;
    onDelete: (index: number) => void;
    onToggleValeur: (indexVariante: number, idValeur: number) => void;
    onAddCustomAttr: (indexVariante: number, attribut: string, valeur: string) => void;
}

export function VariantCard({ index, variante, attributs, onUpdate, onDelete, onToggleValeur, onAddCustomAttr }: Props) {
    const handleAddCustom = () => {
        const attrInput = document.getElementById(`attr-name-${index}`) as HTMLInputElement;
        const valInput = document.getElementById(`attr-val-${index}`) as HTMLInputElement;

        if (attrInput?.value && valInput?.value) {
            onAddCustomAttr(index, attrInput.value, valInput.value);
            attrInput.value = '';
            valInput.value = '';
        }
    };

    return (
        <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Variante #{index + 1}</CardTitle>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(index)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* SKU, Surcoût, Stock row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label className="text-xs">Référence (SKU)</Label>
                        <Input
                            placeholder={`REF-${index + 1}`}
                            value={variante.sku}
                            onChange={(e) => onUpdate(index, 'sku', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Surcoût prix (HT)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={variante.surcout}
                            onChange={(e) => onUpdate(index, 'surcout', Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Stock initial</Label>
                        <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={variante.stock_reel}
                            onChange={(e) => onUpdate(index, 'stock_reel', Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Existing attributes */}
                {attributs.length > 0 && (
                    <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Attributs</Label>
                        <div className="flex flex-wrap gap-6 rounded-md border p-3 bg-muted/30">
                            {attributs.map((attribut) => (
                                <div key={attribut.id_attribut} className="space-y-1">
                                    <span className="text-xs font-medium">{attribut.nom_attribut || attribut.nom}</span>
                                    <div className="flex flex-col gap-1">
                                        {attribut.valeurs.map((valeur) => (
                                            <label key={valeur.id_valeur} className="flex items-center space-x-2 text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-input"
                                                    checked={variante.valeurs_ids.includes(valeur.id_valeur)}
                                                    onChange={() => onToggleValeur(index, valeur.id_valeur)}
                                                />
                                                <span>{valeur.nom_valeur}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom attribute creation */}
                <div className="rounded-md border border-dashed p-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">Attribut manquant ? Créez-le ici :</Label>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Nom (ex : Matière)</Label>
                            <Input id={`attr-name-${index}`} className="h-8 mt-1" placeholder="Matière" />
                        </div>
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Valeur (ex : Coton)</Label>
                            <Input id={`attr-val-${index}`} className="h-8 mt-1" placeholder="Coton" />
                        </div>
                        <Button type="button" variant="secondary" size="sm" className="h-8" onClick={handleAddCustom}>
                            Ajouter
                        </Button>
                    </div>

                    {variante.valeurs_custom.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {variante.valeurs_custom.map((custom, cIdx) => (
                                <span key={cIdx} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
                                    {custom.attribut} : {custom.valeur}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
