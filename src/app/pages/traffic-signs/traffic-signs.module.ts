import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrafficSignsPageRoutingModule } from './traffic-signs-routing.module';

import { TrafficSignsPage } from './traffic-signs.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		TrafficSignsPageRoutingModule,
		ComponentsModule,
	],
	declarations: [TrafficSignsPage],
})
export class TrafficSignsPageModule {}

