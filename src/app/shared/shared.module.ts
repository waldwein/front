import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from './input/input.component';
import { HeaderComponent } from './header/header.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
	declarations: [InputComponent, HeaderComponent, SearchBarComponent],
	imports: [CommonModule, IonicModule, TranslateModule],
	exports: [InputComponent, HeaderComponent, SearchBarComponent, TranslateModule],
})
export class SharedModule {}
