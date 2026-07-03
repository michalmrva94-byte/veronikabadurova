#!/bin/bash
# ============================================
# SwimDesk Coach - Supabase Setup Script
# ============================================
# Spustenie: bash scripts/setup-supabase.sh
#
# Poziadavky:
# 1. Supabase CLI: npm install -g supabase
# 2. Supabase ucet na supabase.com
# 3. Anthropic API kluc (pre AI funkcie)
# ============================================

set -e

echo "=== SwimDesk Coach - Supabase Setup ==="
echo ""

if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI nie je nainstalovane."
  echo "Instalacia: npm install -g supabase"
  exit 1
fi

echo "KROK 1: Prihlasenie do Supabase"
supabase login
echo ""

echo "KROK 2: Prepojenie s projektom"
PROJECT_ID=$(grep 'project_id' supabase/config.toml | head -1 | cut -d'"' -f2)
echo "Project ID: $PROJECT_ID"
supabase link --project-ref "$PROJECT_ID"
echo ""

echo "KROK 3: Aplikovanie migracii (tabulky + seed data)"
supabase db push
echo ""

echo "KROK 4: Nastavenie API klucov"
read -p "Zadajte vas Anthropic API kluc (sk-ant-...): " ANTHROPIC_KEY
if [ -n "$ANTHROPIC_KEY" ]; then
  supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
  echo "API kluc nastaveny."
else
  echo "Preskocene. Neskor spustite: supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx"
fi
echo ""

echo "KROK 5: Nasadenie Edge Functions"
supabase functions deploy generate-training-plan
supabase functions deploy dashboard-insights
echo ""

echo "=== HOTOVO ==="
echo ""
echo "Dalsie kroky:"
echo "1. Otvorte Supabase Dashboard -> Authentication -> Settings"
echo "   - Skontrolujte, ze Site URL je spravna"
echo "   - Pridajte Redirect URLs pre login"
echo "2. Spustite frontend: npm run dev"
echo "3. Zaregistrujte sa na /registracia"
echo "4. Vytvorte klub na /onboarding"
