import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ColecaoComponent } from './pages/colecao/colecao.component';
import { adminAuthGuard } from './guards/admin-auth.guard';
import { adminGuestGuard } from './guards/admin-guest.guard';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminProdutosComponent } from './pages/admin-produtos/admin-produtos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'colecao', component: ColecaoComponent },
  { path: 'admin/login', component: AdminLoginComponent, canActivate: [adminGuestGuard] },
  { path: 'admin/produtos', component: AdminProdutosComponent, canActivate: [adminAuthGuard] },
  { path: 'admin', redirectTo: 'admin/produtos', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
