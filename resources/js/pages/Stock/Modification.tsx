import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import stocks from '@/routes/stocks';

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: { name: string };
}

interface PageProps {
    variantes: Variante[];
}

export default function Modification() {
    const { variantes } = usePage().props as unknown as PageProps;

    const { data, setData, post, processing, reset } = useForm({
        id_variante: '',
        quantite: 0,
        type: '',
        motif: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(stocks.ajustement().url, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Modifier le Stock" />
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Link 
                        href="/stock" 
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Inventaire
                    </Link>
                    <Link 
                        href="/stock/historique" 
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Historique
                    </Link>
                    <Link 
                        href="/stock/modification" 
                        className={buttonVariants({ variant: 'default' })}
                    >
                        Modifier
                    </Link>
                </div>
                <h2 className="text-lg font-semibold">Modification du stock</h2>
                <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
                    <div>
                        <label className="block mb-1">Produit</label>
                        <select
                            className="border rounded px-2 py-1 w-full"
                            value={data.id_variante}
                            onChange={(e) => setData('id_variante', e.target.value)}
                        >
                            <option value="">Sélectionner</option>
                            {variantes.map((v) => (
                                <option key={v.id_variante} value={v.id_variante}>
                                    {v.modele.name} ({v.reference_sku})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Quantité</label>
                        <Input
                            type="number"
                            value={data.quantite}
                            onChange={(e) => setData('quantite', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Type</label>
                        <select
                            className="border rounded px-2 py-1 w-full"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            <option value="inventaire">Inventaire</option>
                            <option value="achat">Achat</option>
                            <option value="vente">Vente</option>
                            <option value="perte">Perte</option>
                            <option value="retour">Retour</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Motif</label>
                        <Input
                            type="text"
                            value={data.motif}
                            onChange={(e) => setData('motif', e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Modifier le Stock
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}