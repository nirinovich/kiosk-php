import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import clients from '@/routes/clients';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create a New Client',
        href: clients.create().url,
    },
];

interface FormState {
    name: string;
    email: string;
    telephone: string;
    adresse: string;
    type_client: string;
    nif: string;
    stat: string;
    rcs_ville: string;
}

export default function Create() {

    const { data, setData, post, processing, errors } = useForm<FormState>({
        name:'',
        email:'',
        telephone:'',
        adresse:'',
        type_client:'',
        nif:'',
        stat:'',
        rcs_ville:'',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(clients.store().url, {
            // S'il y a une erreur renvoyée par Laravel, on l'affiche dans la console
            onError: (erreursLaravel) => {
                console.error("🚨 Laravel a refusé l'enregistrement :", erreursLaravel);
            },
            // Si tout se passe bien
            onSuccess: () => {
                console.log("✅ Client enregistré avec succès !");
            }
        });
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a New Client" />
            <div className='m-4'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    
                    {/* --- 1. LES INFOS DE BASE --- */}
                    <div className="space-y-4 p-4 border rounded-md bg-white">
                        <h2 className="text-lg font-semibold border-b pb-2">Client</h2>
                        <div>
                            <Label htmlFor='client name'>Name</Label>
                            <Input placeholder="Client Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client email'>Email</Label>
                            <Input type="email" placeholder="Client Email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client telephone'>Telephone</Label>
                            <Input placeholder="Client Telephone" value={data.telephone} onChange={(e) => setData('telephone', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client adresse'>Adresse</Label>
                            <Textarea placeholder="Client Adresse" value={data.adresse} onChange={(e) => setData('adresse', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client type'>Type de Client</Label>
                            <select
                                id="type_client"
                                value={data.type_client}
                                onChange={(e) => setData('type_client', e.target.value as any)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            >
                                <option value="">-- Choisissez un type de client --</option>
                                <option value="particulier">Particulier</option>
                                <option value="entreprise">Entreprise</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor='client nif'>NIF</Label>
                            <Input placeholder="Client NIF" value={data.nif} onChange={(e) => setData('nif', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client stat'>STAT</Label>
                            <Input placeholder="Client STAT" value={data.stat} onChange={(e) => setData('stat', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='client rcs_ville'>RCS Ville</Label>
                            <Input placeholder="Client RCS Ville" value={data.rcs_ville} onChange={(e) => setData('rcs_ville', e.target.value)} />
                        </div>
                    </div>
                    <Button disabled={processing} type="submit">Enregistrer le Client</Button>
                </form>
            </div>
        </AppLayout>
    );
}
