import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, UserPlus, ArrowRight, SkipForward, ArrowLeft, Users } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import KioskLogo from '@/components/kiosk-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

type Utilisateur = {
    id: number;
    name: string;
    email: string;
    role: string | null;
};

type PageProps = {
    step: number;
    company?: {
        nom_commercial?: string | null;
        email?: string | null;
        telephone?: string | null;
        adresse?: string | null;
        raison_sociale?: string | null;
        nif?: string | null;
        stat?: string | null;
        capital_social?: string | null;
        rcs_ville?: string | null;
        site_web?: string | null;
    } | null;
    utilisateurs?: Utilisateur[];
    flash: {
        message?: string;
    };
};

export default function OnboardingIndex() {
    const { step, company, utilisateurs = [] } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Bienvenue — Configuration initiale" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <div className="w-full max-w-lg space-y-8">
                    {/* Logo + progress */}
                    <div className="flex flex-col items-center gap-8">
                        <KioskLogo size="lg" />
                        <StepIndicator current={step} />
                    </div>

                    {step === 1 && <StepCompany company={company} />}
                    {step === 2 && <StepAdmin />}
                    {step === 3 && <StepUtilisateur utilisateurs={utilisateurs} />}
                    {step === 4 && <StepDone />}
                </div>
            </div>
        </>
    );
}

/* ───────── Step indicator ───────── */

function StepIndicator({ current }: { current: number }) {
    const steps = ['Entreprise', 'Administrateur', 'Utilisateurs', 'Terminé'];
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {steps.map((label, i) => {
                const n = i + 1;
                const active = n === current;
                const done = n < current;
                return (
                    <div key={label} className="flex items-center gap-1">
                        {i > 0 && <span className="mx-1 text-border">—</span>}
                        <span
                            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${done
                                ? 'bg-primary text-primary-foreground'
                                : active
                                    ? 'border-2 border-primary text-primary'
                                    : 'border border-border text-muted-foreground'
                                }`}
                        >
                            {done ? '✓' : n}
                        </span>
                        <span className={active ? 'font-medium text-foreground' : ''}>{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ───────── Step 1: Company information ───────── */

function StepCompany({ company }: { company?: PageProps['company'] }) {
    const form = useForm({
        nom_commercial: company?.nom_commercial ?? '',
        email: company?.email ?? '',
        telephone: company?.telephone ?? '',
        adresse: company?.adresse ?? '',
        raison_sociale: company?.raison_sociale ?? '',
        nif: company?.nif ?? '',
        stat: company?.stat ?? '',
        capital_social: company?.capital_social ?? '',
        rcs_ville: company?.rcs_ville ?? '',
        site_web: company?.site_web ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/onboarding/company');
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Informations de l'entreprise</CardTitle>
                <CardDescription>
                    Bienvenue dans Kiosk ! Commençons par enregistrer les informations simple de votre entreprise.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="company-nom-com">Nom commercial</Label>
                        <Input
                            id="company-nom-com"
                            value={form.data.nom_commercial}
                            onChange={(e) => form.setData('nom_commercial', e.target.value)}
                            required
                            autoFocus
                            placeholder="Kiosk"
                        />
                        <InputError message={form.errors.nom_commercial} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company-email">Adresse e-mail</Label>
                        <Input
                            id="company-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                            placeholder="contact@monentreprise.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company-phone">Téléphone</Label>
                        <Input
                            id="company-phone"
                            value={form.data.telephone}
                            onChange={(e) => form.setData('telephone', e.target.value)}
                            placeholder="+261 ..."
                        />
                        <InputError message={form.errors.telephone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company-address">Adresse</Label>
                        <Input
                            id="company-address"
                            value={form.data.adresse}
                            onChange={(e) => form.setData('adresse', e.target.value)}
                            placeholder="Adresse de l'entreprise"
                        />
                        <InputError message={form.errors.adresse} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <ArrowRight className="mr-2 size-4" />}
                        Continuer
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

/* ───────── Step 2: Create Admin ───────── */

function StepAdmin() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/onboarding/admin');
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Créer le compte administrateur</CardTitle>
                <CardDescription>
                    Configurons ensuite votre compte administrateur. C'est celui qui aura accès à toutes les permissions !
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-name">Nom complet</Label>
                        <Input
                            id="admin-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                            autoFocus
                            placeholder="Jean Dupont"
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="admin-email">Adresse e-mail</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                            placeholder="admin@monmagasin.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="admin-password">Mot de passe</Label>
                        <Input
                            id="admin-password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            required
                            placeholder="Minimum 8 caractères"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="admin-password-confirm">Confirmer le mot de passe</Label>
                        <Input
                            id="admin-password-confirm"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            required
                            placeholder="Retapez le mot de passe"
                        />
                    </div>

                    <div className="mt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.post('/onboarding/step', { step: 1 })}
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Retour
                        </Button>
                        <Button type="submit" className="flex-1" disabled={form.processing}>
                            {form.processing ? <Spinner /> : <UserPlus className="mr-2 size-4" />}
                            Créer le compte administrateur
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ───────── Step 3: Manage Utilisateurs (optional) ───────── */

function StepUtilisateur({ utilisateurs }: { utilisateurs: Utilisateur[] }) {
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '' as string,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/onboarding/utilisateur', {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    }

    const roleBadgeVariant = (role: string | null) => {
        switch (role) {
            case 'Gérant':
                return 'default' as const;
            case 'Vendeur':
                return 'secondary' as const;
            default:
                return 'outline' as const;
        }
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Gérer les utilisateurs</CardTitle>
                <CardDescription>
                    Ajoutez les membres de votre équipe. Vous pouvez aussi passer cette étape pour la faire plus tard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* ── User list ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Users className="size-4" />
                        <span>Utilisateurs créés ({utilisateurs.length})</span>
                    </div>
                    {utilisateurs.length > 0 ? (
                        <div className="divide-y rounded-md border">
                            {utilisateurs.map((u) => (
                                <div key={u.id} className="flex items-center justify-between px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{u.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    <Badge variant={roleBadgeVariant(u.role)}>{u.role ?? '—'}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-3 text-center text-sm text-muted-foreground">
                            Il n'y a actuellement pas d'utilisateurs
                        </p>
                    )}
                </div>

                {/* ── Creation form ── */}
                {showForm ? (
                    <form onSubmit={submit} className="grid gap-4 rounded-md border p-4">
                        <p className="text-sm font-medium">Nouvel utilisateur</p>

                        <div className="grid gap-2">
                            <Label htmlFor="user-role">Rôle</Label>
                            <Select
                                value={form.data.role}
                                onValueChange={(val) => form.setData('role', val)}
                            >
                                <SelectTrigger id="user-role">
                                    <SelectValue placeholder="Choisissez un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gérant">Gérant</SelectItem>
                                    <SelectItem value="Vendeur">Vendeur</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.role} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-name">Nom complet</Label>
                            <Input
                                id="user-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                                autoFocus
                                placeholder="Marie Martin"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-email">Adresse e-mail</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                required
                                placeholder="utilisateur@monmagasin.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password">Mot de passe</Label>
                            <Input
                                id="user-password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                                placeholder="Minimum 8 caractères"
                            />
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password-confirm">Confirmer le mot de passe</Label>
                            <Input
                                id="user-password-confirm"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Retapez le mot de passe"
                            />
                        </div>

                        <div className="flex gap-3">
                            {utilisateurs.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => {
                                        form.reset();
                                        setShowForm(false);
                                    }}
                                >
                                    Annuler
                                </Button>
                            )}
                            <Button type="submit" className="flex-1" disabled={form.processing || !form.data.role}>
                                {form.processing ? <Spinner /> : <UserPlus className="mr-2 size-4" />}
                                Créer l'utilisateur
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowForm(true)}
                    >
                        <UserPlus className="mr-2 size-4" />
                        Ajouter un utilisateur
                    </Button>
                )}

                {/* ── Navigation ── */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.post('/onboarding/step', { step: 2 })}
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Retour
                    </Button>
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => router.post('/onboarding/skip')}
                    >
                        <ArrowRight className="mr-2 size-4" />
                        {utilisateurs.length > 0 ? 'Continuer' : 'Passer'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/* ───────── Step 4: Done ───────── */

function StepDone() {
    const form = useForm({});

    function finish() {
        form.post('/onboarding/finish');
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Configuration terminée !</CardTitle>
                <CardDescription>
                    Votre Kiosk est prêt à l'emploi. Vous pouvez maintenant accéder à votre tableau de bord.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3">
                    <Button onClick={finish} className="flex-1" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <ArrowRight className="mr-2 size-4" />}
                        Accéder au tableau de bord
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
