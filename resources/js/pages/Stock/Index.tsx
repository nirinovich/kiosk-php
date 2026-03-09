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
    est_pack: boolean;
    stock_disponible: number;
}

interface PageProps {
    variantes: Variante[];
}

export default function Index() {
    const { variantes } = usePage().props as unknown as PageProps;

    function stockBadge(variante: Variante) {
        const stock = variante.stock_disponible;
        
        if (stock <= 0) return <Badge variant="destructive">Rupture</Badge>;
        if (stock <= 5) return <Badge variant="destructive">{stock}</Badge>;
        return (
            <div className="flex items-center gap-2">
                <Badge variant="secondary">{stock}</Badge>
                {/* Petit indicateur visuel si c'est un pack */}
                {variante.est_pack && (
                    <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">
                        Pack
                    </span>
                )}
            </div>
        );
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
                                    <TableRow 
                                        key={v.id_variante}
                                        onClick={() => voirHistorique(v.id_variante)}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell>{v.modele.name}</TableCell>
                                        <TableCell>{v.reference_sku}</TableCell>
                                        <TableCell>{stockBadge(v)}</TableCell> 
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
            </div>
        </AppLayout>
    );
}