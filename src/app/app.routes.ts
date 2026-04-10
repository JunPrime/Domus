import { Routes } from '@angular/router';
import { Lobby } from './pages/lobby/lobby';
import { Login } from './pages/auth/login/login';
import { Regis } from './pages/auth/regis/regis';
import { home } from './pages/ecos/home/home';
import { MemberComponent } from './pages/ecos/member/member';
import { header } from './components/header/header';
import { Actarea } from './pages/ecos/actarea/actarea';
import { Gastos } from './pages/ecos/gastos/gastos';
import { Settings } from './pages/auth/settings/settings';

export const routes: Routes = [
    
    { path: '', component: Lobby },
    { path: 'lobby', component: Lobby },
    { path: 'home', component: home }, 
    { path: 'login', component: Login },
    { path: 'register', component: Regis },
    { path: 'member', component: MemberComponent },
    { path: 'header', component: header },
    { path: 'actarea', component: Actarea },
    { path: 'gastos', component: Gastos },
    { path: 'settings', component: Settings },
    { path: '**', redirectTo: '' }
];