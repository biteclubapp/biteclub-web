// Reviewed draft ingredient lines, grouped explicitly. One checkbox per shared ingredient.
// Amounts stay attached to their dishes: no assumed unit conversions or extra leftover turkey.
export const groceryGroups = ['produce', 'meat', 'dairy', 'pantry', 'bakery'] as const;
export const groceries = [
  {
    "id": "turkey",
    "name": "Turkey",
    "group": "meat",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "1 boneless, skin-on turkey breast, about 3 lb (1.4 kg)"
      }
    ]
  },
  {
    "id": "salt",
    "name": "Salt",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "2 tsp kosher salt"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "1 tsp kosher salt"
      },
      {
        "recipe": "cranberry-orange-sauce",
        "text": "Pinch of kosher salt"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "1 tbsp kosher salt, for the bean water, plus ½ tsp for the sauce"
      },
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "1 tsp kosher salt"
      },
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "1 tsp kosher salt"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "1 tsp kosher salt, divided, plus more to taste"
      },
      {
        "recipe": "pecan-pie",
        "text": "½ tsp kosher salt"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "¼ tsp kosher salt"
      }
    ]
  },
  {
    "id": "butter",
    "name": "Butter",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "4 tbsp (57 g) unsalted butter, softened"
      },
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "6 tbsp (85 g) unsalted butter"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "½ cup (113 g) unsalted butter, plus more for the dish"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "4 tbsp (57 g) unsalted butter"
      },
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "1 tbsp unsalted butter, softened"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "4 tbsp (57 g) unsalted butter"
      },
      {
        "recipe": "pecan-pie",
        "text": "4 tbsp (57 g) unsalted butter, melted and cooled"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "6 tbsp (85 g) unsalted butter, melted"
      }
    ]
  },
  {
    "id": "garlic",
    "name": "Garlic",
    "group": "produce",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "3 garlic cloves, finely grated"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "2 garlic cloves, minced"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "3 garlic cloves, thinly sliced"
      }
    ]
  },
  {
    "id": "sage",
    "name": "Sage",
    "group": "produce",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "1 tbsp finely chopped fresh sage"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "2 tbsp chopped fresh sage (or 2 tsp dried), plus a few leaves for the top"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "16 fresh sage leaves: 8 chopped, 8 left whole"
      }
    ]
  },
  {
    "id": "rosemary",
    "name": "Rosemary",
    "group": "produce",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "1 tbsp finely chopped fresh rosemary, plus 3–4 whole sprigs for the platter"
      }
    ]
  },
  {
    "id": "thyme",
    "name": "Thyme",
    "group": "produce",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "1 tbsp fresh thyme leaves"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "1 tbsp fresh thyme leaves (or 1 tsp dried)"
      },
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "1 tbsp fresh thyme leaves"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "2 tsp fresh thyme leaves, plus 2 sprigs for the top"
      }
    ]
  },
  {
    "id": "lemon",
    "name": "Lemon",
    "group": "produce",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "Finely grated zest of 1 lemon"
      },
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "1 tbsp fresh lemon juice plus 1 tsp finely grated zest"
      }
    ]
  },
  {
    "id": "pepper",
    "name": "Pepper",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "½ tsp freshly ground black pepper"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "½ tsp freshly ground black pepper"
      },
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "¼ tsp freshly ground black pepper"
      },
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "½ tsp freshly ground black pepper"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "½ tsp freshly ground black pepper"
      }
    ]
  },
  {
    "id": "olive-oil",
    "name": "Olive oil",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "herb-roasted-turkey-breast",
        "text": "1 tbsp olive oil"
      },
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "2 tbsp olive oil"
      },
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "3 tbsp extra-virgin olive oil"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "4 tbsp olive oil, divided"
      }
    ]
  },
  {
    "id": "shallots",
    "name": "Shallots",
    "group": "produce",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "1 large shallot, finely chopped"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "4 large shallots, sliced into thin rings"
      },
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "2 shallots, thinly sliced"
      }
    ]
  },
  {
    "id": "flour",
    "name": "Flour",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "½ cup (65 g) all-purpose flour"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "⅓ cup (45 g) all-purpose flour, for the shallots, plus ¼ cup (30 g) for the sauce"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "⅓ cup (45 g) all-purpose flour"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "1 tbsp all-purpose flour"
      }
    ]
  },
  {
    "id": "stock",
    "name": "Stock",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "4 cups (960 ml) turkey stock (or low-sodium chicken stock), warmed"
      },
      {
        "recipe": "sage-onion-stuffing",
        "text": "2½ cups (600 ml) low-sodium chicken or turkey broth"
      },
      {
        "recipe": "green-bean-casserole",
        "text": "1 cup (240 ml) low-sodium chicken or vegetable broth"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "2 cups (480 ml) turkey or low-sodium chicken broth"
      }
    ]
  },
  {
    "id": "thyme-and-sage",
    "name": "Thyme and sage",
    "group": "produce",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "2 fresh thyme sprigs and 4 fresh sage leaves"
      }
    ]
  },
  {
    "id": "soy-sauce",
    "name": "Soy sauce",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "1 tbsp soy sauce"
      }
    ]
  },
  {
    "id": "vinegar",
    "name": "Vinegar",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "1 tsp apple cider vinegar"
      }
    ]
  },
  {
    "id": "seasoning",
    "name": "Seasoning",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "make-ahead-turkey-gravy",
        "text": "Kosher salt and freshly ground black pepper, to taste"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 tsp kosher salt and ¼ tsp black pepper, plus more to taste"
      }
    ]
  },
  {
    "id": "bread",
    "name": "Bread",
    "group": "bakery",
    "requirements": [
      {
        "recipe": "sage-onion-stuffing",
        "text": "1 lb (450 g) sturdy white or sourdough bread, cut into ¾-inch (2 cm) cubes (about 12 cups)"
      },
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "4 slices sourdough or whole-grain bread"
      }
    ]
  },
  {
    "id": "onions",
    "name": "Onions",
    "group": "produce",
    "requirements": [
      {
        "recipe": "sage-onion-stuffing",
        "text": "1 large yellow onion, diced"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 medium yellow onion, diced"
      }
    ]
  },
  {
    "id": "celery",
    "name": "Celery",
    "group": "produce",
    "requirements": [
      {
        "recipe": "sage-onion-stuffing",
        "text": "3 celery ribs, diced"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "2 celery ribs, sliced"
      }
    ]
  },
  {
    "id": "parsley",
    "name": "Parsley",
    "group": "produce",
    "requirements": [
      {
        "recipe": "sage-onion-stuffing",
        "text": "¼ cup chopped flat-leaf parsley"
      },
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "1 tbsp chopped flat-leaf parsley"
      }
    ]
  },
  {
    "id": "eggs",
    "name": "Eggs",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "sage-onion-stuffing",
        "text": "1 large egg"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 large egg, beaten"
      },
      {
        "recipe": "pecan-pie",
        "text": "3 large eggs"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "3 large eggs"
      }
    ]
  },
  {
    "id": "cranberries",
    "name": "Cranberries",
    "group": "produce",
    "requirements": [
      {
        "recipe": "cranberry-orange-sauce",
        "text": "1 bag (12 oz / 340 g) fresh or frozen cranberries"
      }
    ]
  },
  {
    "id": "sugar",
    "name": "Sugar",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "cranberry-orange-sauce",
        "text": "¾ cup (150 g) granulated sugar"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "1½ cups (300 g) granulated sugar"
      }
    ]
  },
  {
    "id": "oranges",
    "name": "Oranges",
    "group": "produce",
    "requirements": [
      {
        "recipe": "cranberry-orange-sauce",
        "text": "½ cup (120 ml) fresh orange juice (1–2 oranges)"
      },
      {
        "recipe": "cranberry-orange-sauce",
        "text": "2 tsp finely grated orange zest, plus a few thin strips for garnish"
      }
    ]
  },
  {
    "id": "green-beans",
    "name": "Green beans",
    "group": "produce",
    "requirements": [
      {
        "recipe": "green-bean-casserole",
        "text": "2 lb (900 g) fresh green beans, trimmed and halved"
      }
    ]
  },
  {
    "id": "neutral-oil",
    "name": "Neutral oil",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "green-bean-casserole",
        "text": "1 cup (240 ml) neutral oil, for frying"
      },
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "2 tbsp neutral oil"
      }
    ]
  },
  {
    "id": "mushrooms",
    "name": "Mushrooms",
    "group": "produce",
    "requirements": [
      {
        "recipe": "green-bean-casserole",
        "text": "12 oz (340 g) cremini mushrooms, sliced"
      }
    ]
  },
  {
    "id": "milk",
    "name": "Milk",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "green-bean-casserole",
        "text": "1 cup (240 ml) whole milk"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 cup (240 ml) whole milk"
      }
    ]
  },
  {
    "id": "pepper-and-nutmeg",
    "name": "Pepper and nutmeg",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "green-bean-casserole",
        "text": "¼ tsp freshly ground black pepper and a pinch of nutmeg"
      }
    ]
  },
  {
    "id": "sweet-potatoes",
    "name": "Sweet potatoes",
    "group": "produce",
    "requirements": [
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "2½ lb (1.1 kg) sweet potatoes, peeled and cut into 1-inch (2.5 cm) cubes"
      }
    ]
  },
  {
    "id": "maple-syrup",
    "name": "Maple syrup",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "3 tbsp pure maple syrup"
      }
    ]
  },
  {
    "id": "cinnamon",
    "name": "Cinnamon",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "maple-roasted-sweet-potatoes",
        "text": "½ tsp ground cinnamon"
      }
    ]
  },
  {
    "id": "Brussels-sprouts",
    "name": "Brussels sprouts",
    "group": "produce",
    "requirements": [
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "2 lb (900 g) Brussels sprouts, trimmed and halved"
      }
    ]
  },
  {
    "id": "Parmesan",
    "name": "Parmesan",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "crispy-roasted-brussels-sprouts",
        "text": "¼ cup (20 g) finely grated Parmesan"
      }
    ]
  },
  {
    "id": "butternut-squash",
    "name": "Butternut squash",
    "group": "produce",
    "requirements": [
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "2 medium butternut squash (about 2 lb / 900 g each), halved lengthwise and seeded"
      }
    ]
  },
  {
    "id": "wild-rice",
    "name": "Wild rice",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "1 cup (170 g) wild rice, rinsed"
      }
    ]
  },
  {
    "id": "vegetable-broth",
    "name": "Vegetable broth",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "3 cups (720 ml) vegetable broth"
      }
    ]
  },
  {
    "id": "dried-cranberries",
    "name": "Dried cranberries",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "½ cup (60 g) dried cranberries"
      }
    ]
  },
  {
    "id": "pecans",
    "name": "Pecans",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "wild-rice-stuffed-butternut-squash",
        "text": "½ cup (55 g) pecans, toasted and chopped"
      },
      {
        "recipe": "pecan-pie",
        "text": "2½ cups (250 g) pecan halves, divided"
      }
    ]
  },
  {
    "id": "leftover-cranberry-sauce",
    "name": "Leftover cranberry sauce",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "¼ cup (70 g) cranberry sauce (leftover or homemade)"
      }
    ]
  },
  {
    "id": "leftover-turkey",
    "name": "Leftover turkey",
    "group": "meat",
    "requirements": [
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "8 oz (225 g) sliced leftover roast turkey"
      },
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "3 cups (about 400 g) shredded cooked turkey"
      },
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "3 cups (about 400 g) shredded cooked turkey"
      }
    ]
  },
  {
    "id": "brie",
    "name": "Brie",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "3 oz (85 g) brie, thinly sliced"
      }
    ]
  },
  {
    "id": "spinach",
    "name": "Spinach",
    "group": "produce",
    "requirements": [
      {
        "recipe": "turkey-cranberry-sandwich",
        "text": "1 cup (30 g) baby spinach"
      }
    ]
  },
  {
    "id": "carrots",
    "name": "Carrots",
    "group": "produce",
    "requirements": [
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "2 carrots, sliced into half-moons"
      }
    ]
  },
  {
    "id": "peas",
    "name": "Peas",
    "group": "produce",
    "requirements": [
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 cup (140 g) frozen peas"
      }
    ]
  },
  {
    "id": "puff-pastry",
    "name": "Puff pastry",
    "group": "bakery",
    "requirements": [
      {
        "recipe": "skillet-turkey-pot-pie",
        "text": "1 sheet (about 9 oz / 250 g) frozen puff pastry, thawed in the fridge"
      }
    ]
  },
  {
    "id": "Monterey-Jack",
    "name": "Monterey Jack",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "1½ cups (6 oz / 170 g) shredded Monterey Jack"
      }
    ]
  },
  {
    "id": "green-chiles",
    "name": "Green chiles",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "1 can (4 oz / 113 g) diced green chiles"
      }
    ]
  },
  {
    "id": "cilantro",
    "name": "Cilantro",
    "group": "produce",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "½ cup chopped fresh cilantro"
      }
    ]
  },
  {
    "id": "cumin",
    "name": "Cumin",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "½ tsp ground cumin"
      }
    ]
  },
  {
    "id": "salsa-verde",
    "name": "Salsa verde",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "3 cups (24 oz / 700 ml) tomatillo salsa verde, store-bought or homemade, divided"
      }
    ]
  },
  {
    "id": "tortillas",
    "name": "Tortillas",
    "group": "bakery",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "12 corn tortillas (6-inch / 15 cm)"
      }
    ]
  },
  {
    "id": "sour-cream",
    "name": "Sour cream",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "leftover-turkey-enchiladas",
        "text": "Sour cream, for serving (optional)"
      }
    ]
  },
  {
    "id": "deep-dish-pie-crust",
    "name": "Deep-dish pie crust",
    "group": "bakery",
    "requirements": [
      {
        "recipe": "pecan-pie",
        "text": "1 unbaked 9-inch (23 cm) deep-dish pie crust, store-bought or homemade, chilled"
      }
    ]
  },
  {
    "id": "corn-syrup",
    "name": "Corn syrup",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "pecan-pie",
        "text": "1 cup (240 ml) light corn syrup"
      }
    ]
  },
  {
    "id": "brown-sugar",
    "name": "Brown sugar",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "pecan-pie",
        "text": "½ cup (100 g) packed light brown sugar"
      }
    ]
  },
  {
    "id": "vanilla",
    "name": "Vanilla",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "pecan-pie",
        "text": "1 tsp vanilla extract"
      },
      {
        "recipe": "chocolate-chess-pie",
        "text": "1½ tsp vanilla extract"
      }
    ]
  },
  {
    "id": "pie-crust",
    "name": "Pie crust",
    "group": "bakery",
    "requirements": [
      {
        "recipe": "chocolate-chess-pie",
        "text": "1 unbaked 9-inch (23 cm) pie crust, store-bought or homemade, chilled"
      }
    ]
  },
  {
    "id": "cocoa",
    "name": "Cocoa",
    "group": "pantry",
    "requirements": [
      {
        "recipe": "chocolate-chess-pie",
        "text": "¼ cup (20 g) unsweetened cocoa powder"
      }
    ]
  },
  {
    "id": "evaporated-milk",
    "name": "Evaporated milk",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "chocolate-chess-pie",
        "text": "1 can (5 oz / 150 ml) evaporated milk"
      }
    ]
  },
  {
    "id": "whipped-cream",
    "name": "Whipped cream",
    "group": "dairy",
    "requirements": [
      {
        "recipe": "chocolate-chess-pie",
        "text": "Lightly sweetened whipped cream, for serving (optional)"
      }
    ]
  }
] as const;

export function groceryText(titles: Record<string, string> = {}): string {
  return 'Thanksgiving grocery list — @kitchen\nAmounts cover all 13 recipes at their stated yields. Reserve turkey and cranberry sauce for leftovers; do not buy those twice. The turkey breast may not leave enough for all three leftover dishes. Water is omitted.\n\n' + groceryGroups.map(group =>
    group.toUpperCase() + '\n' + groceries.filter(item => item.group === group).map(item =>
      item.name + '\n' + item.requirements.map(line => '  • ' + line.text + ' (' + (titles[line.recipe] || line.recipe.replace(/-/g, ' ')) + ')').join('\n')
    ).join('\n')
  ).join('\n\n');
}
