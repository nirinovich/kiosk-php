import { usePage } from '@inertiajs/react';

type PageProps = {
    auth: {
        user: {
            role?: string;
            [key: string]: unknown;
        } | null;
    };
    [key: string]: unknown;
};

export function useRole() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user?.role ?? null;

    return {
        role,
        isAdmin: role === 'Admin',
        isGerant: role === 'Gérant',
        isVendeur: role === 'Vendeur',
        hasRole: (name: string) => role === name,
    };
}
