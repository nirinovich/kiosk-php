import { Head, router, useForm, usePage } from '@inertiajs/react';
import KioskLogo from '@/components/kiosk-logo';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, UserPlus, ArrowRight, SkipForward } from 'lucide-react';

type PageProps = {
    step: number;
    flash: {
        message?: string;
    };
};

export default function OnboardingIndex() {
    const { step } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Bienvenue — Configuration initiale" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <div className="w-full max-w-lg space-y-8">
                    {/* Logo + progress */}
                    <div className="flex flex-col items-center gap-4">
                        <KioskLogo size="lg" />
                        <StepIndicator current={step} />
                    </div>

                    {step === 1 && <StepAdmin />}
                    {step === 2 && <StepVendeur />}
                    {step === 3 && <StepDone />}
                </div>
            </div>
        </>
    );
}

/* ───────── Step indicator ───────── */

function StepIndicator({ current }: { current: number }) {
    const steps = ['Administrateur', 'Vendeur', 'Terminé'];
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
                            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                                done
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

/* ───────── Step 1: Create Admin ───────── */

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
                    Bienvenue dans Kiosk ! Commençons par configurer votre compte administrateur.
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

                    <Button type="submit" className="mt-2 w-full" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <UserPlus className="mr-2 size-4" />}
                        Créer le compte administrateur
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

/* ───────── Step 2: Create Vendeur (optional) ───────── */

function StepVendeur() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/onboarding/vendeur');
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Ajouter un vendeur</CardTitle>
                <CardDescription>
                    Créez un compte vendeur pour votre équipe. Vous pouvez aussi passer cette étape.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="vendeur-name">Nom complet</Label>
                        <Input
                            id="vendeur-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                            autoFocus
                            placeholder="Marie Martin"
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vendeur-email">Adresse e-mail</Label>
                        <Input
                            id="vendeur-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                            placeholder="vendeur@monmagasin.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vendeur-password">Mot de passe</Label>
                        <Input
                            id="vendeur-password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            required
                            placeholder="Minimum 8 caractères"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vendeur-password-confirm">Confirmer le mot de passe</Label>
                        <Input
                            id="vendeur-password-confirm"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            required
                            placeholder="Retapez le mot de passe"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.post('/onboarding/skip')}
                        >
                            <SkipForward className="mr-2 size-4" />
                            Passer
                        </Button>
                        <Button type="submit" className="flex-1" disabled={form.processing}>
                            {form.processing ? <Spinner /> : <UserPlus className="mr-2 size-4" />}
                            Créer le vendeur
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ───────── Step 3: Done ───────── */

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
                <Button onClick={finish} className="w-full" disabled={form.processing}>
                    {form.processing ? <Spinner /> : <ArrowRight className="mr-2 size-4" />}
                    Accéder au tableau de bord
                </Button>
            </CardContent>
        </Card>
    );
}
