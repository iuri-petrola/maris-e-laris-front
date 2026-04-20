import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProdutosComponent } from './pages/produtos/produtos.component';
import { ClienteCarrinhoComponent } from './pages/cliente-carrinho/cliente-carrinho.component';
import { ClientePedidosComponent } from './pages/cliente-pedidos/cliente-pedidos.component';
import { AdminPedidosComponent } from './pages/admin-pedidos/admin-pedidos.component';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { adminGuestGuard } from './guards/admin-guest.guard';
import { clientAuthGuard } from './guards/client-auth.guard';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminProdutosComponent } from './pages/admin-produtos/admin-produtos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'produtos', component: ProdutosComponent },
  { path: 'cliente/carrinho', component: ClienteCarrinhoComponent, canActivate: [clientAuthGuard] },
  { path: 'cliente/pedidos', component: ClientePedidosComponent, canActivate: [clientAuthGuard] },
  { path: 'admin/login', component: AdminLoginComponent, canActivate: [adminGuestGuard] },
  { path: 'admin/produtos', component: AdminProdutosComponent, canActivate: [adminAuthGuard] },
  { path: 'admin/pedidos', component: AdminPedidosComponent, canActivate: [adminAuthGuard] },
  { path: 'admin', redirectTo: 'admin/produtos', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
