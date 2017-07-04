import {createAction} from  'redux-actions';

const actionTypes = {
    changeOrganization: 'CHANGE_ORGANIZATION',
    changeCountry: 'CHANGE_COUNTRY',

}

export default {
    actionTypes,
    changeOrganization: createAction(actionTypes.changeOrganization),
    changeCountry: createAction(actionTypes.changeCountry),
}