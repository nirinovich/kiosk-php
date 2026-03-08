import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Historique from './Historique';
import Modification from './Modification';
import { Badge } from '@/components/ui/badge';

interface Modele {
    name: string;
}

interface Variante {
    id_variante: number;
    reference_sku: string;
    modele: Modele;
    stock_reel: number;
}

interface PageProps {
    variantes: Variante[];
}

export default function Index() {
    const { variantes } = usePage().props as unknown as PageProps;

    function stockBadge(stock: number) {
        if (stock <= 0) return <Badge variant="destructive">Rupture</Badge>;
        if (stock <= 5) return <Badge variant="destructive">{stock}</Badge>;
        return <Badge variant="destructive">{stock}</Badge>;
    }

    const voirHistorique = (idVariante: number) => {
        router.get('/stock/historique', { id_variante: idVariante });
    };

    return (
        <AppLayout>
            <Head title="Stock" />
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <Link 
                        href="/stock" 
                        className={buttonVariants({ variant: 'default' })}
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
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Modifier
                    </Link>
                </div>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Variante</TableHead>
                                    <TableHead>Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variantes.map((v) => (
                                    <TableRow key={v.id_variante}>
                                        <TableCell>{v.modele.name}</TableCell>
                                        <TableCell>{v.reference_sku}</TableCell>
                                        <TableCell>{stockBadge(v.stock_reel)}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => voirHistorique(v.id_variante)}>Voir Historique</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
            </div>
        </AppLayout>
    );
}