import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HealthCarePageRoutingModule } from './health-care-routing.module';

import { HealthCarePage } from './health-care.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		HealthCarePageRoutingModule,
		ComponentsModule,
	],
	declarations: [HealthCarePage],
})
export class HealthCarePageModule {}

