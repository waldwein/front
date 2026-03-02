import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GunControlLowPage } from './gun-control-low.page';

const routes: Routes = [
	{
		path: '',
		component: GunControlLowPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class GunControlLowPageRoutingModule {}

