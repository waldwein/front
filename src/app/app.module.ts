import { LOCALE_ID, NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, withFetch } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { register } from 'swiper/element/bundle';

import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';

// import { provideAnimations } from '@angular/platform-browser/animations';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

register();
registerLocaleData(localDe, 'de-DE', localeDeExtra);
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios',
    }),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'de',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ComponentsModule,
  ],
  providers: [
    provideHttpClient(withFetch()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'de-DE' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
