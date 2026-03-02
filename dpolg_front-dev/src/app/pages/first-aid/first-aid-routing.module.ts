import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirstAidPage } from './first-aid.page';

const routes: Routes = [
	{
		path: '',
		component: FirstAidPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class FirstAidPageRoutingModule {}

