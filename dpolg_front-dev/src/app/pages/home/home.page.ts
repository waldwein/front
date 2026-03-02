import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { dpolgAppConfig } from '../../config/variables';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly placeholderTones = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e', 'tone-f'];

  constructor(private menuCtrl: MenuController, private router: Router) {}

  view: any = {
    items: dpolgAppConfig.launcherSettings.links,
  };

  rowClickable = true;
  showImages = false;

  ngOnInit() {
    if (!Array.isArray(this.view.items)) {
      console.warn('home page expects "items" to be an array');
      this.view.items = [];
    }
  }

  //menu controll
  openMainMenu() {
    this.menuCtrl.open('main-menu');
  }

  onRowClick(item: any) {
    if (!this.rowClickable) return;
    this.onRowSelected(item);
  }

  onRowSelected(row: any) {
    if (!row || !row.url) return;

    if (/^https?:\/\//i.test(row.url)) {
      window.open(row.url, '_blank');
      return;
    }
    this.router.navigateByUrl(row.url).catch((err) => console.error(err));
  }

  logNavigation(type: string, item: any) {
    console.log(`Navigating to ${type} link`, item);
  }

  isInternalUrl(url: string): boolean {
    if (!url) return false;
    return !/^[a-z][a-z0-9+.-]*:/i.test(url);
  }

  getLabel(item: any): string {
    return item?.name || item?.uid || 'home_lable';
  }

  shouldShowImage(item: any): boolean {
    return this.showImages && !!this.getImageSrc(item);
  }

  getPlaceholderTone(item: any, index: number): string {
    const seed = String(item?.uid || item?.name || index);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return this.placeholderTones[Math.abs(hash) % this.placeholderTones.length];
  }

  getImageSrc(item: any): string | undefined {
    const src = item?.img || item?.img_thumbnail || item?.photo;
    if (!src) return undefined;
    return src.replace(/\.(jpe?g)$/i, '.png');
  }
}
