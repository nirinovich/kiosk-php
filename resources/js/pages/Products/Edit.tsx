import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import products from '@/routes/products';

interface Valeur{
    id_valeur : number,
    nom_valeur: string
}

interface Attribut{
    id_attribut: number,
    nom: string,
    valeurs :Valeur[]
}

interface VarianteDepuisBDD {
    id_variante: number;
    reference_sku: string;
    surcout_prix: number;
    valeurs: Valeur[];
}

interface VarianteForm {
    id_variante?: number; 
    sku: string;
    surcout: number;
    valeurs_ids: number[];
    valeurs_custom: { attribut: string; valeur: string }[];
}

interface Produit_modele {
    id_modele: number,
    name: string,
    prix_standard: number,
    description: string,
    variantes: VarianteDepuisBDD[];
}

interface Props {
    produit_modele : Produit_modele;
    attributs: Attribut[];
}

export default function Edit({produit_modele, attributs} : Props) {

    const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit a Product',
        href: products.edit(produit_modele.id_modele).url,
    },
    ];

    const initialVariantes: VarianteForm[] = produit_modele.variantes?.map((variante) => ({
        id_variante: variante.id_variante,
        sku: variante.reference_sku || '',
        surcout: Number(variante.surcout_prix) || 0,
        valeurs_ids: variante.valeurs.map((v) => v.id_valeur),
        valeurs_custom: []
    }));

    const { data, setData, put, processing, errors } = useForm({
        name : produit_modele.name,
        prix_standard :produit_modele.prix_standard,
        description:produit_modele.description,
        variantes: initialVariantes
    });

    const ajouterVariante = () => {
        setData('variantes',[
            ...data.variantes,
            {
                sku: '', 
                surcout: 0, 
                valeurs_ids: [], 
                valeurs_custom: []
            }
        ]);
    };

    const supprimerVariante = (indexASupprimer: number) => {
        setData('variantes', data.variantes.filter((_, index) => index !== indexASupprimer));
    }

    const toggleValeurId = (indexVariante: number, idValeur: number) => {
    setData('variantes', data.variantes.map((variante, index) => {
        if (index !== indexVariante) return variante;
            const nouvellesValeursIds = variante.valeurs_ids.includes(idValeur)
                ? variante.valeurs_ids.filter(id => id !== idValeur)
                : [...variante.valeurs_ids, idValeur];

            return { ...variante, valeurs_ids: nouvellesValeursIds };
        }));
    };

    const handleUpdate = (e: React.FormEvent) =>{
        e.preventDefault();
        put(products.update(produit_modele.id_modele).url)
    };

    /// --------PARTIE FRONT END---------///
    /// ****Nataon ny back IA fotsiny****///

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Update a Product" />
            <div className='m-4 max-w-4xl mx-auto'>
                <form onSubmit={handleUpdate} className='space-y-8'>
                    
                    {/* Gestion des erreurs avec votre touche locale */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <InfoIcon className="h-4 w-4" />
                            <AlertTitle>Diso elah</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{message as string}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* SECTION 1 : Infos Générales */}
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h2 className="text-xl font-bold">Informations Générales</h2>
                        <div>
                            <Label htmlFor='name'>Name</Label>
                            <Input id='name' placeholder="Product Name" value={data.name} onChange={(e)=> setData('name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='prix_standard'>Price</Label>
                            <Input id='prix_standard' type="number" placeholder="Prix Standard" value={data.prix_standard} onChange={(e)=> setData('prix_standard', Number(e.target.value))} />
                        </div>
                        <div>
                            <Label htmlFor='description'>Description</Label>
                            <Textarea id='description' placeholder="Description" value={data.description} onChange={(e)=> setData('description', e.target.value)} />
                        </div>
                    </div>

                    {/* SECTION 2 : Variantes */}
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Variantes du produit</h2>
                            <Button type="button" onClick={ajouterVariante} variant="outline" className="flex items-center gap-2">
                                <PlusIcon className="w-4 h-4" /> Ajouter une variante
                            </Button>
                        </div>

                        {data.variantes.map((variante, index) => (
                            <div key={index} className="border p-4 rounded-md space-y-4 bg-gray-50 relative">
                                <div className="absolute top-4 right-4">
                                    <Button type="button" variant="destructive" size="icon" onClick={() => supprimerVariante(index)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <h3 className="font-semibold">Variante #{index + 1}</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>SKU / Référence</Label>
                                        <Input value={variante.sku} onChange={(e) => {
                                            const newVars = [...data.variantes];
                                            newVars[index].sku = e.target.value;
                                            setData('variantes', newVars);
                                        }} />
                                    </div>
                                    <div>
                                        <Label>Surcoût</Label>
                                        <Input type="number" value={variante.surcout} onChange={(e) => {
                                            const newVars = [...data.variantes];
                                            newVars[index].surcout = Number(e.target.value);
                                            setData('variantes', newVars);
                                        }} />
                                    </div>
                                </div>

                                {/* Les cases à cocher générées depuis les attributs */}
                                {attributs && attributs.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="mb-2 block">Attributs de la variante</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-3 rounded bg-white">
                                            {attributs.map((attr) => (
                                                <div key={attr.id_attribut}>
                                                    <span className="font-medium text-sm text-gray-700">{attr.nom} :</span>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        {attr.valeurs.map((val) => (
                                                            <label key={val.id_valeur} className="flex items-center gap-2 text-sm cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={variante.valeurs_ids.includes(val.id_valeur)} // Pré-cochage
                                                                    onChange={() => toggleValeurId(index, val.id_valeur)} // Action
                                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                />
                                                                {val.nom_valeur}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button disabled={processing} type="submit" className="w-full">
                        Update Product
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
