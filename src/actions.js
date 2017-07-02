import {createAction} from  'redux-actions';

const actionTypes = {
    CHANGE_ORGANIZATION: 'CHANGE_ORGANIZATION'

}

export default {
    actionTypes,
    changeOrganization: createAction(actionTypes.CHANGE_ORGANIZATION)
}