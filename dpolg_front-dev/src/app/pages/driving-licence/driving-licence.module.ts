import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrivingLicencePageRoutingModule } from './driving-licence-routing.module';

import { DrivingLicencePage } from './driving-licence.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		DrivingLicencePageRoutingModule,
		ComponentsModule,
	],
	declarations: [DrivingLicencePage],
})
export class DrivingLicencePageModule {}

