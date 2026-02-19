# Redesign Landing Page -- dominantna fotka Veroniky a zjednodusenie

## Prehlad

Prerobenie uvodnej stranky tak, aby Veronikina fotografia bola vizualne dominantnym prvkom (velky kruh, cca 180-200px) a celkovy obsah bol strucnejsi, cistejsi a prehladnejsi. Zachovame existujuci look and feel (farby, zaoblene rohy, jemne animacie, iOS-inspired styl).

## Co sa zmeni

### 1. LandingHero -- uplna prestavba podla screenshotu

Aktualne hero nema fotku a ma vela textu. Nove rozlozenie:

- **Velka kruhova fotografia Veroniky** (cca 180px, ring + jemny glow efekt v primarnej farbe)
- **Kratsi, raznejsi nadpis**: "Plavanje s osobnym pristupom v Pezinku"
- **Jednovetny podnadpis**: "Som Veronika a pomaham ludom citit sa vo vode istejsie."
- **Jedine CTA tlacidlo**: "Mám záujem o osobný tréning" (v primarnej farbe, nie cierne)
- **Mikrocopy**: "Nezavazny kontakt. Ozvem sa vam osobne."
- Zruseny italicky text a druhy odstavec

### 2. DualPathSection -- zjednodusenie textov

- Skratit texty v oboch kartach, zachovat strukturu a tlacidla
- Karta "Novy zaujemca" -- skratit dlhy odstavec na 1 vetu

### 3. AboutVeronika -- bez zmien

Uz je strucna a prehladna, zachovame.

### 4. TargetGroupsSection -- bez zmien

Uz je strucna, zachovame.

### 5. HowItWorksSteps -- skratenie popisov

- Skratit description texty na minimum (1 kratka veta alebo uplne odstranit)

### 6. ContactSection -- bez zmien

Zachovame formular a telefonne cislo.

### 7. Header, Footer, WelcomeScreen -- bez zmien

## Technicke detaily

### Subory na upravu:

1. `**src/components/landing/LandingHero.tsx**` -- kompletne prepisanie:
  - Pridat `import veronikaPhoto from '@/assets/veronika-photo.png'`
  - Velky kruhovy obrazok (h-44 w-44 / h-48 w-48) s `ring-4 ring-primary/20` a `bg-primary/10 blur-2xl` glow
  - Novy kratsi heading a subheading
  - CTA tlacidlo s primarnou farbou (nie cierne btn-dark)
2. `**src/components/landing/DualPathSection.tsx**` -- skratenie textov v kartach
3. `**src/components/landing/HowItWorksSteps.tsx**` -- skratenie description textov v krokoch

Vsetky ostatne subory zostanu nezmenene. Zachovame framer-motion animacie, ios-card triedy, farebnú schemu a celkovy vizualny styl.