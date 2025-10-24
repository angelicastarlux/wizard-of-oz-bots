const characters = require('./oz-characters'); // Import characters data
const categories = require('./categories'); // Import categories data

// Function to handle the search logic
function searchCharacters(query) {
  const searchQuery = query.trim().toLowerCase();

  // If the query is a category, filter characters by category
  if (categories.includes(searchQuery)) {
    const filteredCharacters = characters.filter(character => character.category.toLowerCase() === searchQuery);
    if (filteredCharacters.length === 0) {
      return `No characters found in the category "${searchQuery}".`;
    }

    let resultMessage = `Characters in the "${searchQuery}" category:\n`;
    filteredCharacters.forEach(character => {
      resultMessage += `${character.name} - ${character.image}\n`;
    });
    return resultMessage;
  }

  // Otherwise, treat the query as a name search
  const foundCharacters = characters.filter(character => character.name.toLowerCase().includes(searchQuery));
  if (foundCharacters.length === 0) {
    return `No characters found matching "${query}".`;
  }

  let resultMessage = `Characters matching "${query}":\n`;
  foundCharacters.forEach(character => {
    resultMessage += `${character.name} - ${character.image}\n`;
  });
  return resultMessage;
}

module.exports = searchCharacters;