import { Link } from '@inertiajs/react';
<<<<<<< HEAD
import { LayoutGrid, PackageSearch, Receipt, Users, ShoppingBag, UserCircle, Store } from 'lucide-react';
=======
import { LayoutGrid, PackageSearch, Receipt, Users, ShoppingBag, UserCircle, MonitorSmartphone, Warehouse } from 'lucide-react';
>>>>>>> 0f92aa96b531d73c82e4e090635651114b5d7207
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
import pos from '@/routes/pos';
import stocks from '@/routes/stocks';

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
        title: 'Clients',
        href: clients.index(),
        icon: UserCircle,
    },
    {
        title:'Stock',
        href: stocks.index(),
        icon: Warehouse,
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
