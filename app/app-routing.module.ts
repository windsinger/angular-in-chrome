import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { HeroesComponent } from './heroes.component';
import { HeroDetailComponent } from './hero-detail.component';

  // {
  //   path: 'dashboard',
  //   component: DashboardComponent
  // },
const routes: Routes = [
  {
    path: 'heroes',
    component: HeroesComponent
  },
  {
    path: 'detail/:id',
    component: HeroDetailComponent
  },
  {
    path: 'pages/index.html',
    component: DashboardComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/pages/index.html'
  },
  {
    path:'**',
    redirectTo: '/pages/index.html'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [DashboardComponent, HeroesComponent, HeroDetailComponent];
