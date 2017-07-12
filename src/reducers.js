import services from './backend';
import actions from './actions';

let defaultLanguage = '';
if (global.navigator.language) {
  defaultLanguage = global.navigator.language.split('-')[0];
}
const getDirection = (l) => ['ar', 'fa'].indexOf(l) > -1 ? 'rtl' : 'ltr';

function changeOrganization(state = 'irc', action) {
  switch (action.type) {
    case actions.actionTypes.changeOrganization:
      return action.payload;
    default:
      return state
  }
}
function changeCountry(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.changeCountry:
      return action.payload;
    default:
      return state
  }
}

function changeCountrySlug(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.changeCountry:
      return (action.payload && action.payload.slug) || null;
    default:
      return state
  }
}
function selectCategory(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.selectCategory:
      return action.payload || null;
    default:
      return state
  }
}
function selectArticle(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.selectArticle:
      return action.payload || null;
    default:
      return state
  }
}

function recordMatch(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.recordMatch:
      return action.payload || null;
    default:
      return state
  }
}


function selectCountryList(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.selectCountryList:
      return action.payload || null;
    default:
      return state
  }
}


function changeLanguage(state = defaultLanguage, action) {
  switch (action.type) {
    case actions.actionTypes.changeLanguage:
      return action.payload || null;
    default:
      return state
  }
}

function changeDirection(state = getDirection(defaultLanguage), action) {
  switch (action.type) {
    case actions.actionTypes.changeLanguage:
      return getDirection(action.payload);
    default:
      return state
  }
}


function recordCoordinates(state = null, action) {
  switch (action.type) {
    case actions.actionTypes.recordCoordinates:
      return action.payload;
    default:
      return state
  }
}

// Configure Redux store & reducers
export default {
  match: recordMatch,
  currentCoordinates: recordCoordinates,
  
  country: changeCountry,
  category: selectCategory,
  article: selectArticle,
  language: changeLanguage,
  direction: changeDirection,
  countryList: selectCountryList,
  countrySlug: changeCountrySlug,
  organization: changeOrganization,

  articles: services.articles.reducer,
  countries: services.countries.reducer,
  categories: services.categories.reducer,
};
