import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';

interface Categorie {
    id_categorie: number;
    nom: string;
}

interface Props {
    categories: Categorie[];
    value: number | string;
    onChange: (value: number | string) => void;
    onCategoryCreated: (cat: Categorie) => void;
}

export function CategoryCombobox({ categories, value, onChange, onCategoryCreated }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newCatNom, setNewCatNom] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!newCatNom.trim()) {
            setError('Le nom est obligatoire.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const response = await axios.post('/categories', {
                nom: newCatNom,
                description: newCatDesc,
            });
            const newCat: Categorie = response.data;
            onCategoryCreated(newCat);
            onChange(newCat.id_categorie);
            setNewCatNom('');
            setNewCatDesc('');
            setDialogOpen(false);
        } catch (err: any) {
            if (err.response?.status === 422) {
                const msgs = err.response.data.errors;
                setError(Object.values(msgs).flat().join(' '));
            } else {
                setError('Une erreur est survenue.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <Label>Catégorie</Label>
            <div className="flex gap-2 mt-1">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">-- Choisissez une catégorie --</option>
                    {categories.map((cat) => (
                        <option key={cat.id_categorie} value={cat.id_categorie}>
                            {cat.nom}
                        </option>
                    ))}
                </select>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Nouvelle catégorie"
                    onClick={() => setDialogOpen(true)}
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setError(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle catégorie</DialogTitle>
                        <DialogDescription>Créez une catégorie qui sera immédiatement disponible.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="combobox-cat-nom">Nom *</Label>
                            <Input
                                id="combobox-cat-nom"
                                placeholder="Ex : Électronique"
                                value={newCatNom}
                                onChange={(e) => setNewCatNom(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="combobox-cat-desc">Description</Label>
                            <Textarea
                                id="combobox-cat-desc"
                                placeholder="Description optionnelle"
                                value={newCatDesc}
                                onChange={(e) => setNewCatDesc(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                        <Button type="button" onClick={handleCreate} disabled={saving}>
                            {saving ? 'Création...' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
