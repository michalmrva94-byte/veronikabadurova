
# Návrat k iOS-inspired dizajnu z referenčných screenshotov

## Prehľad

Vrátiť landing page komponenty do pôvodného iOS-inspired štýlu viditeľného na screenshotoch -- s ios-card kartami, zelenými ikonovými bublinami, 2x2 gridmi a štruktúrovanejším layoutom. CTA tlačidlo zostane čierne.

## Zmeny v CSS (index.css)

Vrátiť farebný systém na pôvodnú iOS zelenú tému:
- `--background`: zmeniť z teplej off-white (`40 7% 95%`) na jemnú mint (`150 20% 96%`)
- `--primary`: ponechať tmavé pre CTA tlačidlá (bez zmeny)
- `--accent`: upraviť na pôvodnú teal zelenú (`160 40% 45%`) -- pre ikony a čísla

## Zmeny v komponentoch

### 1. DualPathSection.tsx -- dve karty

Vrátiť dve karty vedľa seba (na mobile pod sebou):
- Karta 1: "Ste už môj klient?" s tlačidlami Prihlásiť sa / Registrovať sa
- Karta 2: "Máte záujem o tréning?" s tlačidlami Zavolať / Napísať
- Obe karty používajú `ios-card` utility class
- Zelené "Zavolať" tlačidlo, outline "Napísať" tlačidlo
- Ikony: Phone a MessageCircle z lucide-react

### 2. AboutVeronika.tsx -- 2x2 grid kariet

Nahradiť inline text za 2x2 grid ios-card kariet:
- "14 rokov / skúseností"
- "Certifikovaná / trénerka"  
- "PK Pezinok / plavecký klub"
- "Individuálny / prístup"

Každá karta: biele pozadie, zaoblené rohy, veľký bold nadpis + menší popis.

### 3. TargetGroupsSection.tsx -- 5 položiek s ikonami

Vrátiť 5 položiek (namiesto 3) s ikonovými bublinami:
- Zlepšenie techniky plávania (Target icon)
- Príprava na skúšky a športové výzvy (Award icon)
- Naučenie kraulu a nových štýlov (Waves icon)
- Prekonanie strachu z vody (Heart icon)
- Zdravý pohyb pre deti aj dospelých (Users icon)

Každá položka: ios-card s zelenou ikonovou bublinou vľavo a textom vpravo.

### 4. HowItWorksSteps.tsx -- karty s zelenými číslami

Nahradiť plain text za ios-card karty:
- Každý krok v bielej karte so zaoblenými rohmi
- Číslo v zelenej bubline (rounded-full, bg-accent/10, text-accent)
- Zmeniť text kroku 3: "Dostanete prístup do systému" / "Po potvrdení si budete vedieť pohodlne rezervovať tréningy online."

### 5. ContactSection.tsx -- telefónna karta + formulár v karte

- Telefón: ios-card s Phone ikonou v zelenej bubline + "Zavolajte mi" nadpis + číslo
- Formulár: ios-card s labelmi (Meno, Email, Správa) a štandardnými Input komponentmi
- CTA tlačidlo zostáva čierne (rounded-full)

## Technické detaily

- Upravené súbory: `index.css`, `DualPathSection.tsx`, `AboutVeronika.tsx`, `TargetGroupsSection.tsx`, `HowItWorksSteps.tsx`, `ContactSection.tsx`
- Použité utility classes: `ios-card`, `ios-card-elevated` z existujúceho CSS
- Nové ikony z lucide-react: Target, Award, Waves, Heart, Users, Phone, MessageCircle
- Žiadne nové závislosti, žiadne zmeny v databáze
