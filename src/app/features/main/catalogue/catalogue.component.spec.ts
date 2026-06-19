import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CatalogueComponent, IonicModule.forRoot(), RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
