import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, TrashIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create a New Product',
        href: products.create().url,
    },
];

interface Categorie {
    id_categorie: number;
    nom: string;
}

interface Valeur{
    id_valeur : number,
    nom_valeur: string
}

interface Attribut{
    id_attribut: number,
    nom: string,
    valeurs :Valeur[]
}

interface Props{
    attributs: Attribut[];
    categories: Categorie[];
}

interface VarianteForm{
    sku: string,
    surcout: number,
    valeurs_ids: number[],
    valeurs_custom: { attribut: string; valeur: string }[];
}

interface FormState {
    name: string;
    prix_standard: string | number;
    description: string;
    id_categorie: number | string;
    variantes: VarianteForm[];
}

export default function Create({ attributs, categories }: Props) {

    const { data, setData, post, processing, errors } = useForm<FormState>({
        name:'',
        prix_standard:'',
        description:'',
        id_categorie: "",
        variantes: []
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
    
    const updateVariante = (index:number, field:keyof VarianteForm,value:string | number)=>{
        const nouvellesVariantes = [...data.variantes];
        //@ts-ignore :
        nouvellesVariantes[index][field] = value;
        setData('variantes', nouvellesVariantes);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(products.store().url);
    };

    const toggleValeurID = (indexVariante:number, idValeur:number) =>{
        const nouvellesVariantes = [...data.variantes];
        const idsActuels = nouvellesVariantes[indexVariante].valeurs_ids;

        if (idsActuels.includes(idValeur)){
            nouvellesVariantes[indexVariante].valeurs_ids = idsActuels.filter((id: number) => id !== idValeur);
        }else{
            nouvellesVariantes[indexVariante].valeurs_ids.push(idValeur);
        }
        setData('variantes',nouvellesVariantes);
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a New Product" />
            <div className='m-4'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    
                    {/* --- 1. LES INFOS DE BASE --- */}
                    <div className="space-y-4 p-4 border rounded-md bg-white">
                        <h2 className="text-lg font-semibold border-b pb-2">Produit de base</h2>
                        <div>
                            <Label htmlFor='product name'>Name</Label>
                            <Input placeholder="Product Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='product price'>Price</Label>
                            <Input type="number" step="0.01" placeholder="Prix Standard" value={data.prix_standard} onChange={(e) => setData('prix_standard', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='product description'>Description</Label>
                            <Textarea placeholder="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor='categorie_id'>Catégorie</Label>
                            <select
                                id="id_categorie"
                                value={data.id_categorie}
                                onChange={(e) => setData('id_categorie', e.target.value as any)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            >
                                <option value="">-- Choisissez une catégorie --</option>
                                {categories.map((categorie) => (
                                    <option key={categorie.id_categorie} value={categorie.id_categorie}>
                                        {categorie.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- 2. LA LISTE DES VARIANTES --- */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Déclinaisons (Optionnel)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={ajouterVariante}>
                                <PlusIcon className="h-4 w-4 mr-2" /> Ajouter une variante
                            </Button>
                        </div>

                        {/* On boucle sur notre tableau data.variantes */}
                        {data.variantes.map((variante, index) => (
                            <div key={index} className="border p-4 rounded-md space-y-4 relative bg-slate-50">
                                
                                {/* Bouton de suppression en haut à droite */}
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => supprimerVariante(index)}>
                                    <TrashIcon className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-2 gap-4 pr-10">
                                    <div>
                                        <Label>Référence (SKU)</Label>
                                        <Input placeholder={`Ex: REF-${index + 1}`} value={variante.sku} onChange={(e) => updateVariante(index, 'sku', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Surcoût Prix (HT)</Label>
                                        <Input type="number" step="0.01" value={variante.surcout} onChange={(e) => updateVariante(index, 'surcout', e.target.value)} />
                                    </div>
                                </div>

                                {/* --- 3. LES ATTRIBUTS EXISTANTS (Cases à cocher) --- */}
                                <div className="pt-2">
                                    <Label className="mb-2 block text-muted-foreground">Attributs existants :</Label>
                                    <div className="flex flex-wrap gap-6">
                                        {attributs.map((attribut: any) => (
                                            <div key={attribut.id_attribut} className="space-y-1">
                                                <span className="text-sm font-medium">{attribut.nom}</span>
                                                <div className="flex flex-col gap-1">
                                                    {attribut.valeurs.map((valeur: any) => (
                                                        <label key={valeur.id_valeur} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="rounded border-gray-300"
                                                                checked={variante.valeurs_ids.includes(valeur.id_valeur)}
                                                                onChange={() => toggleValeurID(index, valeur.id_valeur)}
                                                            />
                                                            <span>{valeur.nom_valeur}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* --- 4. CRÉATION D'ATTRIBUTS À LA VOLÉE --- */}
                                <div className="mt-4 p-4 border border-dashed rounded-md bg-white">
                                    <Label className="mb-3 block text-sm font-medium text-slate-700">Attribut manquant ? Créez-le ici :</Label>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Nom (ex: Matière)</Label>
                                            {/* On donne un ID unique à l'input basé sur l'index de la variante */}
                                            <Input id={`attr-name-${index}`} className="h-8 mt-1" />
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Valeur (ex: Coton)</Label>
                                            <Input id={`attr-val-${index}`} className="h-8 mt-1" />
                                        </div>
                                        <Button 
                                            type="button" variant="secondary" size="sm" className="h-8"
                                            onClick={() => {
                                                // On récupère ce que l'utilisateur a tapé
                                                const attrInput = document.getElementById(`attr-name-${index}`) as HTMLInputElement;
                                                const valInput = document.getElementById(`attr-val-${index}`) as HTMLInputElement;
                                                
                                                if (attrInput.value && valInput.value) {
                                                    const nouvellesVariantes = [...data.variantes];
                                                    // On ajoute le nouveau texte dans notre tableau valeurs_custom
                                                    nouvellesVariantes[index].valeurs_custom.push({ 
                                                        attribut: attrInput.value, 
                                                        valeur: valInput.value 
                                                    });
                                                    setData('variantes', nouvellesVariantes);
                                                    
                                                    // On vide les cases pour qu'il puisse en taper un autre
                                                    attrInput.value = '';
                                                    valInput.value = '';
                                                }
                                            }}
                                        >
                                            Ajouter
                                        </Button>
                                    </div>

                                    {/* Affichage des petites "étiquettes" pour les attributs custom qu'il vient de créer */}
                                    {variante.valeurs_custom.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {variante.valeurs_custom.map((custom, cIdx) => (
                                                <span key={cIdx} className="text-xs bg-slate-900 text-white px-2 py-1 rounded-md">
                                                    {custom.attribut} : {custom.valeur}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>

                    <Button disabled={processing} type="submit">Enregistrer le Produit</Button>
                </form>
            </div>
        </AppLayout>
    );
}
