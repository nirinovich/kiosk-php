import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import stocks from '@/routes/stocks';

interface Modele {
    name: string;
}

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: Modele;
}

type MouvementType = 'achat' | 'vente' | 'inventaire' | 'retour' | 'perte' | string;

interface Mouvement {
    id: number;
    type: MouvementType;
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

    // Breadcrumbs pour la navigation
    const breadcrumbs = [
        { title: 'Dashboard', href: '/' },
        { title: 'Stock', href: stocks.index() },
        { title: 'Historique', href: stocks.historique() },
    ];

    function typeBadge(type: MouvementType) {
        switch (type) {
            case 'vente':
                return <Badge variant="destructive">{type}</Badge>;
            case 'achat':
            return <Badge variant="secondary">{type}</Badge>;
        case 'inventaire':
            return <Badge variant="outline">{type}</Badge>;
            case 'retour':
                return <Badge variant="secondary">{type}</Badge>;
        case 'perte':
            return <Badge variant="destructive">{type}</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historique du Stock" />
            <div className="p-4">
                <div className="flex gap-2">
                    <Link 
                        href={stocks.index()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Inventaire
                    </Link>
                    <Link 
                        href={stocks.historique()}
                        className={buttonVariants({ variant: 'default' })}
                    >
                        Historique
                    </Link>
                    <Link 
                        href={stocks.modification()}
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