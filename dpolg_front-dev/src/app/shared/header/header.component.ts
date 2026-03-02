// src/app/shared/header/header.component.ts
import { Component, Input } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() hideLeft = false;
  @Input() menuState = true;
  @Input() centerOnly = false;

  constructor(private menuCtrl: MenuController) {}

  openMainMenu() {
    this.menuCtrl.open('main-menu');
  }

}
