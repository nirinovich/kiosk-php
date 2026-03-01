import { Head, useForm, usePage } from '@inertiajs/react';
import KioskLogo from '@/components/kiosk-logo';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { LogIn } from 'lucide-react';

type PageProps = {
    flash: { message?: string };
    [key: string]: unknown;
};

export default function Welcome() {
    const { flash } = usePage<PageProps>().props;

    const form = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <>
            <Head title="Connexion — Kiosk" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Branding */}
                    <div className="flex flex-col items-center gap-2">
                        <KioskLogo size="lg" />
                        <p className="text-sm text-muted-foreground">
                            Gestion commerciale simplifiée
                        </p>
                    </div>

                    {/* Flash messages */}
                    {flash.message && (
                        <div className="rounded-md bg-green-50 p-3 text-center text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            {flash.message}
                        </div>
                    )}

                    {/* Login card */}
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Connexion</CardTitle>
                            <CardDescription>
                                Entrez vos identifiants pour accéder à votre espace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Adresse e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <TextLink
                                            href="/forgot-password"
                                            className="text-xs"
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        placeholder="Mot de passe"
                                    />
                                    <InputError message={form.errors.password} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={form.data.remember}
                                        onCheckedChange={(checked) =>
                                            form.setData('remember', checked === true)
                                        }
                                    />
                                    <Label htmlFor="remember" className="text-sm font-normal">
                                        Se souvenir de moi
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full"
                                    disabled={form.processing}
                                >
                                    {form.processing ? (
                                        <Spinner />
                                    ) : (
                                        <LogIn className="mr-2 size-4" />
                                    )}
                                    Se connecter
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Kiosk — Tous droits réservés
                    </p>
                </div>
            </div>
        </>
    );
}
