import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CatalogOfFactsPageRoutingModule } from './catalog-of-facts-routing.module';

import { CatalogOfFactsPage } from './catalog-of-facts.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CatalogOfFactsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CatalogOfFactsPage]
})
export class CatalogOfFactsPageModule {}

