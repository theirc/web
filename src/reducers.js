import services from './backend';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'

// Configure Redux store & reducers
export default {
  articles: services.articles.reducer,
  countries: services.countries.reducer,
  categories: services.categories.reducer,
};
