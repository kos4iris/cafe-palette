import { useMemo, useRef, useState } from 'react';
import { GenerateControls } from '../components/GenerateControls';
import { MixingCanvas } from '../components/MixingCanvas';
import { RecipePanel } from '../components/RecipePanel';
import { SelectedIngredients } from '../components/SelectedIngredients';
import { getIngredientById } from '../data/ingredients';
import { generateDrink, type DrinkRecipe, type RecentDrink } from '../services/drinkApi';
import { type Sweetness, type Temperature, type DietaryRestriction } from '../types';
import { useIngredientCompatibility } from '../hooks/useIngredientCompatibility';
import { inferDrinkType } from '../utils/recipeEngine';

export default function HomePage() {
  const [temperature, setTemperature] = useState<Temperature>('iced');
  const [sweetness, setSweetness] = useState<Sweetness>('medium');
  const [servings, setServings] = useState(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragOver, setDragOver] = useState(false);

  const [isGenerating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ key: string; recipe: DrinkRecipe } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const recentRecipes = useRef(new Map<string, RecentDrink[]>());

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => getIngredientById(id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i)),
    [selectedIds],
  );

  const drinkType = useMemo(() => inferDrinkType(selected), [selected]);
  const compatibility = useIngredientCompatibility(selected);
  const compatibilityNote = compatibility.kind === 'result' ? compatibility.result : null;

  // A generated recipe only describes the inputs it was made from. When any of
  // them change, it stops matching this key and is hidden rather than misleading.
  const inputKey = JSON.stringify([
    [...selectedIds].sort(),
    drinkType,
    temperature,
    sweetness,
    servings,
    [...dietaryRestrictions].sort(),
  ]);
  const aiRecipe = result?.key === inputKey ? result.recipe : null;
  const aiError = failure?.key === inputKey ? failure.message : null;

  async function handleGenerate() {
    if (selected.length < 1 || isGenerating) return;

    const key = inputKey;
    const selectionKey = JSON.stringify([...selectedIds].sort());
    const recent = recentRecipes.current.get(selectionKey) ?? [];
    setGenerating(true);
    setResult(null);
    setFailure(null);

    try {
      const recipe = await generateDrink({
        ingredients: selected.map((i) => i.name.toLowerCase()),
        drinkType,
        temperature,
        sweetness,
        servings,
        ...(dietaryRestrictions.length > 0 ? { dietaryRestrictions } : {}),
        ...(compatibilityNote ? { compatibility: compatibilityNote } : {}),
        ...(recent.length > 0 ? { recentRecipes: recent } : {}),
      });
      setResult({ key, recipe });
      recentRecipes.current.set(selectionKey, rememberRecipe(recent, recipe));
    } catch (err) {
      setFailure({
        key,
        message:
          err instanceof Error
            ? err.message
            : "We couldn't mix that drink right now. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  }

  function addIngredient(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeIngredient(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function clearIngredients() {
    setSelectedIds([]);
  }

  return (
    <div className="app">
      <main className="workspace">
        <section className="stage">
          <p className="instructions">
            drag and drop any selection of ingredients for a yummy drink
            recipe
          </p>
          <div className="poster">
            <header className="brand">
              <h1>
                <span className="brand-line">
                  <span className="brand-cap">C</span>afe
                </span>
                <span className="brand-line brand-palette">
                  <span className="brand-cap">P</span>alette
                </span>
              </h1>
              <p className="brand-atelier">Atelier</p>
            </header>

            <div className="board">
              <MixingCanvas
                inGlass={selected}
                onAdd={addIngredient}
                onRemove={removeIngredient}
                isDragOver={isDragOver}
                setDragOver={setDragOver}
              />
            </div>
          </div>
        </section>

        <RecipePanel aiRecipe={aiRecipe} error={aiError}>
          <SelectedIngredients
            selected={selected}
            onRemove={removeIngredient}
            onClear={clearIngredients}
            compatibility={compatibility}
          />
          <GenerateControls
            temperature={temperature}
            sweetness={sweetness}
            servings={servings}
            dietaryRestrictions={dietaryRestrictions}
            onTemperature={setTemperature}
            onSweetness={setSweetness}
            onServings={setServings}
            onDietaryRestrictions={setDietaryRestrictions}
            canGenerate={selected.length >= 1}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </RecipePanel>
      </main>
    </div>
  );
}

function rememberRecipe(recent: RecentDrink[], recipe: DrinkRecipe): RecentDrink[] {
  const next = [
    ...recent,
    {
      name: recipe.name,
      drinkCategory: recipe.drinkCategory,
      mainIngredients: recipe.ingredients.slice(0, 6).map((item) => item.name.toLowerCase()),
    },
  ];
  return next.slice(-3);
}
