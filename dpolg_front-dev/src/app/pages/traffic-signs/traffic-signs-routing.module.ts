import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrafficSignsPage } from './traffic-signs.page';

const routes: Routes = [
	{
		path: '',
		component: TrafficSignsPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class TrafficSignsPageRoutingModule {}

