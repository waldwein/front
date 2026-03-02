import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainInspectionPage } from './main-inspection.page';

const routes: Routes = [
	{
		path: '',
		component: MainInspectionPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MainInspectionPageRoutingModule {}

