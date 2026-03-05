

## Plan: Add benchmarks to storno rate tooltip

**What**: Extend the existing Popover tooltip on the "Miera storna" card with benchmark ranges showing what's ideal, acceptable, and problematic.

**Changes** in `src/components/admin/AdminStatsSection.tsx`, lines 134-145:

Add a benchmark section below the formula explanation with colored dots (reusing existing `dotColors` pattern):

- **🟢 < 15%** — Výborná stabilita
- **🟡 15–25%** — Prijateľná, sleduj trend  
- **🔴 > 25%** — Vysoká, zváž opatrenia

These thresholds match the existing `getStornoInsight()` function logic (lines 23-27), keeping consistency.

The tooltip will show:
1. Formula explanation (existing)
2. Current values (existing)  
3. **New**: Benchmark scale with colored indicators

