import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HazardousSubstancesPageRoutingModule } from './hazardous-substances-routing.module';

import { HazardousSubstancesPage } from './hazardous-substances.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		HazardousSubstancesPageRoutingModule,
		ComponentsModule,
	],
	declarations: [HazardousSubstancesPage],
})
export class HazardousSubstancesPageModule {}

