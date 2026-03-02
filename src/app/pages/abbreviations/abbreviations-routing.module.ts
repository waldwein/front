import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbbreviationsPage } from './abbreviations.page';

const routes: Routes = [
	{
		path: '',
		component: AbbreviationsPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AbbreviationsPageRoutingModule {}

