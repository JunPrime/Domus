import { Routes } from '@angular/router';
import { Lobby } from './pages/lobby/lobby';
import { Login } from './pages/auth/login/login';
import { Regis } from './pages/auth/regis/regis';



export const routes: Routes = [
    {path:'',component:Lobby},
    {path:'Login', component:Login},
    {path:'Register',component:Regis},
    {path:'**',redirectTo:''}

];

