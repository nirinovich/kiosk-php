import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Users, X } from 'lucide-react';

export interface ClientOption {
    id_client: number;
    name: string;
    email: string | null;
    telephone: string | null;
}

interface ClientSelectProps {
    clients: ClientOption[];
    value: number | null;
    onChange: (clientId: number | null) => void;
    disabled?: boolean;
}

export function ClientSelect({ clients, value, onChange, disabled }: ClientSelectProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedClient = value ? clients.find(c => c.id_client === value) : null;

    const filtered = query.trim().length > 0
        ? clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
        : clients;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleSelect(clientId: number | null) {
        onChange(clientId);
        setQuery('');
        setIsOpen(false);
    }

    if (selectedClient) {
        return (
            <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="font-medium">{selectedClient.name}</span>
                        {selectedClient.email && (
                            <span className="ml-2 text-muted-foreground">({selectedClient.email})</span>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    disabled={disabled}
                    className="rounded-sm p-1 hover:bg-accent cursor-pointer"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un client ou laisser vide (vente au comptoir)..."
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

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    <button
                        type="button"
                        className="flex w-full items-center px-3 py-2 text-sm italic text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => handleSelect(null)}
                    >
                        Aucun client (vente au comptoir)
                    </button>
                    {filtered.map((client) => (
                        <button
                            key={client.id_client}
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            onClick={() => handleSelect(client.id_client)}
                        >
                            <span className="font-medium">{client.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {client.email || client.telephone || ''}
                            </span>
                        </button>
                    ))}
                    {filtered.length === 0 && query.trim().length > 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            Aucun client trouvé
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
