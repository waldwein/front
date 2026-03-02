import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GunControlLowPageRoutingModule } from './gun-control-low-routing.module';
import { GunControlLowPage } from './gun-control-low.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, GunControlLowPageRoutingModule, ComponentsModule],
	declarations: [GunControlLowPage],
})
export class GunControlLowPageModule {}

