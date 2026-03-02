import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrivingLicencePage } from './driving-licence.page';

const routes: Routes = [
	{
		path: '',
		component: DrivingLicencePage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DrivingLicencePageRoutingModule {}

