import { SharedModule } from 'src/app/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicePlanCreateComponent } from './serviceplan-create/serviceplan-create.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceplanSelectComponent } from './serviceplan-select/serviceplan-select.component';
import { ServiceplanToCheckComponent } from './serviceplan-to-check/serviceplan-to-check.component';
import { LoginComponent } from './login/login.component';

@NgModule({
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [ServicePlanCreateComponent, ServiceplanSelectComponent, ServiceplanToCheckComponent, LoginComponent],
	imports: [CommonModule, IonicModule, FormsModule, TranslateModule, SharedModule],
	exports: [SharedModule, ServicePlanCreateComponent, ServiceplanSelectComponent, ServiceplanToCheckComponent, LoginComponent],
})
export class ComponentsModule {}
