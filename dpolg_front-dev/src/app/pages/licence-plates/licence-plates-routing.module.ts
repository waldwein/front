import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LicencePlatesPage } from './licence-plates.page';

const routes: Routes = [
	{
		path: '',
		component: LicencePlatesPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LicencePlatesPageRoutingModule {}

