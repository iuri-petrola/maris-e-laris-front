import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProdutosComponent } from './pages/produtos/produtos.component';
import { CadastreSeComponent } from './pages/cadastre-se/cadastre-se.component';
import { LoginClienteComponent } from './pages/login-cliente/login-cliente.component';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { adminGuestGuard } from './guards/admin-guest.guard';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminProdutosComponent } from './pages/admin-produtos/admin-produtos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'produtos', component: ProdutosComponent },
  { path: 'cadastre-se', component: CadastreSeComponent },
  { path: 'login', component: LoginClienteComponent },
  { path: 'admin/login', component: AdminLoginComponent, canActivate: [adminGuestGuard] },
  { path: 'admin/produtos', component: AdminProdutosComponent, canActivate: [adminAuthGuard] },
  { path: 'admin', redirectTo: 'admin/produtos', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
