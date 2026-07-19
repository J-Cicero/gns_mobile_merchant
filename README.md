# StudCash - Application Mobile Marchand

**StudCash Merchant** est l'application mobile dédiée aux commerçants et partenaires de l'écosystème StudCash (GNS). Elle permet aux marchands d'accepter des paiements de la part des étudiants de manière sécurisée et rapide via des QR Codes.

## 🚀 Fonctionnalités Principales

- **Scanner de QR Code Intégré** : Accès direct à l'appareil photo du téléphone pour scanner les QR codes de paiement générés par les étudiants.
- **Gestion du Catalogue** : Les commerçants peuvent ajouter, modifier et supprimer des produits/services dans leur boutique (visibles ensuite par les étudiants).
- **Suivi des Transactions** : Historique en temps réel des encaissements et suivi du chiffre d'affaires.
- **Support Multi-Boutiques** : Possibilité de gérer plusieurs points de vente depuis un seul compte marchand.
- **PWA Ready** : Peut être installée directement depuis un navigateur web (Chrome/Safari) sur le téléphone sans passer par les stores d'applications.

## 🛠️ Stack Technique

- **Framework Front-End** : Angular 18
- **Framework Mobile** : Ionic Framework & Capacitor (pour l'accès natif)
- **Styling** : TailwindCSS, SCSS
- **Lecture de QR Code** : `@zxing/ngx-scanner`
- **Déploiement PWA** : Configuré avec `@angular/service-worker` et `vercel.json`

## ⚙️ Installation & Démarrage

1. **Cloner le projet**
   ```bash
   git clone https://github.com/J-Cicero/gns_mobile_merchant.git
   cd gns_mobile_merchant
   ```

2. **Installer les dépendances**
   *(Note: Utilisez `--legacy-peer-deps` si vous rencontrez des erreurs ERESOLVE)*
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Lancer le serveur de développement web**
   ```bash
   ng serve
   ```

4. **Développement Mobile (Capacitor)**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

## 📦 Déploiement (Vercel / PWA)

L'application est configurée pour être déployée sur Vercel en tant que Progressive Web App (PWA). Poussez simplement votre code sur la branche `main` et Vercel s'occupera de la compilation en utilisant le fichier `vercel.json`.
