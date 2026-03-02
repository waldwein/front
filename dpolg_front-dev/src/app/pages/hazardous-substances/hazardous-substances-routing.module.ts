import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HazardousSubstancesPage } from './hazardous-substances.page';

const routes: Routes = [
	{
		path: '',
		component: HazardousSubstancesPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class HazardousSubstancesPageRoutingModule {}

