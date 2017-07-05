import {createAction} from  'redux-actions';

const actionTypes = {
    changeOrganization: 'CHANGE_ORGANIZATION',
    changeCountry: 'CHANGE_COUNTRY',
    selectCategory: 'SELECT_CATEGORY',
    selectArticle: 'SELECT_ARTICLE',
    recordMatch: 'RECORD_MATCH',

}

export default {
    actionTypes,
    changeOrganization: createAction(actionTypes.changeOrganization),
    changeCountry: createAction(actionTypes.changeCountry),
    selectCategory: createAction(actionTypes.selectCategory),
    selectArticle: createAction(actionTypes.selectArticle),
    recordMatch: createAction(actionTypes.recordMatch),
}