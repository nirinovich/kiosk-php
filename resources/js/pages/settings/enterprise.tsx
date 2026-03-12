import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/use-role';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

type Company = {
    nom_commercial: string | null;
    raison_sociale: string | null;
    nif: string | null;
    stat: string | null;
    capital_social: string | null;
    rcs_ville: string | null;
    adresse: string | null;
    email: string | null;
    telephone: string | null;
    site_web: string | null;
    logo_url: string | null;
    iban: string | null;
    bic: string | null;
    note_pied_page: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Paramètres de l'entreprise",
        href: '/settings/enterprise',
    },
];

export default function Enterprise({ company }: { company: Company | null }) {
    const { isVendeur } = useRole();
    const readOnly = isVendeur;

    const form = useForm({
        nom_commercial: company?.nom_commercial ?? '',
        raison_sociale: company?.raison_sociale ?? '',
        nif: company?.nif ?? '',
        stat: company?.stat ?? '',
        capital_social: company?.capital_social ?? '',
        rcs_ville: company?.rcs_ville ?? '',
        adresse: company?.adresse ?? '',
        email: company?.email ?? '',
        telephone: company?.telephone ?? '',
        site_web: company?.site_web ?? '',
        logo_url: company?.logo_url ?? '',
        iban: company?.iban ?? '',
        bic: company?.bic ?? '',
        note_pied_page: company?.note_pied_page ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch('/settings/enterprise', { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres entreprise" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <Heading
                            variant="small"
                            title="Informations de l'entreprise"
                            description="Ces informations apparaissent sur les factures et documents générés."
                        />
                        {readOnly && (
                            <Badge variant="secondary" className="mt-1 shrink-0">
                                Lecture seule
                            </Badge>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* ── Identification ── */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-semibold text-foreground">Identification</legend>

                            <div className="grid gap-2">
                                <Label htmlFor="nom_commercial">
                                    Nom commercial <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nom_commercial"
                                    value={form.data.nom_commercial}
                                    onChange={(e) => form.setData('nom_commercial', e.target.value)}
                                    disabled={readOnly}
                                    required
                                    placeholder="Kiosk"
                                />
                                <InputError message={form.errors.nom_commercial} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="raison_sociale">Raison sociale</Label>
                                <Input
                                    id="raison_sociale"
                                    value={form.data.raison_sociale}
                                    onChange={(e) => form.setData('raison_sociale', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Kiosk SARL"
                                />
                                <InputError message={form.errors.raison_sociale} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nif">NIF</Label>
                                    <Input
                                        id="nif"
                                        value={form.data.nif}
                                        onChange={(e) => form.setData('nif', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="000 000 000"
                                    />
                                    <InputError message={form.errors.nif} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stat">STAT</Label>
                                    <Input
                                        id="stat"
                                        value={form.data.stat}
                                        onChange={(e) => form.setData('stat', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="00 000 00 0000"
                                    />
                                    <InputError message={form.errors.stat} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="capital_social">Capital social</Label>
                                    <Input
                                        id="capital_social"
                                        value={form.data.capital_social}
                                        onChange={(e) => form.setData('capital_social', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="2 000 000 Ar"
                                    />
                                    <InputError message={form.errors.capital_social} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rcs_ville">RCS Ville</Label>
                                    <Input
                                        id="rcs_ville"
                                        value={form.data.rcs_ville}
                                        onChange={(e) => form.setData('rcs_ville', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="Antananarivo"
                                    />
                                    <InputError message={form.errors.rcs_ville} />
                                </div>
                            </div>
                        </fieldset>

                        {/* ── Contact ── */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-semibold text-foreground">Contact</legend>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Adresse e-mail <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    disabled={readOnly}
                                    required
                                    placeholder="contact@monentreprise.com"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={form.data.telephone}
                                        onChange={(e) => form.setData('telephone', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="+261 ..."
                                    />
                                    <InputError message={form.errors.telephone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="site_web">Site web</Label>
                                    <Input
                                        id="site_web"
                                        value={form.data.site_web}
                                        onChange={(e) => form.setData('site_web', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="https://monentreprise.com"
                                    />
                                    <InputError message={form.errors.site_web} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="adresse">Adresse</Label>
                                <Textarea
                                    id="adresse"
                                    value={form.data.adresse}
                                    onChange={(e) => form.setData('adresse', e.target.value)}
                                    disabled={readOnly}
                                    rows={2}
                                    placeholder="Rue, Ville, Code postal"
                                />
                                <InputError message={form.errors.adresse} />
                            </div>
                        </fieldset>

                        {/* ── Bancaire ── */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-semibold text-foreground">Coordonnées bancaires</legend>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="iban">IBAN</Label>
                                    <Input
                                        id="iban"
                                        value={form.data.iban}
                                        onChange={(e) => form.setData('iban', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="MG00 0000 0000 0000"
                                    />
                                    <InputError message={form.errors.iban} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bic">BIC</Label>
                                    <Input
                                        id="bic"
                                        value={form.data.bic}
                                        onChange={(e) => form.setData('bic', e.target.value)}
                                        disabled={readOnly}
                                        placeholder="XXXXMGXX"
                                    />
                                    <InputError message={form.errors.bic} />
                                </div>
                            </div>
                        </fieldset>

                        {/* ── Documents ── */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-semibold text-foreground">Documents</legend>

                            <div className="grid gap-2">
                                <Label htmlFor="logo_url">URL du logo</Label>
                                <Input
                                    id="logo_url"
                                    value={form.data.logo_url}
                                    onChange={(e) => form.setData('logo_url', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="https://..."
                                />
                                <InputError message={form.errors.logo_url} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="note_pied_page">Note de pied de page (factures)</Label>
                                <Textarea
                                    id="note_pied_page"
                                    value={form.data.note_pied_page}
                                    onChange={(e) => form.setData('note_pied_page', e.target.value)}
                                    disabled={readOnly}
                                    rows={3}
                                    placeholder="Merci de votre confiance…"
                                />
                                <InputError message={form.errors.note_pied_page} />
                            </div>
                        </fieldset>

                        {/* ── Actions ── */}
                        {!readOnly && (
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={form.processing}>
                                    Enregistrer
                                </Button>
                                <Transition
                                    show={form.recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Enregistré.</p>
                                </Transition>
                            </div>
                        )}
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
