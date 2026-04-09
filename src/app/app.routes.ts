import { Routes } from '@angular/router';
import { Lobby } from './pages/lobby/lobby';
import { Login } from './pages/auth/login/login';
import { Regis } from './pages/auth/regis/regis';
import { home } from './pages/ecos/home/home';
import { MemberComponent } from './pages/ecos/member/member';
import { ActareaComponent } from './pages/ecos/actarea/actarea';

export const routes: Routes = [
    { path: '', component: Lobby },
    { path: 'lobby', component: Lobby },
    { path: 'home', component: home },  // Cambiado a minúscula
    { path: 'login', component: Login },
    { path: 'register', component: Regis },
    { path: 'member', component: MemberComponent },
    { path: 'actarea', component: ActareaComponent },
    { path: '**', redirectTo: '' }
];