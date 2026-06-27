import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SalesHistoryComponent } from './sales-history.component';

describe('SalesHistoryComponent', () => {
  let component: SalesHistoryComponent;
  let fixture: ComponentFixture<SalesHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SalesHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
