import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: products.index().url,
    },
];

interface Produit_modele {
    id_modele: number,
    name: string,
    prix_standard: number,
    description: string
}

interface PagePropos {
    flash: {
        message?: string
    }
    produit_modele : Produit_modele[]
}

export default function Index() {
    const { produit_modele, flash } = usePage().props as PagePropos;

    const {processing, delete:destroy} = useForm();

    const handleDelete =(id:number, name:string) => {
        if(confirm(`Do you want to delete a product - ${id} . ${name}`)){
            destroy(`/products/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className='m-4'>
                <Link href={products.create()}><Button>Create a product</Button></Link>
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
            {produit_modele.length > 0 && (
                <div className='m-4'>
                    <Table>
                        <TableCaption>A list of Product</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {produit_modele.map((produit_modele)=>(
                                <TableRow>
                                    <TableCell className="font-medium">{produit_modele.id_modele}</TableCell>
                                    <TableCell>{produit_modele.name}</TableCell>
                                    <TableCell>{produit_modele.prix_standard}</TableCell>
                                    <TableCell>{produit_modele.description}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={products.edit(produit_modele.id_modele).url}><Button className='bg-slate-600 hover:bg-slate-700'>Edit</Button></Link>
                                        <Button disabled={processing} onClick={()=>handleDelete(produit_modele.id_modele, produit_modele.name)} className='bg-red-600 hover:bg-red-700'>Delete</Button>
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
