import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create a New User',
        href: users.create().url,
    },
];

interface FormState {
    name: string;
    email: string;
    password: string;
    role_id: string;
}

export default function Create() {

    const { data, setData, post, processing, errors } = useForm<FormState>({
        name: '',
        email: '',
        password: '',
        role_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(users.store().url, {
            onError: (erreursLaravel) => {
                console.error("🚨 Laravel a refusé l'enregistrement :", erreursLaravel);
            },
            onSuccess: () => {
                console.log("✅ User enregistré avec succès !");
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a New User" />

            <div className='m-4'>

                <form onSubmit={handleSubmit} className='space-y-6'>

                    {/* --- USER INFOS --- */}

                    <div className="space-y-4 p-4 border rounded-md bg-white">

                        <h2 className="text-lg font-semibold border-b pb-2">
                            User
                        </h2>

                        {/* NAME */}

                        <div>
                            <Label htmlFor='name'>Name</Label>

                            <Input
                                placeholder="User Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />

                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* EMAIL */}

                        <div>
                            <Label htmlFor='email'>Email</Label>

                            <Input
                                type="email"
                                placeholder="User Email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD */}

                        <div>
                            <Label htmlFor='password'>Password</Label>

                            <Input
                                type="password"
                                placeholder="User Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* ROLE */}

                        <div>
                            <Label htmlFor='role'>Role</Label>

                            <select
                                id="role_id"
                                value={data.role_id}
                                onChange={(e) => setData('role_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            >
                                <option value="">-- Choisissez un rôle --</option>
                                <option value="1">Admin</option>
                                <option value="2">Gerant</option>
                                <option value="3">Vendeur</option>
                            </select>
                            {errors.role_id && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.role_id}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* SUBMIT */}

                    <Button disabled={processing} type="submit">
                        Enregistrer l'utilisateur
                    </Button>

                </form>

            </div>

        </AppLayout>
    );
}