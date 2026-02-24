import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import products from '@/routes/products';



interface Produit_modele {
    id_modele: number,
    name: string,
    prix_standard: number,
    description: string
}

interface Props {
    produit_modele : Produit_modele
}

export default function Edit({produit_modele} : Props) {

    const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit a Product',
        href: products.edit(produit_modele.id_modele).url,
    },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name : produit_modele.name,
        prix_standard :produit_modele.prix_standard,
        description:produit_modele.description
    });

    const handleUpdate = (e: React.FormEvent) =>{
        e.preventDefault();
        put(products.update(produit_modele.id_modele).url)
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Update a Product" />
            <div className='m-4'>
                <form onSubmit={handleUpdate} className='space-y-4'>
                    { /* Display error */}

                    {Object.keys(errors).length > 0 && (
                        <Alert>
                          <InfoIcon/>
                          <AlertTitle>Diso elah</AlertTitle>
                          <AlertDescription>
                            <ul>
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message as string}</li>
                                ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor='product name'>Name</Label>
                        <Input placeholder="Product Name" value={data.name} onChange={(e)=> setData('name',e.target.value)}></Input>
                    </div>
                    <div>
                        <Label htmlFor='product price'>Price</Label>
                        <Input placeholder="Prix Standard" value={data.prix_standard} onChange={(e)=> setData('prix_standard',Number(e.target.value))}></Input>
                    </div>
                    <div>
                        <Label htmlFor='product description'>Description</Label>
                        <Textarea placeholder="Description" value={data.description} onChange={(e)=> setData('description',e.target.value)}/>
                    </div>
                    <Button disabled={processing} type="submit">Update Product</Button>
                </form>
            </div>
        </AppLayout>
    );
}
