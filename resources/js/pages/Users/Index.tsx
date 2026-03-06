import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import users from '@/routes/users';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index().url,
    },
];

interface User {
    id: number
    name: string
    email: string
    role_id: number
    created_at: string
}

interface PageProps {
    flash: {
        message?: string
    }
    user: User[]
}

export default function Index() {
    const { user, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {

        if (confirm(`Do you want to delete user - ${id}. ${name}?`)) {
            destroy(`/users/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className='m-4'>
                <Link href={users.create().url}>
                    <Button>Create a user</Button>
                </Link>
            </div>
            <div>
                {flash.message && (
                    <Alert>
                        <InfoIcon />
                        <AlertTitle>Notification</AlertTitle>
                        <AlertDescription>
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            {user.length > 0 && (
                <div className='m-4'>
                    <Table>
                        <TableCaption>A list of Users</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {user.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Gerant' : 'Vendeur'}</TableCell>
                                    <TableCell>{user.created_at}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Link href={users.edit(user.id).url}>
                                            <Button className='bg-slate-600 hover:bg-slate-700'>
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            disabled={processing}
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className='bg-red-600 hover:bg-red-700'
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppLayout>
    );
}