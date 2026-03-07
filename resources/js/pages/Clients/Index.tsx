import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, PlusIcon, SearchIcon, UserCircle, Pencil, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import clients from '@/routes/clients';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Clients', href: clients.index().url },
];

interface Client {
    id_client: number;
    name: string;
    email: string;
    phone: string;
    adresse: string;
    type_client: string;
    nif: string;
    stat: string;
    rcs_ville: string;
}

interface PageProps {
    flash: { message?: string };
    client: Client[];
    filters: { search?: string };
}

export default function Index() {
    const { client, flash, filters } = usePage().props as unknown as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Supprimer le client « ${name} » ? Cette action est irréversible.`)) {
            destroy(`/clients/${id}`);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(clients.index().url, { search: e.target.value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />

            <div className="p-4 space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un client..."
                            defaultValue={filters.search}
                            onChange={handleSearch}
                            className="pl-9"
                        />
                    </div>

                    <Link href={clients.create()}>
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau client
                        </Button>
                    </Link>
                </div>

                {/* Flash message */}
                {flash.message && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Client table or empty state */}
                {client.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead>Adresse</TableHead>
                                    <TableHead className="text-center">Type</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {client.map((c) => (
                                    <TableRow key={c.id_client}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                                        <TableCell>{c.phone || '—'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{c.adresse || '—'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={c.type_client === 'entreprise' ? 'default' : 'secondary'}>
                                                {c.type_client === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={clients.edit(c.id_client).url}>
                                                    <Button variant="ghost" size="icon" title="Modifier">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={processing}
                                                    onClick={() => handleDelete(c.id_client, c.name)}
                                                    title="Supprimer"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Aucun client</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Commencez par créer votre premier client.
                        </p>
                        <Link href={clients.create()}>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Créer votre premier client
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
