import {createAction} from  'redux-actions';

const actionTypes = {
    changeOrganization: 'CHANGE_ORGANIZATION',

}

export default {
    actionTypes,
    changeOrganization: createAction(actionTypes.changeOrganization),
}