import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import users from '@/routes/users';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_id: number;
}

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Edit User',
            href: users.edit(user.id).url,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        role_id: user.role_id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(users.update(user.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className='m-4'>
                <form onSubmit={handleSubmit} className='space-y-6'>

                    {/* --- USER INFO --- */}
                    <div className="space-y-4 p-4 border rounded-md bg-white">
                        <h2 className="text-lg font-semibold border-b pb-2">
                            User
                        </h2>

                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                type="password"
                                placeholder="Leave empty to keep current password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="role">Role</Label>

                            <select
                                value={data.role_id}
                                onChange={(e) => setData('role_id', Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            >
                                <option value="">-- Choisissez un role --</option>
                                <option value="1">Admin</option>
                                <option value="2">Gerant</option>
                                <option value="3">Vendeur</option>
                            </select>

                            {errors.role_id && (
                                <p className="text-red-500 text-sm">{errors.role_id}</p>
                            )}
                        </div>
                    </div>

                    <Button disabled={processing} type="submit">
                        Modifier l'utilisateur
                    </Button>

                </form>
            </div>
        </AppLayout>
    );
}