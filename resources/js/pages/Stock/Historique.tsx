import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

interface Modele {
    name: string;
}

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: Modele;
}

interface Mouvement {
    id: number;
    type: string;
    quantite: number;
    motif: string;
    created_at: string;
    variante: Variante;
}

interface PageProps {
    mouvements: Mouvement[];
}

export default function Historique() {
    const { mouvements = [] } = usePage().props as unknown as PageProps;

    function typeBadge(type: string) {
        switch (type) {
            case 'vente':
                return <Badge variant="destructive">{type}</Badge>;
            case 'achat':
                return <Badge variant="destructive">{type}</Badge>;
            case 'retour':
                return <Badge variant="secondary">{type}</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    }

    return (
        <AppLayout>
            <Head title="Historique du Stock" />
            <div className="p-4">
                <div className="flex gap-2">
                    <Link 
                        href="/stock" 
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Inventaire
                    </Link>
                    <Link 
                        href="/stock/historique" 
                        className={buttonVariants({ variant: 'default' })}
                    >
                        Historique
                    </Link>
                    <Link 
                        href="/stock/modification" 
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Modifier
                    </Link>
                </div>

                <h2 className="text-lg font-semibold mb-4">Historique des mouvements</h2>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Variante</TableHead>
                                <TableHead>Quantité</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mouvements.length > 0 ? (
                                mouvements.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>{m.variante.modele.name}</TableCell>
                                        <TableCell>{m.variante.reference_sku}</TableCell>
                                        <TableCell>{m.quantite}</TableCell>
                                        <TableCell>{typeBadge(m.type)}</TableCell>
                                        <TableCell>{m.motif}</TableCell>
                                        <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Aucun mouvement
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}