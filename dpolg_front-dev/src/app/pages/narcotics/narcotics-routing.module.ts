import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NarcoticsPage } from './narcotics.page';

const routes: Routes = [
	{
		path: '',
		component: NarcoticsPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class NarcoticsPageRoutingModule {}

