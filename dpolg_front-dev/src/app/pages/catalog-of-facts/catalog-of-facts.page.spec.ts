import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogOfFactsPage } from './catalog-of-facts.page';

describe('CatalogOfFactsPage', () => {
  let component: CatalogOfFactsPage;
  let fixture: ComponentFixture<CatalogOfFactsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogOfFactsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
