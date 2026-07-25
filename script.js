
const addBtn = document.getElementById('add-ingredient');
const container = document.getElementById('ingredients-container');
const resultsBody = document.getElementById('results-body');
const originalInput = document.getElementById('original-servings');
const targetInput = document.getElementById('target-servings');
const recipeNameInput = document.getElementById('recipe-name');
const placeholderText = document.getElementById('placeholder-text');
const calcBtn = document.getElementById('calc-btn');
const saveBtn = document.getElementById('save-btn');
const savedList = document.getElementById('saved-list');


const unitOptions = `
    <option value="g">g</option>
    <option value="kg">kg</option>
    <option value="ml">ml</option>
    <option value="l">l</option>
    <option value="cup">cup(s)</option>
    <option value="tbsp">tbsp</option>
    <option value="tsp">tsp</option>
    <option value="piece">piece(s)</option>
`;

addBtn.onclick = function() {
    const newRow = document.createElement('div');
    newRow.className = 'ingredients-row';
    newRow.innerHTML = `
        <input type="text" placeholder="Component Name" class="ing-name">
        <input type="number" placeholder="Qty" class="ing-amount" min="0" step="any">
        <select class="ing-unit">${unitOptions}</select>
        <button type="button" class="remove-btn">×</button>
    `;
    container.appendChild(newRow);
};

container.onclick = function(event) {
    if (event.target.classList.contains('remove-btn')) {
        event.target.parentElement.remove();
    }
};

function calculate() {
    const original = parseFloat(originalInput.value) || 1;
    const target = parseFloat(targetInput.value) || 1;
    const ratio = target / original;

    resultsBody.innerHTML = "";
    const rows = document.querySelectorAll('.ingredients-row');
    let hasValidItems = false;

    rows.forEach(row => {
        const name = row.querySelector('.ing-name').value.trim();
        const amount = parseFloat(row.querySelector('.ing-amount').value);
        const unit = row.querySelector('.ing-unit').value;

        if (name && !isNaN(amount)) {
            hasValidItems = true;
            const newAmount = (amount * ratio).toFixed(2);
            
            const formattedNew = parseFloat(newAmount); 

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${name}</td>
                <td>${amount} ${unit}</td>
                <td><strong>${formattedNew} ${unit}</strong></td>
            `;
            resultsBody.appendChild(tr);
        }
    });

    if (placeholderText) {
        placeholderText.style.display = hasValidItems ? 'none' : 'block';
    }
}

calcBtn.onclick = function() {
    calculate();
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
};

saveBtn.onclick = function() {
    const name = recipeNameInput.value.trim();
    if (!name) {
        alert("Please enter a Recipe Name before saving!");
        return;
    }

    const rows = document.querySelectorAll('.ingredients-row');
    const ingredients = [];

    rows.forEach(row => {
        const ingName = row.querySelector('.ing-name').value.trim();
        const ingAmount = row.querySelector('.ing-amount').value;
        const ingUnit = row.querySelector('.ing-unit').value;

        if (ingName && ingAmount) {
            ingredients.push({ name: ingName, amount: ingAmount, unit: ingUnit });
        }
    });

    if (ingredients.length === 0) {
        alert("Please add at least one valid ingredient!");
        return;
    }

    const recipeData = {
        id: Date.now(),
        name: name,
        servings: originalInput.value,
        ingredients: ingredients
    };

    let savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    savedRecipes.push(recipeData);
    localStorage.setItem('recipes', JSON.stringify(savedRecipes));

    renderSavedRecipes();
    alert(`"${name}" saved successfully!`);
};

function renderSavedRecipes() {
    savedList.innerHTML = "";
    let savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');

    if (savedRecipes.length === 0) {
        savedList.innerHTML = "<p style='color:#8d6e63; font-style:italic;'>No saved recipes yet.</p>";
        return;
    }

    savedRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.className = 'saved-item';
        li.innerHTML = `
            <span><strong>${recipe.name}</strong> (${recipe.servings} servings)</span>
            <div>
                <button class="load-btn" onclick="loadRecipe(${recipe.id})">Load</button>
                <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">🗑️</button>
            </div>
        `;
        savedList.appendChild(li);
    });
}

window.loadRecipe = function(id) {
    let savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const recipe = savedRecipes.find(r => r.id === id);

    if (!recipe) return;

    recipeNameInput.value = recipe.name;
    originalInput.value = recipe.servings;
    container.innerHTML = "";

    recipe.ingredients.forEach(ing => {
        const newRow = document.createElement('div');
        newRow.className = 'ingredients-row';
        newRow.innerHTML = `
            <input type="text" value="${ing.name}" class="ing-name">
            <input type="number" value="${ing.amount}" class="ing-amount" min="0" step="any">
            <select class="ing-unit">${unitOptions}</select>
            <button type="button" class="remove-btn">×</button>
        `;
        newRow.querySelector('.ing-unit').value = ing.unit;
        container.appendChild(newRow);
    });

    calculate();
};


window.deleteRecipe = function(id) {
    let savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    savedRecipes = savedRecipes.filter(r => r.id !== id);
    localStorage.setItem('recipes', JSON.stringify(savedRecipes));
    renderSavedRecipes();
};

renderSavedRecipes();