import { Link } from '@inertiajs/react';
import { LayoutGrid, Receipt, ShoppingBag, UserCircle, Store, Warehouse } from 'lucide-react';
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
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import pos from '@/routes/pos';
import products from '@/routes/products';
import stocks from '@/routes/stocks';
import users from '@/routes/users';
import ventes from '@/routes/ventes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Point de vente',
        href: pos.index(),
        icon: Store,
    },
    {
        title: 'Journal des ventes',
        href: ventes.index(),
        icon: Receipt,
    },
    {
        title: 'Produits',
        href: products.index(),
        icon: ShoppingBag,
    },
    {
        title: 'Stock',
        href: stocks.index(),
        icon: Warehouse,
    },   
    {
        title: 'Clients',
        href: clients.index(),
        icon: UserCircle,
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
