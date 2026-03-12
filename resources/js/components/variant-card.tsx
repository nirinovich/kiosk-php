import axios from 'axios';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export interface Categorie {
    id_categorie: number;
    nom: string;
}


export interface ComposantFormData {
    id_variante: number | string;
    quantite: number | string;
}

export interface VarianteFormData {
    id_variante?: number;
    sku: string;
    surcout: number;
    stock_reel: number;
    valeurs_ids: number[];
    valeurs_custom: { attribut: string; valeur: string }[];
    est_pack?:boolean;
    unite_mesure?: string;
    composants?: ComposantFormData[];
}

interface Props {
    index: number;
    variante: VarianteFormData;
    attributs: Attribut[];
    availableVariantes?: VarianteFormData[];
    categories?: Categorie[];
    isPackMode?: boolean;
    onUpdate: (index: number, field: keyof VarianteFormData, value: any) => void;
    onDelete: (index: number) => void;
    onToggleValeur: (indexVariante: number, idValeur: number) => void;
    onAddCustomAttr: (indexVariante: number, attribut: string, valeur: string) => void;
    onIngredientCreated?: (newIng: VarianteFormData) => void;
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function getUnitLabel(unit?: string): string {
    switch (unit) {
        case 'unité': return 'unité(s)';
        case 'kg': return 'kg';
        case 'gramme': return 'g';
        case 'litre': return 'L';
        default: return '';
    }
}

export function VariantCard({ index, variante, attributs, availableVariantes = [], categories = [], isPackMode = false, onUpdate, onDelete, onToggleValeur, onAddCustomAttr, onIngredientCreated }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientPrice, setNewIngredientPrice] = useState('0');
    const [newIngredientStock, setNewIngredientStock] = useState('0');
    const [newIngredientCategory, setNewIngredientCategory] = useState<string>('');
    const [newIngredientUnit, setNewIngredientUnit] = useState<string>('unité');
    const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
    const handleAddCustom = () => {
        const attrInput = document.getElementById(`attr-name-${index}`) as HTMLInputElement;
        const valInput = document.getElementById(`attr-val-${index}`) as HTMLInputElement;

        if (attrInput?.value && valInput?.value) {
            onAddCustomAttr(index, attrInput.value, valInput.value);
            attrInput.value = '';
            valInput.value = '';
        }
    };

    const handleTogglePack = (checked: boolean) => {
        onUpdate(index, 'est_pack', checked);
        if (checked && (!variante.composants || variante.composants.length === 0)) {
            onUpdate(index, 'composants', [{ id_variante: '', quantite: 1 }]);
        }
    };

    const addComposant = () => {
        const current = variante.composants || [];
        onUpdate(index, 'composants', [...current, { id_variante: '', quantite: 1 }]);
    };

    const updateComposant = (cIndex: number, field: keyof ComposantFormData, value: any) => {
        const current = [...(variante.composants || [])];
        current[cIndex] = { ...current[cIndex], [field]: value };
        onUpdate(index, 'composants', current);
    };

    const removeComposant = (cIndex: number) => {
        const current = [...(variante.composants || [])];
        current.splice(cIndex, 1);
        onUpdate(index, 'composants', current);
    };

    const handleCreateIngredient = async () => {
        if (!newIngredientName.trim()) return;
        setIsCreatingIngredient(true);
        try {
            const response = await axios.post('/products/quick-ingredient', {
                name: newIngredientName,
                prix_standard: Number(newIngredientPrice),
                stock_reel: Number(newIngredientStock),
                id_categorie: newIngredientCategory ? Number(newIngredientCategory) : null,
                unite_mesure: newIngredientUnit,
            });
            
            if (response.data?.id_variante) {
                const newIng = {
                    id_variante: response.data.id_variante,
                    sku: response.data.sku,
                    surcout: 0,
                    stock_reel: 0,
                    valeurs_ids: [],
                    valeurs_custom: []
                };
                
                if (onIngredientCreated) {
                    onIngredientCreated(newIng);
                }
                
                // Automatically add to components, replacing an empty one if it exists
                const current = variante.composants || [];
                const emptyIndex = current.findIndex(c => !c.id_variante);
                
                if (emptyIndex !== -1) {
                    updateComposant(emptyIndex, 'id_variante', response.data.id_variante);
                } else {
                    onUpdate(index, 'composants', [...current, { id_variante: response.data.id_variante, quantite: 1 }]);
                }
            }
        } catch (error) {
            console.error("Erreur création ingrédient :", error);
            alert("Une erreur est survenue lors de la création de l'ingrédient.");
        } finally {
            setIsCreatingIngredient(false);
            setNewIngredientName('');
            setNewIngredientPrice('0');
            setNewIngredientStock('0');
            setNewIngredientCategory('');
            setNewIngredientUnit('unité');
            setDialogOpen(false);
        }
    };

    return (
        <Card className={isPackMode ? "border-0 shadow-none bg-transparent" : "relative"}>
            {!isPackMode && (
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
            )}
            <CardContent className={isPackMode ? "p-0 space-y-4" : "space-y-4"}>
                {/* SKU, Surcoût, Stock row */}
                {!isPackMode && (
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
                    {!variante.est_pack && (
                    <div>
                        <Label className="text-xs">Stock initial</Label>
                        <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={variante.stock_reel}
                            onChange={(e) => onUpdate(index, 'stock_reel', Number(e.target.value))}
                            className="mt-1 bg-muted"
                            disabled
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Géré via les stocks</p>
                    </div>
                    )}
                </div>
                )}
                {/* 📦 ZONE PACK */}
                {isPackMode || variante.est_pack ? (
                <div className="rounded-lg border p-4 bg-primary/5 border-primary/20 space-y-4">
                    {!isPackMode && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={`pack-${index}`}
                                checked={variante.est_pack || false}
                                onChange={(e) => handleTogglePack(e.target.checked)}
                                className="h-4 w-4 rounded border-primary/50 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`pack-${index}`} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <Package className="h-4 w-4 text-primary" />
                                Cette déclinaison est un Pack (composé d'autres produits)
                            </Label>
                        </div>
                    )}

                    {(isPackMode || variante.est_pack) && (
                        <div className="space-y-3 pl-6 border-l-2 border-primary/30">
                            <Label className="text-xs text-muted-foreground">Contenu du pack</Label>
                            
                            {(variante.composants || []).map((composant, cIndex) => {
                                const selectedVariante = availableVariantes.find(v => v.id_variante == composant.id_variante);
                                const isUnite = selectedVariante?.unite_mesure === 'unité';
                                
                                return (
                                <div key={cIndex} className="flex flex-col sm:flex-row gap-2">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className="w-full sm:flex-1 justify-between bg-background"
                                        >
                                          {composant.id_variante
                                            ? availableVariantes.find(
                                                (v) => v.id_variante == composant.id_variante
                                              )?.sku
                                            : "-- Choisir un produit --"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                          <CommandInput placeholder="Rechercher un produit..." />
                                          <CommandList>
                                            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                            <CommandGroup>
                                              {availableVariantes.map((v) => (
                                                <CommandItem
                                                  key={v.id_variante}
                                                  value={v.sku}
                                                  onSelect={() => {
                                                    updateComposant(cIndex, 'id_variante', v.id_variante!);
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      composant.id_variante == v.id_variante ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                  {v.sku}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="any"
                                            min={isUnite ? "1" : (selectedVariante?.unite_mesure === 'gramme' ? "1" : "0.1")}
                                            placeholder="Qté"
                                            value={composant.quantite}
                                            onChange={e => updateComposant(cIndex, 'quantite', e.target.value)}
                                            className="w-24 h-9"
                                            required
                                        />
                                        {selectedVariante?.unite_mesure && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[40px]">
                                                {getUnitLabel(selectedVariante.unite_mesure)}
                                            </span>
                                        )}
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => removeComposant(cIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                );
                            })}

                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={addComposant} 
                                className="mt-2 h-8 text-xs border-dashed"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Ajouter un composant
                            </Button>

                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <div className="mt-4 p-4 border border-dashed rounded-md bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium">L'ingrédient n'existe pas ?</h4>
                                        <p className="text-xs text-muted-foreground">Créez un nouveau produit simple complet (Stock, Prix, Catégorie) sans quitter cette page.</p>
                                    </div>
                                    <DialogTrigger asChild>
                                        <Button type="button" size="sm" variant="secondary" className="shrink-0">
                                            <Plus className="h-4 w-4 mr-2" /> Créer un nouveau produit
                                        </Button>
                                    </DialogTrigger>
                                </div>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Création Rapide de Produit Simple</DialogTitle>
                                        <DialogDescription>
                                            Créez votre ingrédient avec ses informations de base. Il sera automatiquement ajouté à votre composition.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-3">
                                        <div>
                                            <Label>Nom du produit</Label>
                                            <Input 
                                                autoFocus
                                                placeholder="Ex: Fromage Cheddar, Huile (L)" 
                                                value={newIngredientName}
                                                onChange={e => setNewIngredientName(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Prix standard / Coût (HT)</Label>
                                                <Input 
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00" 
                                                    value={newIngredientPrice}
                                                    onChange={e => setNewIngredientPrice(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Stock Initial (Quantité)</Label>
                                                <Input 
                                                    type="number"
                                                    step="1"
                                                    placeholder="0" 
                                                    value={newIngredientStock}
                                                    onChange={e => setNewIngredientStock(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        {categories && categories.length > 0 && (
                                            <div>
                                                <Label>Catégorie (Optionnel)</Label>
                                                <select
                                                    value={newIngredientCategory}
                                                    onChange={(e) => setNewIngredientCategory(e.target.value)}
                                                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <option value="">-- Sans catégorie --</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id_categorie} value={cat.id_categorie}>
                                                            {cat.nom}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <Label>Unité de mesure</Label>
                                            <select
                                                value={newIngredientUnit}
                                                onChange={(e) => setNewIngredientUnit(e.target.value)}
                                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <option value="unité">Unité</option>
                                                <option value="kg">Kilogramme (kg)</option>
                                                <option value="gramme">Gramme (g)</option>
                                                <option value="litre">Litre (L)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                                        <Button 
                                            type="button" 
                                            disabled={isCreatingIngredient || !newIngredientName.trim()}
                                            onClick={handleCreateIngredient}
                                        >
                                            {isCreatingIngredient ? 'Création...' : 'Créer et ajouter'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
                ) : null}

                {/* Existing attributes (Hiden in strict pack mode) */}
                {!isPackMode && attributs.length > 0 && (
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

                {/* Custom attribute creation  (Hidden in strict pack mode) */}
                {!isPackMode && (
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
                )}
            </CardContent>
        </Card>
    );
}
