import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, cashOutline, storefrontOutline, personOutline, qrCodeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <ion-tab-button tab="dashboard" class="text-slate-500 dark:text-slate-400 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Accueil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="catalogue" class="text-slate-500 dark:text-slate-400 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors">
          <ion-icon name="storefront-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Catalogue</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="caisse" class="bg-indigo-600 dark:bg-indigo-500 rounded-full w-14 h-14 -mt-6 mx-2 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 transform transition-transform active:scale-95">
          <ion-icon name="qr-code-outline" class="text-2xl m-0"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="profile" class="text-slate-500 dark:text-slate-400 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: transparent;
      padding-bottom: env(safe-area-inset-bottom);
      height: calc(60px + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    }
    ion-tab-button {
      --color-selected: #4f46e5;
    }
  `],
  standalone: true,
  imports: [IonicModule],
})
export class TabsComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ homeOutline, cashOutline, storefrontOutline, personOutline, qrCodeOutline });
  }
}
