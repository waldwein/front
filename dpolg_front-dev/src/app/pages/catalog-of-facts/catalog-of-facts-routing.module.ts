import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogOfFactsPage } from './catalog-of-facts.page';

const routes: Routes = [
  {
    path: '',
    component: CatalogOfFactsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogOfFactsPageRoutingModule {}

