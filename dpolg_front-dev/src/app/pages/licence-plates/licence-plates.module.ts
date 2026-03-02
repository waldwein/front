import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LicencePlatesPageRoutingModule } from './licence-plates-routing.module';

import { LicencePlatesPage } from './licence-plates.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		LicencePlatesPageRoutingModule,
		ComponentsModule,
	],
	declarations: [LicencePlatesPage],
})
export class LicencePlatesPageModule {}

