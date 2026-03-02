import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { YouthProtectionPageRoutingModule } from './youth-protection-routing.module';

import { YouthProtectionPage } from './youth-protection.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		YouthProtectionPageRoutingModule,
		ComponentsModule,
	],
	declarations: [YouthProtectionPage],
})
export class YouthProtectionPageModule {}

