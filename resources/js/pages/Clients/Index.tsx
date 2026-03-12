import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { InfoIcon, PlusIcon, SearchIcon, UserCircle, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Clients', href: clients.index().url },
];

interface Client {
    id_client: number;
    name: string;
    email: string | null;
    telephone: string | null;
    adresse: string | null;
    type_client: string;
    nif: string;
    stat: string;
    rcs_ville: string;
    commandes_count: number;
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

                {/* Client grid or empty state */}
                {client.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {client.map((c) => (
                            <Card
                                key={c.id_client}
                                className="flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <UserCircle className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <CardTitle className="text-base font-semibold">
                                            {c.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={c.type_client === 'entreprise' ? 'default' : 'secondary'}>
                                                {c.type_client === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">
                                                {c.email ?? 'Pas d’information'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>
                                                {c.telephone ?? 'Pas d’information'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {c.adresse ?? 'Pas d’adresse renseignée'}
                                        </div>
                                        <div className="text-xs font-medium text-foreground pt-1">
                                            {c.commandes_count} commande(s)
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Link href={clients.edit(c.id_client).url} className="flex-1">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full justify-center"
                                            >
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Modifier
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={processing}
                                            onClick={() => handleDelete(c.id_client, c.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
