import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'pages/calendar',
    loadChildren: () => import('./pages/calendar/calendar.module').then((m) => m.CalendarPageModule),
  },
  {
    path: 'pages/account',
    loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountPageModule),
  },
  {
    path: 'pages/catalog_of_facts',
    loadChildren: () => import('./pages/catalog-of-facts/catalog-of-facts.module').then((m) => m.CatalogOfFactsPageModule),
  },
  {
    path: 'pages/hazardous_substances',
    loadChildren: () => import('./pages/hazardous-substances/hazardous-substances.module').then((m) => m.HazardousSubstancesPageModule),
  },
  {
    path: 'pages/abbreviations',
    loadChildren: () => import('./pages/abbreviations/abbreviations.module').then((m) => m.AbbreviationsPageModule),
  },
  {
    path: 'pages/health_care',
    loadChildren: () => import('./pages/health-care/health-care.module').then((m) => m.HealthCarePageModule),
  },
  {
    path: 'pages/traffic_signs',
    loadChildren: () => import('./pages/traffic-signs/traffic-signs.module').then((m) => m.TrafficSignsPageModule),
  },
  {
    path: 'pages/licence_plates',
    loadChildren: () => import('./pages/licence-plates/licence-plates.module').then((m) => m.LicencePlatesPageModule),
  },
  {
    path: 'pages/youth_protection',
    loadChildren: () => import('./pages/youth-protection/youth-protection.module').then((m) => m.YouthProtectionPageModule),
  },
  {
    path: 'pages/first_aid',
    loadChildren: () => import('./pages/first-aid/first-aid.module').then((m) => m.FirstAidPageModule),
  },
  {
    path: 'pages/driving_licence',
    loadChildren: () => import('./pages/driving-licence/driving-licence.module').then((m) => m.DrivingLicencePageModule),
  },
  {
    path: 'pages/main_inspection',
    loadChildren: () => import('./pages/main-inspection/main-inspection.module').then((m) => m.MainInspectionPageModule),
  },
  {
    path: 'pages/gun_control_low',
    loadChildren: () => import('./pages/gun-control-low/gun-control-low.module').then((m) => m.GunControlLowPageModule),
  },
  {
    path: 'pages/narcotics',
    loadChildren: () => import('./pages/narcotics/narcotics.module').then((m) => m.NarcoticsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
