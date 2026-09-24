import { useMemo, useState } from 'react';
import { DrinkTypeSelector } from './components/DrinkTypeSelector';
import { MixingCanvas } from './components/MixingCanvas';
import { RecipePanel } from './components/RecipePanel';
import { INGREDIENTS, getIngredientById } from './data/ingredients';
import { DRINK_TYPES, type DrinkType } from './types';
import { generateRecipe } from './utils/recipeEngine';
import './App.css';

function App() {
  const [drinkType, setDrinkType] = useState<DrinkType>('refresher');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragOver, setDragOver] = useState(false);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => getIngredientById(id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i)),
    [selectedIds],
  );

  const recipe = useMemo(
    () => generateRecipe(selected, drinkType),
    [selected, drinkType],
  );

  function addIngredient(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeIngredient(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function clearAll() {
    setSelectedIds([]);
  }

  return (
    <div className={`app theme-${drinkType}`}>
      <header className="topbar">
        <div className="brand">
          <p className="brand-kicker">atelier</p>
          <h1>Cafe Palette</h1>
          <p className="brand-sub">compose a drink · read the recipe</p>
        </div>
        <DrinkTypeSelector
          value={drinkType}
          onChange={setDrinkType}
          options={DRINK_TYPES}
        />
      </header>

      <main className="workspace">
        <section className="center-stage">
          <MixingCanvas
            pantry={INGREDIENTS}
            inGlass={selected}
            drinkType={drinkType}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            isDragOver={isDragOver}
            setDragOver={setDragOver}
          />
        </section>

        <RecipePanel
          selected={selected}
          recipe={recipe}
          onRemove={removeIngredient}
          onClear={clearAll}
        />
      </main>
    </div>
  );
}

export default App;
