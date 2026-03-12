import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface Variante {
    id_variante: number;
    designation: string;
    reference_sku: string | null;
    code_barre: string | null;
    stock_reel: number;
    prix_unitaire: number;
    est_pack: boolean;
}

interface ProductSearchProps {
    variantes: Variante[];
    onSelect: (variante: Variante) => void;
    disabled?: boolean;
}

export function ProductSearch({ variantes, onSelect, disabled }: ProductSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query.trim().length > 0
        ? variantes.filter((v) => {
            const q = query.toLowerCase();
            return (
                v.designation.toLowerCase().includes(q) ||
                (v.reference_sku && v.reference_sku.toLowerCase().includes(q)) ||
                (v.code_barre && v.code_barre.toLowerCase().includes(q))
            );
        })
        : variantes;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSelect(variante: Variante) {
        onSelect(variante);
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    placeholder="Rechercher un produit (nom, SKU, code-barre)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    className="pl-9"
                />
            </div>

            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {filtered.map((variante) => (
                        <button
                            key={variante.id_variante}
                            type="button"
                            className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${variante.stock_reel === 0 ? 'opacity-50' : ''}`}
                            onClick={() => handleSelect(variante)}
                            disabled={variante.stock_reel === 0}
                        >
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{variante.designation}</span>
                                {/* LE BADGE PACK ICI */}
                                {variante.est_pack && (
                                    <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] px-1.5 py-0 border-none">
                                        PACK
                                    </Badge>
                                )}
                            </div>
                            {variante.reference_sku && (
                                <span className="text-xs text-muted-foreground">SKU: {variante.reference_sku}</span>
                            )}
                        </div>
                            <div className="flex flex-col items-end text-xs">
                                <span className="font-medium">{Number(variante.prix_unitaire).toLocaleString('fr-FR')} Ar</span>
                                <span className={variante.stock_reel === 0 ? 'text-destructive font-medium' : variante.stock_reel <= 5 ? 'text-orange-500' : 'text-muted-foreground'}>
                                    {variante.stock_reel === 0 ? 'Rupture de stock' : `Stock: ${variante.stock_reel}`}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.trim().length > 0 && filtered.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
                    Aucun produit trouvé pour « {query} »
                </div>
            )}
        </div>
    );
}
