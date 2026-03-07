import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, PlusIcon, CheckIcon } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

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
    image_url: string,
    description: string
}

interface PagePropos {
    flash: {
        message?: string
    }
    produit_modele : Produit_modele[]
    filters: {
        search?: string
    }
}

export default function Index() {
    const { produit_modele, flash, filters } = usePage().props as PagePropos;

    const {processing, delete:destroy} = useForm();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newCatNom, setNewCatNom] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [catSaving, setCatSaving] = useState(false);
    const [catError, setCatError] = useState('');
    const [catSuccess, setCatSuccess] = useState('');

    const handleDelete =(id:number, name:string) => {
        if(confirm(`Do you want to delete a product - ${id} . ${name}`)){
            destroy(`/products/${id}`);
        }
    }

    const handleCreateCategory = async () => {
        if (!newCatNom.trim()) {
            setCatError('Le nom est obligatoire.');
            return;
        }
        setCatSaving(true);
        setCatError('');
        setCatSuccess('');
        try {
            const response = await axios.post('/categories', {
                nom: newCatNom,
                description: newCatDesc,
            });
            setCatSuccess(`Catégorie "${response.data.nom}" créée avec succès !`);
            setNewCatNom('');
            setNewCatDesc('');
            setTimeout(() => {
                setDialogOpen(false);
                setCatSuccess('');
            }, 1200);
        } catch (error: any) {
            if (error.response?.status === 422) {
                const msgs = error.response.data.errors;
                setCatError(Object.values(msgs).flat().join(' '));
            } else {
                setCatError('Une erreur est survenue.');
            }
        } finally {
            setCatSaving(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(
            products.index().url,
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className='m-4 flex gap-2'>
                <Link href={products.create()}><Button>Create a product</Button></Link>

                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); setCatError(''); setCatSuccess(''); }}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PlusIcon className="h-4 w-4 mr-2" /> Créer une catégorie
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nouvelle catégorie</DialogTitle>
                            <DialogDescription>Créez une catégorie qui sera disponible lors de la création de produits.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label htmlFor="new-cat-nom">Nom *</Label>
                                <Input
                                    id="new-cat-nom"
                                    placeholder="Ex: Électronique"
                                    value={newCatNom}
                                    onChange={(e) => setNewCatNom(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-cat-desc">Description</Label>
                                <Textarea
                                    id="new-cat-desc"
                                    placeholder="Description optionnelle"
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            {catError && <p className="text-sm text-destructive">{catError}</p>}
                            {catSuccess && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckIcon className="h-4 w-4" /> {catSuccess}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                            <Button type="button" onClick={handleCreateCategory} disabled={catSaving}>
                                {catSaving ? 'Création...' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <input
                    type="text"
                    placeholder="Search product..."
                    defaultValue={filters.search}
                    onChange={handleSearch}
                    className="border rounded px-3 py-2"
                />
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
                                <TableHead>Image</TableHead>
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
                                    <TableCell><img src={produit_modele.image_url} alt={produit_modele.name} className="w-16 h-16 object-cover rounded" /></TableCell>
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
