# 📱 Guide d'installation - Niyyah Daily sur Android

## ✅ Ce qui a été fait

### 1. **Fonctionnalités ajoutées**
- ✨ **Intention affichée en permanence** : Votre intention choisie le matin reste visible sur toutes les pages
- 📖 **Hadiths sur la Niyyah qui défilent** : 7 hadiths authentiques sur l'intention qui changent toutes les 8 secondes
- 🎨 **Navigation discrète** : Barre de navigation rendue transparente et élégante
- 📱 **Application mobile prête** : Conversion en application Android avec Capacitor

### 2. **Hadiths ajoutés sur l'intention**
1. "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ" - Les actes ne valent que par les intentions (Bukhari 1)
2. "مَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ" - Celui dont l'émigration est pour Allah... (Bukhari 1)
3. "نِيَّةُ الْمُؤْمِنِ خَيْرٌ مِنْ عَمَلِهِ" - L'intention du croyant est meilleure que son acte (Tabarani)
4. "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ" - Allah regarde vos cœurs et intentions (Muslim 2564)
5. "مَا أَخْلَصَ عَبْدٌ لِلَّهِ أَرْبَعِينَ يَوْمًا" - 40 jours d'intention pure (Abu Nu'aym)
6. "الدُّنْيَا مَلْعُونَةٌ" - Ce monde est maudit sauf ce qui est fait pour Allah (Tirmidhi 2322)
7. "مَنْ صَلَّى الْفَجْرَ فَهُوَ فِي ذِمَّةِ اللَّهِ" - Fajr avec intention sincère (Muslim 657)

---

## 📲 Comment installer l'application sur votre téléphone

### **Option 1 : Télécharger l'APK directement** (RECOMMANDÉ)

#### Étape 1 : Créer l'APK
Exécutez cette commande dans le terminal Emergent :

```bash
cd /app/frontend/android && ./gradlew assembleDebug
```

Cela va créer le fichier APK dans :
```
/app/frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Étape 2 : Télécharger l'APK
1. Cliquez sur l'icône **"VS Code"** dans Emergent
2. Naviguez vers : `frontend/android/app/build/outputs/apk/debug/`
3. Clic droit sur `app-debug.apk` → **Download**

#### Étape 3 : Installer sur votre téléphone
1. **Transférez l'APK** sur votre téléphone (par email, Google Drive, USB, etc.)
2. Ouvrez le fichier APK sur votre Android
3. Si demandé, **autorisez l'installation depuis des sources inconnues** dans les paramètres
4. Installez l'application
5. L'icône **"Niyyah Daily"** apparaîtra sur votre écran d'accueil ! 🎉

---

### **Option 2 : Compiler depuis Android Studio** (pour développeurs)

#### Prérequis
- Android Studio installé sur votre PC
- JDK 17 ou supérieur
- SDK Android

#### Étapes
1. Téléchargez tout le dossier `/app/frontend/android/` sur votre PC
2. Ouvrez **Android Studio**
3. Sélectionnez **"Open an Existing Project"**
4. Naviguez vers le dossier `android` téléchargé
5. Attendez la synchronisation Gradle
6. Connectez votre téléphone Android en mode USB Debugging
7. Cliquez sur **"Run"** (▶️) en haut à droite
8. L'app s'installera directement sur votre téléphone !

---

## 🚀 Publier sur Google Play Store (optionnel)

Si vous voulez publier officiellement sur le Play Store :

### **Étape 1 : Créer un compte développeur Google Play**
- Coût : **25 USD** (paiement unique)
- Site : [play.google.com/console](https://play.google.com/console)

### **Étape 2 : Générer un APK signé**

```bash
cd /app/frontend/android
./gradlew bundleRelease
```

Cela crée un fichier `.aab` (Android App Bundle) dans :
```
android/app/build/outputs/bundle/release/app-release.aab
```

### **Étape 3 : Télécharger sur Google Play Console**
1. Connectez-vous à la Google Play Console
2. Créez une nouvelle application
3. Uploadez le fichier `.aab`
4. Remplissez les informations (description, captures d'écran, etc.)
5. Soumettez pour révision

**Délai de révision** : généralement 2-7 jours.

---

## 🎯 Prochaines étapes recommandées

### **Pour améliorer l'application**
1. ✅ Ajouter une icône d'application personnalisée
2. ✅ Créer un splash screen (écran de démarrage)
3. ✅ Configurer les notifications push pour les rappels de prière
4. ✅ Optimiser les performances
5. ✅ Ajouter le mode hors ligne complet (PWA)

### **Pour iOS (Apple Store)**
Si vous voulez aussi publier sur l'App Store :
- Coût : **99 USD/an**
- Nécessite un Mac avec Xcode
- Commandes similaires avec `npx cap add ios`

---

## 🐛 Problèmes courants

### **L'APK ne s'installe pas**
- Vérifiez que "Sources inconnues" est activé dans Paramètres → Sécurité
- Sur Android 8+, l'autorisation se fait par application

### **L'application ne se connecte pas au backend**
- L'API backend doit être déployée publiquement (pas localhost)
- Utilisez le déploiement Emergent ou Vercel pour le backend

### **Erreur Gradle lors de la compilation**
```bash
# Si problème avec Gradle, nettoyez et recompilez
cd /app/frontend/android
./gradlew clean
./gradlew assembleDebug
```

---

## 📧 Support

Pour toute question :
- Revenez dans ce chat Emergent
- Je suis là pour vous aider ! 🚀

---

**Créé avec ❤️ par Emergent AI**
