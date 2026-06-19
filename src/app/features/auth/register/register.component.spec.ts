import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MerchantService } from '../../../core/services/merchant.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let merchantServiceSpy: jasmine.SpyObj<MerchantService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const merchantSpy = jasmine.createSpyObj('MerchantService', ['getBanks', 'registerMerchant']);
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        IonicModule.forRoot(), // Import IonicModule
        FormsModule, // Import FormsModule
        RouterTestingModule, // Provide router dependencies
        HttpClientTestingModule // Provide HttpClientModule dependencies
      ],
      providers: [
        { provide: MerchantService, useValue: merchantSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NavController, useValue: navSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    merchantServiceSpy = TestBed.inject(MerchantService) as jasmine.SpyObj<MerchantService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;

    merchantServiceSpy.getBanks.and.returnValue(of([])); // Mock getBanks to return an empty array
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
