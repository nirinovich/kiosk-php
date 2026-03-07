import { Link } from '@inertiajs/react';
import { LayoutGrid, PackageSearch, Receipt } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import products from '@/routes/products';
import clients from '@/routes/clients';
import ventes from '@/routes/ventes';
import users from '@/routes/users';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Produits',
        href: products.index(),
        icon: PackageSearch,
    },
    {
        title: 'Clients',
        href: clients.index(),
        icon: PackageSearch,
    },
    {
        title: 'Journal des ventes',
        href: ventes.index(),
        icon: Receipt,
    },
    {
        title: 'Users',
        href: users.index(),
        icon: PackageSearch,
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
