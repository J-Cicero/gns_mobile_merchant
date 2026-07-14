import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, cashOutline, storefrontOutline, personOutline, qrCodeOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <ion-tab-button tab="dashboard" class="text-slate-500 dark:text-slate-400 transition-colors">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Accueil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="catalogue" class="text-slate-500 dark:text-slate-400 transition-colors">
          <ion-icon name="storefront-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Catalogue</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="caisse">
          <div class="qr-fab">
            <ion-icon name="qr-code-outline"></ion-icon>
          </div>
        </ion-tab-button>

        <ion-tab-button tab="history" class="text-slate-500 dark:text-slate-400 transition-colors">
          <ion-icon name="time-outline"></ion-icon>
          <ion-label class="text-xs font-medium">Historique</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" class="text-slate-500 dark:text-slate-400 transition-colors">
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
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
      height: calc(64px + env(safe-area-inset-bottom));
      min-height: calc(56px + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
      width: 100%;
    }
    ion-tab-button {
      --color-selected: #2563eb;
      --color: #64748b;
      flex: 1;
      min-width: 0;
      max-width: none;
    }
    ion-tab-button[tab="caisse"] {
      --color: white;
      --color-selected: white;
      --ripple-color: transparent;
      position: relative;
    }
    .qr-fab {
      width: 52px;
      height: 52px;
      background: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: -20px;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
      border: 4px solid var(--ion-background-color, #fff);
      transition: transform 0.2s;
      font-size: 22px;
      color: white;
    }
    .qr-fab:active {
      transform: scale(0.92);
    }
  `],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ homeOutline, cashOutline, storefrontOutline, personOutline, qrCodeOutline, timeOutline });
  }
}
