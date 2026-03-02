import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainInspectionPageRoutingModule } from './main-inspection-routing.module';

import { MainInspectionPage } from './main-inspection.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		MainInspectionPageRoutingModule,
		ComponentsModule,
	],
	declarations: [MainInspectionPage],
})
export class MainInspectionPageModule {}

