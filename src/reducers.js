import services from './backend';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import actions from './actions';

function changeOrganization(state = 'irc', action) {
  switch (action.type) {
    case actions.actionTypes.CHANGE_ORGANIZATION:
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
