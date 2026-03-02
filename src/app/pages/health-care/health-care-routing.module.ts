import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HealthCarePage } from './health-care.page';

const routes: Routes = [
	{
		path: '',
		component: HealthCarePage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class HealthCarePageRoutingModule {}

