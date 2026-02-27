import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import clients from '@/routes/clients';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: clients.index().url,
    },
];

interface Client {
    id_client: number,
    name: string,
    email: string,
    phone: string,
    adresse: string,
    type_client: string,
    nif: string,
    stat: string,
    rcs_ville: string
}

interface PagePropos {
    flash: {
        message?: string
    }
    client : Client[]
}

export default function Index() {
    const { client, flash } = usePage().props as PagePropos;

    const {processing, delete:destroy} = useForm();

    const handleDelete =(id:number, name:string) => {
        if(confirm(`Do you want to delete a client - ${id} . ${name}`)){
            destroy(`/clients/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className='m-4'>
                <Link href={clients.create()}><Button>Create a client</Button></Link>
            </div>
            <div>
                <div>
                    {flash.message && (
                        <Alert>
                            <InfoIcon />
                            <AlertTitle>Notification</AlertTitle>
                            <AlertDescription>
                                {flash.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            {client.length > 0 && (
                <div className='m-4'>
                    <Table>
                        <TableCaption>A list of Clients</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Client Type</TableHead>
                                <TableHead>NIF</TableHead>
                                <TableHead>Stat</TableHead>
                                <TableHead>RCS City</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {client.map((client)=>(
                                <TableRow>
                                    <TableCell className="font-medium">{client.id_client}</TableCell>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>{client.adresse}</TableCell>
                                    <TableCell>{client.type_client}</TableCell>
                                    <TableCell>{client.nif}</TableCell>
                                    <TableCell>{client.stat}</TableCell>
                                    <TableCell>{client.rcs_ville}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={clients.edit(client.id_client).url}><Button className='bg-slate-600 hover:bg-slate-700'>Edit</Button></Link>
                                        <Button disabled={processing} onClick={()=>handleDelete(client.id_client, client.name)} className='bg-red-600 hover:bg-red-700'>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppLayout>
    );
}
