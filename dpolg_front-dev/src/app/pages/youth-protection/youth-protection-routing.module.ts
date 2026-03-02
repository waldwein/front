import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { YouthProtectionPage } from './youth-protection.page';

const routes: Routes = [
	{
		path: '',
		component: YouthProtectionPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class YouthProtectionPageRoutingModule {}

