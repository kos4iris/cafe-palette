import { useMemo, useState } from 'react';
import { GenerateControls } from '../components/GenerateControls';
import { MixingCanvas } from '../components/MixingCanvas';
import { RecipePanel } from '../components/RecipePanel';
import { SelectedBubbles } from '../components/SelectedBubbles';
import { getIngredientById } from '../data/ingredients';
import { generateDrink, type DrinkRecipe } from '../services/drinkApi';
import { type Sweetness, type Temperature } from '../types';
import { useIngredientCompatibility } from '../hooks/useIngredientCompatibility';
import { inferDrinkType } from '../utils/recipeEngine';

export default function HomePage() {
  const [temperature, setTemperature] = useState<Temperature>('iced');
  const [sweetness, setSweetness] = useState<Sweetness>('medium');
  const [servings, setServings] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragOver, setDragOver] = useState(false);

  const [isGenerating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ key: string; recipe: DrinkRecipe } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => getIngredientById(id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i)),
    [selectedIds],
  );

  const drinkType = useMemo(() => inferDrinkType(selected), [selected]);
  const compatibility = useIngredientCompatibility(selected);

  // A generated recipe only describes the inputs it was made from. When any of
  // them change, it stops matching this key and is hidden rather than misleading.
  const inputKey = JSON.stringify([
    [...selectedIds].sort(),
    drinkType,
    temperature,
    sweetness,
    servings,
  ]);
  const aiRecipe = result?.key === inputKey ? result.recipe : null;
  const aiError = failure?.key === inputKey ? failure.message : null;

  async function handleGenerate() {
    if (selected.length < 3 || isGenerating) return;

    const key = inputKey;
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
        ...(compatibility ? { compatibility } : {}),
      });
      setResult({ key, recipe });
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

  return (
    <div className="app">
      <main className="workspace">
        <section className="stage">
          <p className="instructions">
            drag and drop any selection of at least 3 ingredients for a yummy drink
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
          <SelectedBubbles selected={selected} onRemove={removeIngredient} />
        </section>

        <RecipePanel
          aiRecipe={aiRecipe}
          isGenerating={isGenerating}
          error={aiError}
          compatibility={compatibility}
        >
          <GenerateControls
            temperature={temperature}
            sweetness={sweetness}
            servings={servings}
            onTemperature={setTemperature}
            onSweetness={setSweetness}
            onServings={setServings}
            canGenerate={selected.length >= 3}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </RecipePanel>
      </main>
    </div>
  );
}
