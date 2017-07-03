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

// Configure Redux store & reducers
export default {
  organization: changeOrganization,
  articles: services.articles.reducer,
  countries: services.countries.reducer,
  categories: services.categories.reducer,
};
