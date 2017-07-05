import services from './backend';
import actions from './actions';

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
      return action.payload.slug;
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


// Configure Redux store & reducers
export default {
  match: recordMatch,
  country: changeCountry,
  category: selectCategory,
  article: selectArticle,
  countrySlug: changeCountrySlug,
  organization: changeOrganization,
  articles: services.articles.reducer,
  countries: services.countries.reducer,
  categories: services.categories.reducer,
};
