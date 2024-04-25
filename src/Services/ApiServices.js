/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
import axios from 'axios';
import getCookieService from './GetCookieService';

const usersUrl = 'http://182.160.114.100:5001/';
// const usersUrl = 'http://182.160.114.100:5003/';
// const usersUrl = 'http://localhost:5001/';

const sapTokenUrl =
  'https://my407415-api.s4hana.cloud.sap/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder?$top=1&$format=json';
const sapCreateSoUrl = 'https://my407415-api.s4hana.cloud.sap:443/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder';
const sapGetSoUrl = 'https://my407415-api.s4hana.cloud.sap:443/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder';

export const signup = async (user) => {
  try {
    return await axios.post(`${usersUrl}signup/`, user);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const compareOtp = async (verifyUser) => {
  try {
    return await axios.post(`${usersUrl}compare-otp/`, verifyUser);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const sendOtp = async (body) => {
  try {
    return await axios.post(`${usersUrl}send-otp/`, body);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const userProcess = async (userInfo) => {
  try {
    return await axios.post(`${usersUrl}user-signup-process/`, userInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getUserEmailAddress = async (userInfo) => {
  try {
    return await axios.get(`${usersUrl}get-email-address/${userInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const login = async (user) => {
  try {
    return await axios.post(`${usersUrl}login/`, user);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getLoggedInUserDetails = async (loginToken) => {
  console.log(loginToken);

  try {
    return await axios.get(`${usersUrl}loggedin-user/`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const comparePasswordService = async (loginToken, requestBody) => {
  try {
    return await axios.post(`${usersUrl}compare-password/`, requestBody, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// change and forget password service
export const changePasswordService = async (loginToken, requestBody) => {
  try {
    return await axios.put(`${usersUrl}change-password/`, requestBody, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const forgetPasswordService = async (requestBody) => {
  try {
    return await axios.put(`${usersUrl}forget-password/`, requestBody);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAccountDetails = async (emailAddress) => {
  const cookie = getCookieService('jwt-token-cookie');

  try {
    return await axios.get(`${usersUrl}account-info/${emailAddress}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getUserProfileDetails = async (loginToken) => {
  console.log(loginToken);

  try {
    return await axios.get(`${usersUrl}profile/`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateProfileDetails = async (emailAddress, profileDetails) => {
  try {
    console.log(emailAddress);
    return await axios.put(`${usersUrl}update/profile/${emailAddress}`, profileDetails);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const comparePassword = async (passwordInfo) => {
  try {
    return await axios.post(`${usersUrl}compare-password/`, passwordInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updatePassword = async (passwordInfo) => {
  try {
    return await axios.put(`${usersUrl}update-password/`, passwordInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateUsername = async (usernameInfo) => {
  try {
    return await axios.put(`${usersUrl}update-username/`, usernameInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getUsersDetails = async () => {
  try {
    return await axios.get(`${usersUrl}users/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateUserStatus = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}update-status/`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const uploadProfilePhoto = async (emailAddress, bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}upload/profile-photo/${emailAddress}`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteUser = async (emailAddress) => {
  const cookie = getCookieService('jwt-token-cookie');

  try {
    return await axios.delete(`${usersUrl}remove-user/${emailAddress}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const sendEmailService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}send-email/`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBlogsDetails = async () => {
  try {
    return await axios.get(`${usersUrl}blogs/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getReadCount = async (blogId) => {
  const cookie = getCookieService('jwt-token-cookie');

  try {
    return await axios.get(`${usersUrl}read-count/${blogId}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addBlogReadService = async (blogId) => {
  const cookie = getCookieService('jwt-token-cookie');
  console.log(cookie);

  try {
    return await axios.post(
      `${usersUrl}read-blog/${blogId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
      }
    );
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const likeBlogService = async (blogId) => {
  const cookie = getCookieService('jwt-token-cookie');
  console.log(cookie);

  try {
    return await axios.post(
      `${usersUrl}like-blog/${blogId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
      }
    );
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getLikedBlogDetails = async (blogId) => {
  const cookie = getCookieService('jwt-token-cookie');

  try {
    return await axios.get(`${usersUrl}like-stat/${blogId}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getLikeCount = async (blogId) => {
  const cookie = getCookieService('jwt-token-cookie');

  try {
    return await axios.get(`${usersUrl}like-count/${blogId}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const logoutService = async () => {
  try {
    return await axios.get(`${usersUrl}logout/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// admin panel
// UOM
export const getUomDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-unit-measure/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addUomDetails = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}add-unit-measure`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateUomDetails = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}update-unit-measure`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const disableUomDetails = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}disable-unit-measure`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getHrLocationsDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-hr-locations-all/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getHrLocationsIdDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-hr-locations-id/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getPerAllPeoplesDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-per-all-peoples/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAuthStatusDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-auth-status/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getfnduserDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-fnd-user/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getMainSystemMenuDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-main-system-menu/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getAllMtlTransactionTypes = async () => {
  try {
    return await axios.get(`${usersUrl}get-mtl-transaction-types/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getAllMtlTransactions = async () => {
  try {
    return await axios.get(`${usersUrl}get-mtl-material-transactions/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getFndUserIds = async () => {
  try {
    return await axios.get(`${usersUrl}get-fnd-user/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getMenuIds = async () => {
  try {
    return await axios.get(`${usersUrl}get-menu-ids/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getMenusDetails = async (user) => {
  try {
    return await axios.get(`${usersUrl}get-menus/`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateMenuService = async (user, requestInfo) => {
  try {
    return await axios.put(`${usersUrl}updateUserMenuAssign/`, requestInfo, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getperPerAllPeoplesDetails = async (person_id) => {
  try {
    return await axios.get(`${usersUrl}getper-per-all-peoples/${person_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerFndUserDetails = async (user_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-fnd-user/${user_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getperMainSystemMenuDetails = async (system_menu_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-main-system-menu/${system_menu_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getperMenuDetails = async (menu_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-menus/${menu_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getHrAllOrganizationUnits = async () => {
  try {
    return await axios.get(`${usersUrl}get-hr-organization-units/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerHrLocationsDetails = async (location_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-hr-locations-all/${location_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerHrOrganizationUnits = async (organization_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-hr-organization-units/${organization_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerAllMtlTransactionTypes = async (transaction_type_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-mtl-transaction-types/${transaction_type_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addHrLocationsDetails = async (location) => {
  console.log('location for api ', location);
  try {
    return await axios.post(`${usersUrl}add-hr-locations-all/`, location);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addPerAllPeopleDetails = async (people) => {
  console.log('people for api ', people);
  try {
    return await axios.post(`${usersUrl}add-per-all-peoples/`, people);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addFndUserDetails = async (fnduser) => {
  console.log('people for api ', fnduser);
  try {
    return await axios.post(`${usersUrl}add-fnd-user/`, fnduser);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addMainSystemMenuDetails = async (mainsystemmenu) => {
  console.log('people for api ', mainsystemmenu);
  try {
    return await axios.post(`${usersUrl}add-main-system-menu/`, mainsystemmenu);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addMenusDetails = async (menus) => {
  console.log('people for api ', menus);
  try {
    return await axios.post(`${usersUrl}add-menus/`, menus);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addSubMenusDetails = async (submenus) => {
  console.log('people for api ', submenus);
  try {
    return await axios.post(`${usersUrl}add-sub-menu/`, submenus);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const addUserAssign = async (assign) => {
  console.log('people for api ', assign);
  try {
    return await axios.post(`${usersUrl}add-user-assign/`, assign);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addHrOrganizationUnitsDetails = async (organization) => {
  console.log('organization for api ', organization);
  try {
    console.log('Inside it ', organization);
    return await axios.post(`${usersUrl}add-hr-organization-units/`, organization);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addMtlTransactionTypesDetails = async (transaction) => {
  console.log('Transaction for api ', transaction);
  try {
    console.log('Inside it ', transaction);
    return await axios.post(`${usersUrl}add-mtl-transaction-types/`, transaction);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// eslint-disable-next-line camelcase
export const updateHrLocationsDetails = async (locationsDetails) => {
  console.log('location for api ', locationsDetails.location_id);
  try {
    // eslint-disable-next-line camelcase
    return await axios.put(`${usersUrl}update-hr-locations-all/${locationsDetails.location_id}`, locationsDetails);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// item master
export const getSytemItems = async () => {
  try {
    return await axios.get(`${usersUrl}get-item-master/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getItemsByCategory = async (categoryId) => {
  try {
    return await axios.get(`${usersUrl}get-item-master/${categoryId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getItemListService = async () => {
  try {
    return await axios.get(`${usersUrl}get-item-master/get/list`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addSystemItemsDetails = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}add-item-master`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateSystemItems = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}update-item-master`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const disableSystemItems = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}delete-item-master`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// txn request headers and lines
export const getTransactionTypeList = async () => {
  try {
    return await axios.get(`${usersUrl}get-mtl-transaction-types/list`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getOrganizationIdList = async () => {
  try {
    return await axios.get(`${usersUrl}get-hr-organization-units/list`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// export const getOrderNumberService = async () => {
//   try {
//     return await axios.get(`${usersUrl}get-hr-organization-units/list`);
//   } catch (err) {
//     console.log(err.message);

//     return err.message;
//   }
// };

export const addTxnRequestHeader = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}add-txn-header`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getUserwiseTxnRequestHeader = async (bodyInfo) => {
  try {
    console.log(bodyInfo);
    return await axios.get(`${usersUrl}get-txn-header/${bodyInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addTxnRequestLines = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}add-txn-line`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getInventoryItemIdList = async () => {
  try {
    return await axios.get(`${usersUrl}get-item-master/inventory_item_id`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getUomCodeList = async () => {
  try {
    return await axios.get(`${usersUrl}get-unit-measure/uom_code`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteTxnRequestLines = async (lineId) => {
  console.log(lineId);
  try {
    return await axios.delete(`${usersUrl}delete-txn-lines/${lineId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteTxnRequestHeader = async (headerId) => {
  try {
    return await axios.delete(`${usersUrl}delete-txn-header/${headerId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// user menu services
export const getUserMenuList = async (userInfo, loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-menus/${userInfo}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// sales order module services
// sales order headers
export const addSalesOrderHeaderService = async (bodyInfo, loginToken) => {
  try {
    return await axios.post(`${usersUrl}add-sales-order-header`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteSalesOrderHeaderService = async (headerId) => {
  try {
    return await axios.delete(`${usersUrl}delete-sales-order-header/${headerId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateSalesOrderHeaderService = async (headerId, headerInfo) => {
  try {
    return await axios.put(`${usersUrl}update-sales-order-header/${headerId}`, headerInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateAccountsService = async (headerId, headerInfo) => {
  try {
    return await axios.put(`${usersUrl}mrlprodbankaccounts/update/${headerId}`, headerInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getSalesOrderHeaderService = async (requestInfo) => {
  try {
    return await axios.get(`${usersUrl}get-sales-order-header/${requestInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getSalesOrderHeadersByUserService = async (requestInfo) => {
  try {
    return await axios.get(`${usersUrl}get-sales-order-header/by-user/${requestInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// sales order lines
export const addSalesOrderLinesService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}sales-order-line/add`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteSalesOrderLinesService = async (lineId) => {
  try {
    return await axios.delete(`${usersUrl}sales-order-line/delete/${lineId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getSalesOrderLinesService = async (requestInfo) => {
  try {
    return await axios.get(`${usersUrl}sales-order-line/get/${requestInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getOrderNumberService = async (results, resultss) => {
  const obj = {
    start: results,
    end: resultss,
  };
  try {
    return await axios.post(`${usersUrl}get-order-number`, obj);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateSalesOrderLineService = async (lineId, lineInfo) => {
  try {
    return await axios.put(`${usersUrl}sales-order-line/update/${lineId}`, lineInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getCustomerListService = async (token) => {
  console.log(token);
  try {
    return await axios.get(`${usersUrl}customer-list/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// procedure calls
export const callSoApprovalService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}so-approval/call`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const callReqApprovalFromPanelService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}so-approval/submit-approval/`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// view calls
export const getWfNoficationViewService = async (requestInfo) => {
  try {
    return await axios.get(`${usersUrl}wf-notification-view/${requestInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getApprovalSequenceService = async (requestInfo) => {
  try {
    return await axios.get(`${usersUrl}so-approval/get-approval-seq/${requestInfo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// call functions
export const createSalesOrderNumberService = async () => {
  try {
    return await axios.get(`${usersUrl}create-salesorder-number/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerHzCustAccountsDetailsService = async (bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}update-item-master`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addHzCustAccountsDetails = async (location) => {
  console.log('location for api ', location);
  try {
    return await axios.post(`${usersUrl}add-hz-cust-accounts/`, location);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getHzCustAccountsDetails = async () => {
  try {
    return await axios.get(`${usersUrl}get-hz-cust-accounts/`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerHzCustAccountsDetails = async (cust_account_id) => {
  try {
    return await axios.get(`${usersUrl}get-per-hz-cust-accounts/${cust_account_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// Bank deposit services
export const getBankListService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbanks/get/list`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getDepositTypesService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}bank-deposit/type-list`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankBranchListService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankbranches/get/list`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankBranchesService = async (loginToken, bankId) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankbranches/get/list/${bankId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankAccountsViewService = async (loginToken, bankId) => {
  try {
    return await axios.get(`${usersUrl}bank-deposit/company-bank-account/view`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositViewService = async (loginToken, userId) => {
  try {
    console.log(userId);
    return await axios.get(`${usersUrl}bank-deposit/get/view/${userId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositViewFilterByDateService = async (loginToken, requestBody) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/customer/view/filterByDate`, requestBody, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositViewFilterByFromDateService = async (loginToken, requestBody) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/customer/view/filterByFromDate`, requestBody, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositViewFilterByToDateService = async (loginToken, requestBody) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/customer/view/filterByToDate`, requestBody, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAllBankDepositsForAccountsService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}bank-deposit/customer/view/`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositDetailsViewService = async (loginToken, userId) => {
  try {
    console.log(userId);
    return await axios.get(`${usersUrl}bank-deposit/view/${userId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankDepositDetailsService = async (loginToken, userId) => {
  try {
    console.log(userId);
    return await axios.get(`${usersUrl}bank-deposit/get/${userId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const uploadBankDepositAttachmentService = async (loginToken, bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/upload`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addBankDepositService = async (loginToken, bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/add`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const approveBankDepositService = async (loginToken, bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}bank-deposit/approve`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const rejectBankDepositService = async (loginToken, bodyInfo) => {
  try {
    return await axios.put(`${usersUrl}bank-deposit/reject`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const dowloadBankDepositReceiptService = async (loginToken, bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}bank-deposit/download`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
      responseType: 'arraybuffer',
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAllCustomerService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}customer-list/all`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPaymentMethodService = async (loginToken, depositTypeId) => {
  try {
    return await axios.get(`${usersUrl}bank-deposit/type/${depositTypeId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// SAP testing
export const getTokenService = async () => {
  try {
    return await axios.get(`${sapTokenUrl}`, {
      auth: {
        username: 'TEST_SALES_ORDER_0109',
        password: 'RwBznSbrjcngKNhxQXD8lfSuDginJkWDHXuK=HUp',
      },
      headers: {
        // Authorization: 'Basic VEVTVF9TQUxFU19PUkRFUl8wMTA5OlJ3QnpuU2JyamNuZ0tOaHhRWEQ4bGZTdURnaW5Ka1dESFh1Sz1IVXA=',
        'x-csrf-token': 'fetch',
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getSoDetailsService = async (soNumber) => {
  try {
    return await axios.get(`${sapGetSoUrl}('${soNumber}')?$format=json`, {
      headers: {
        'x-csrf-token': 'fetch',
        Authorization: 'Basic VEVTVF9TQUxFU19PUkRFUl8wMTA5OlJ3QnpuU2JyamNuZ0tOaHhRWEQ4bGZTdURnaW5Ka1dESFh1Sz1IVXA=',
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const createSalesOrderService = async (token, requestBody) => {
  console.log(token);
  try {
    return await axios.post(`${sapCreateSoUrl}`, requestBody, {
      auth: {
        username: 'TEST_SALES_ORDER_0109',
        password: 'RwBznSbrjcngKNhxQXD8lfSuDginJkWDHXuK=HUp',
      },
      headers: {
        // Authorization: 'Basic VEVTVF9TQUxFU19PUkRFUl8wMTA5OlJ3QnpuU2JyamNuZ0tOaHhRWEQ4bGZTdURnaW5Ka1dESFh1Sz1IVXA=',
        'x-csrf-token': token,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// vatpos integration
export const getSalesMasterDetailsService = async (requestBody) => {
  const url = requestBody.companyCode
    ? `http://taxpollbd.com/hssalesapi/api/Sale/GetByDate?fromDate=${requestBody.fromDate}&toDate=${requestBody.toDate}&companyCode=${requestBody.companyCode}`
    : `http://taxpollbd.com/hssalesapi/api/Sale/GetByDate?fromDate=${requestBody.fromDate}&toDate=${requestBody.toDate}`;

  console.log(url);
  try {
    return await axios.get(
      // `http://taxpollbd.com/hssalesapi/api/Sale/GetByDate?fromDate=${requestBody.fromDate}&toDate=${requestBody.toDate}`
      url
    );
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getSalesMasterDetailsByInvoiceService = async (requestBody) => {
  try {
    return await axios.get(`http://taxpollbd.com/hssalesapi/api/Sale/GetByInvoice?invoiceNo=${requestBody.invoiceNo}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const postSalesMasterDetailsService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}vatpos-integration/sales/add`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAllWfNotificationsService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}get-all-wf-notifications`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getWfNotificationsService = async (bodyInfo) => {
  try {
    console.log(bodyInfo);
    return await axios.post(`${usersUrl}get-wf-notifications`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const uploadImageService = async (user, bodyInfo) => {
  try {
    console.log(bodyInfo);
    console.log(user);
    return await axios.post(`${usersUrl}upload-image`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getImageService = async (user) => {
  try {
    return await axios.get(`${usersUrl}promotion-list`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addbankfromheaderService = async (bodyInfo, loginToken) => {
  try {
    return await axios.post(`${usersUrl}mrlprodbanks/add`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const addaccountsfromService = async (bodyInfo, loginToken) => {
  try {
    return await axios.post(`${usersUrl}mrlprodbankaccounts/add`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addmtlcategoriesfromService = async (bodyInfo, loginToken) => {
  try {
    return await axios.post(`${usersUrl}addmtlcategories/add`, bodyInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const addbankFormLinesService = async (bodyInfo) => {
  try {
    return await axios.post(`${usersUrl}mrlprodbankbranches/add`, bodyInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getBankAllService = async () => {
  try {
    return await axios.get(`${usersUrl}mrlprodbanks/get`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getMTLCategoriesService = async () => {
  try {
    return await axios.get(`${usersUrl}addmtlcategories/get`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getAccountService = async () => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankaccounts/get`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getBankBranchAllService = async () => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankbranches/get`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankHeaderService = async (bank_id) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbanks/get/${bank_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getAccountsService = async (bank_account_id) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankaccounts/get/${bank_account_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getBankLinesService = async (bank_id) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankbranches/get/list/${bank_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getBankBranchService = async (bank_branch_id) => {
  try {
    return await axios.get(`${usersUrl}mrlprodbankbranches/get/${bank_branch_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateBankOrderLineService = async (lineId, lineInfo) => {
  try {
    return await axios.put(`${usersUrl}mrlprodbankbranches/update/${lineId}`, lineInfo);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteBankFormLinesService = async (lineId) => {
  try {
    return await axios.delete(`${usersUrl}mrlprodbankbranches/delete/${lineId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const deleteAccountsService = async (bank_account_id) => {
  try {
    return await axios.delete(`${usersUrl}mrlprodbankaccounts/delete/${bank_account_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deleteBankBranchService = async (bank_branch_id) => {
  try {
    return await axios.delete(`${usersUrl}mrlprodbankbranches/delete/${bank_branch_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updatePerAllPeoplesDetails = async (requestBody, person_id) => {
  console.log(requestBody);

  try {
    return await axios.put(`${usersUrl}update-per-all-peoples/${person_id}`, requestBody);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const deletePerAllPeoplesDetails = async (personId) => {
  try {
    return await axios.delete(`${usersUrl}delete-per-all-peoples/${personId}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateMtlCategory = async (category_id, mtlcategories) => {
  try {
    // eslint-disable-next-line camelcase
    return await axios.put(`${usersUrl}addmtlcategories/update/${category_id}`, mtlcategories);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const deleteMtlCategory = async (category_id) => {
  try {
    // eslint-disable-next-line camelcase
    return await axios.delete(`${usersUrl}addmtlcategories/delete/${category_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getPerMtlCategoriesDetails = async (category_id) => {
  try {
    return await axios.get(`${usersUrl}addmtlcategories/get/${category_id}`);
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getSelectIdsMenus = async (user, user_id) => {
  try {
    return await axios.get(`${usersUrl}get-menus/peruser/${user_id}`, {
      headers: {
        Authorization: `Bearer ${user}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
export const getDrillView = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}drill-down/view`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getStandardBarDataView = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}standard-bar-data/view`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// user action assignment
export const getUserActionsService = async (loginToken, userId) => {
  try {
    return await axios.get(`${usersUrl}user-actions/actionList/${userId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getReservedActionsService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}user-actions/actionList/`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const updateUserActionDatesService = async (loginToken, requestInfo) => {
  try {
    return await axios.put(`${usersUrl}user-actions/updateDates`, requestInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const assignUserActionDatesService = async (loginToken, requestInfo) => {
  try {
    return await axios.post(`${usersUrl}user-actions/assign`, requestInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const checkUserActionAssignment = async (loginToken, requestInfo) => {
  try {
    return await axios.post(`${usersUrl}user-actions/checkAssignment`, requestInfo, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

// branding assets tracking services
export const getBrandingAssetsService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-branding-assets-detail/`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getDivisionsService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-bd-area-lists/division`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getThanasService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-bd-area-lists/thana`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getDistrictsService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-bd-area-lists/district`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getDistrictsByDivisionService = async (loginToken, divisionId) => {
  try {
    return await axios.get(`${usersUrl}get-bd-area-lists/get-per-division/district/${divisionId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getThanasByDistrictService = async (loginToken, districtId) => {
  try {
    return await axios.get(`${usersUrl}get-bd-area-lists/get-per-district/thana/${districtId}`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};

export const getItemCategoriesService = async (loginToken) => {
  try {
    return await axios.get(`${usersUrl}get-mtl-categories-b`, {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    });
  } catch (err) {
    console.log(err.message);

    return err.message;
  }
};
