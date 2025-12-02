import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();
// Gets the logged in user data from local session

// Gets the logged in user data from local session
export const getLoggedUser = () => {
  const user = localStorage.getItem("authUser");
  if (user) return JSON.parse(user);
  return null;
};

// is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedUser() !== null;
};

// Login Method
export const mbLogin = async (data: any) => {
  let response: any;
  response = await api.create(url.LOGIN, data);
  localStorage.setItem("authToken", response.token);
  // localStorage.setItem("mobioticToken", response.mobioticToken);
  return response;
};

// Get user information
export const getUser = () => api.get(url.GET_USER_DATA);
export const getMetaConfig = () => api.get(url.GET_META_CONFIG);

//Get asset information
export const getAssetInfo = (assetType: string | undefined) =>
  api.get(url.GET_ASSET_INFO + assetType);

//get all assets by search
export const searchInAllAssets = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.SEARCH_ASSETS}?${filtersString}`);
};

//Get asset information
export const searchAssetByType = (
  assetType: string | undefined,
  searchKey: string | undefined
) =>
  api.get(
    searchKey === ""
      ? `${url.GET_ASSET_INFO}${assetType}?filters=`
      : `${url.GET_ASSET_INFO}${assetType}?filters=title:${searchKey} `
  );

// delete asset by id
export const deleteAssetById = (
  id: string | undefined,
  assetType: string | undefined
) => {
  return api.delete(`${url.GET_ASSET_INFO}${assetType}/${id}`, { id });
};

// Get asset info by page number
export const assetByPageNumber = (
  assetType: string | undefined,
  pageNo: number,
  text = "",
  sort = ""
) => {
  const pageNumber = pageNo || 1;
  return api.get(
    `${url.GET_ASSET_INFO}${assetType}?page=${pageNumber}&text=${text}&sort=${sort}`
  );
};

export const getAssetsByFilterIds = (filterString: string) => {
  return api.get(`${url.SEARCH_ASSETS}?filters=${filterString}`);
};

//Get asset information
export const getDataByAPIPath = (
  apiRef: string | undefined,
  searchText: string | undefined
) => api.get(`${apiRef}&${searchText}`);

//Add title in content
export const addTitleInContent = (
  assetType: string | undefined,
  data: any | undefined
) => api.create(url.GET_ASSET_INFO + assetType, data);

//Get data for the edit content
export const getContent = (
  id: string | undefined,
  assetType: string | undefined
) => api.get(`${url.GET_ASSET_INFO}${assetType}/${id}`);

//Create draft asset by data
export const createDraftAssetByData = (
  assetType: string | undefined,
  data: any | undefined
) => api.create(url.GET_DRAFT_ASSET_INFO + assetType, data);

//Get draft data for the edit content
export const getDraftContentDataById = (id: string | undefined) =>
  api.get(`${url.GET_DRAFT_ASSET_INFO}${id}`);

//update draft asset information
export const updateDraftAssetByData = (id: string | undefined, data: any) =>
  api.put(`${url.GET_DRAFT_ASSET_INFO}${id}`, data);

// Transcode the profile by id
export const profileTranscodeById = (id: string | undefined) =>
  api.create(`${url.TRANSCODE_MEDIA}/${id}`);

export const publishAssetById = (id: string | undefined, data: any) =>
  api.create(`${url.PUBLISH_ASSET}${id}`, data);

// Update Asset Information
export const updateAssetInformation = (
  id: string,
  assetType: string | undefined,
  data: any
) => api.put(`${url.GET_ASSET_INFO}${assetType}/${id}`, data);

//update bulk asset information
// export const updateBulkAssetInformation = (filterString: string, data: any) =>
//   api.put(`${url.UPDATE_ASSET_INFO}?filters=${filterString}`, data);

//update bulk asset information
export const publishBulkAssets = (filterString: string) =>
  api.create(`${url.PUBLISH_ASSET}${filterString}`);

//update bulk asset information
export const unpublishBulkAssets = (filterString: string) =>
  api.create(`${url.UNPUBLISH_ASSET}${filterString}`);

//Get template data
// Search  assets
export const searchAssets = (filters?: any, search?: any) => {
  if (filters && search) {
    let filtersString: string = "";
    Object.keys(filters).map((f: any) => {
      if (filtersString) {
        filtersString += `;${f}:${filters[f]}`;
      } else {
        filtersString = `${f}:${filters[f]}`;
      }
    });
    return api.get(url.SEARCH_ASSETS, { filters: filtersString, text: search });
  } else if (search) {
    return api.get(url.SEARCH_ASSETS, { text: search });
  } else if (filters) {
    let filtersString: string = "";
    Object.keys(filters).map((f: any) => {
      if (filtersString) {
        filtersString += `;${f}:${filters[f]}`;
      } else {
        filtersString = `${f}:${filters[f]}`;
      }
    });
    return api.get(url.SEARCH_ASSETS, { filters: filtersString });
  } else {
    return api.get(url.SEARCH_ASSETS);
  }
};

//Get template data
export const getMetaData = (type: string) => api.get(url.GET_META + type);

export const getMetaUiData = (assetType: string | undefined) =>
  api.get(url.GET_META_UI + assetType);
export const getMetaTemplateData = (assetType: string | undefined) =>
  api.get(url.GET_META_TEMPLATE + assetType);

//get Dashboard data
export const getDashboardData = () => api.get(`${url.GET_DASHBOARD_DATA}`);

// Get all platforms
export const getPlatforms = (
  filters: { [key: string]: any } = {},
  sort: string = "v_tt:desc"
) => {
  if (filters) {
    let filtersString: string = "";
    Object.keys(filters).map((f: any) => {
      if (filtersString) {
        filtersString += `;${f}:${filters[f]}`;
      } else {
        filtersString = `${f}:${filters[f]}`;
      }
    });

    return api.get(url.PLATFORM, { filters: filtersString, sort: sort });
  } else {
    return api.get(url.PLATFORM);
  }
};
// create new platform
export const createPlatform = (data: any) => {
  return api.create(url.PLATFORM, data);
};
// get platform by Id
export const getPlatformById = (id: any) => {
  return api.get(`${url.PLATFORM}/${id}`);
};

//delete platform by id
export const deletePlatformById = (id: any) => {
  return api.delete(`${url.PLATFORM}/${id}`, { id });
};

export const getPlatformDraftById = (id: any) => {
  return api.get(`${url.PLATFORM_DRAFT}/${id}`);
};

export const createPlatformDraftRevisionByID = (id: any) => {
  return api.create(`${url.PLATFORM_DRAFT}/${id}`);
};

export const updatePlatformDraftByID = (id: any, data: any) => {
  return api.put(`${url.PLATFORM_DRAFT}/${id}`, data);
};

export const publishPlatformDraftByID = (id: any) => {
  return api.create(`${url.PLATFORM_PUBLISH}/${id}`);
};

export const updatePlatformByID = (id: any, data: any) => {
  return api.put(`${url.PLATFORM}/${id}`, data);
};

// get platform by page number
export const getPlatformByPageNumber = (pageNo: number) => {
  const pageNumber = pageNo || 1;
  return api.get(`${url.PLATFORM}?page=${pageNumber}`);
};

// get platform by page number

//get menu by id
export const getMenuById = (id: any) => {
  return api.get(`${url.MENU}/${id}`);
};

// create new menu item
export const createMenuItem = (data: any) => {
  return api.create(url.MENU, data);
};
// create new menu item
export const updateMenuItem = (data: any) => {
  return api.put(url.MENU, data);
};

//delete menu id
export const deleteMenuById = (id: any) => {
  return api.delete(`${url.MENU}/${id}`, { id });
};
export const getAllMenu = () => {
  return api.get(url.MENU);
};

//get menus by filter objects
export const getUpdatedMenusByFilter = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.MENU}?${filtersString}`);
};

// get menu by page number
export const getMenuByPageNumber = (pageNo: number) => {
  const pageNumber = pageNo || 1;
  return api.get(`${url.MENU}?page=${pageNumber}`);
};

// delete menu item

// publish menu
export const publishMenu = (id: any) => {
  return api.create(`${url.PUBLISH_MENU}/${id}`);
};

// get draft menu by id
export const getDraftMenuById = (id: any) => {
  return api.get(`${url.DRAFT_MENU}/${id}`);
};

// update draft menu
export const updateDraftMenu = (id: any, data: any) => {
  return api.put(`${url.DRAFT_MENU}/${id}`, data);
};

// create draft menu by id
export const createDraftMenu = (id: any) => {
  return api.create(`${url.DRAFT_MENU}/${id}`);
};

export const getMenuListTags = (searchKey: string) => {
  return api.get(`${url.MENU_LIST_TAGS}?q=${searchKey}`);
};

// get view by Id
export const getViewById = (id: any) => {
  return api.get(`${url.VIEW}/${id}`);
};

// Get view by filter object
export const getUpdatedViewByFilters = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.VIEW}?${filtersString}`);
};

// Get all views
export const getViews = (filters?: any) => {
  let modifiedUrl: any;
  if (filters) {
    let filtersString: string = "";
    Object.keys(filters).map((f: any) => {
      if (filtersString) {
        filtersString += `&${f}:${filters[f]}`;
      } else {
        filtersString = `${f}:${filters[f]}`;
      }
    });
    modifiedUrl = `${url.VIEW}?filters=${filtersString}`;
  } else {
    modifiedUrl = url.VIEW;
  }
  return api.get(modifiedUrl);
};

//delete view by id
export const deleteViewById = (id: any) => {
  return api.delete(`${url.VIEW}/${id}`, { id });
};

//Filter view by quay
export const filterViewByQuay = (quay: string) => {
  return api.get(`${url.VIEW}?${quay}`);
};
// create new view
export const createView = (data: any) => {
  return api.create(url.VIEW, data);
};
// publish view
export const publishView = (id: any) => {
  return api.create(`${url.PUBLISH_VIEW}/${id}`);
};

// get draft view by Id
export const getDraftViewById = (id: any) => {
  return api.get(`${url.DRAFT_VIEW}/${id}`);
};
// create create version of view
export const createDraftView = (id: any) => {
  return api.create(`${url.DRAFT_VIEW}/${id}`);
};
// update draft version of view
export const updateDraftView = (id: any, data: any) => {
  return api.put(`${url.DRAFT_VIEW}/${id}`, data);
};

//Get all rail tags
export const getRailsListTags = (searchKey: string) => {
  return api.get(`${url.RAILS_LIST_TAGS}?q=${searchKey}`);
};

// Get all rails
export const getRails = (filters?: any) => {
  let modifiedUrl: any;
  if (filters) {
    let filtersString: string = "";
    Object.keys(filters).map((f: any) => {
      if (filtersString) {
        filtersString += `;${f}:${filters[f]}`;
      } else {
        filtersString = `${f}:${filters[f]}`;
      }
    });
    modifiedUrl = `${url.RAIL}?filters=${filtersString}`;
  } else {
    modifiedUrl = url.RAIL;
  }
  return api.get(modifiedUrl);
};
// get rail Instance by Id
export const getRailInstanceById = (id: any) => {
  return api.get(`${url.RAIL_INSTANCE}/${id}`);
};
// create rail instance
export const createRailInstance = (data: any) => {
  return api.create(`${url.RAIL_INSTANCE}`, data);
};
// update  rail instance
export const updateRailInstance = (id: any, data: any) => {
  return api.put(`${url.RAIL_INSTANCE}/${id}`, data);
};

// Register Method
export const postJwtRegister = (url: any, data: any) => {
  return api.create(url, data).catch((err: any) => {
    var message;
    if (err.response && err.response.status) {
      switch (err.response.status) {
        case 404:
          message = "Sorry! the page you are looking for could not be found";
          break;
        case 500:
          message =
            "Sorry! something went wrong, please contact our support team";
          break;
        case 401:
          message = "Invalid credentials";
          break;
        default:
          message = err[1];
          break;
      }
    }
    throw message;
  });
};

//Get Presigned URL
export const getPreSignedUrl = (payload: any) => {
  return api.create(url.PRESIGNED_URL, payload);
};
//Upload file
export const uploadFile = (url: string, file: any) => {
  return api.upload(url, file);
};

//Mapping bulk data
export const mappingBulkData = (data: any) => {
  return api.create(url.BULK_UPLOAD_MAPPING, data);
};

//get mapping data
export const getMappingBulkData = () => {
  return api.get(url.BULK_UPLOAD_MAPPING);
};

//Get jobs data
export const getJobBulkUploadData = () => {
  return api.get(url.BULK_UPLOAD_JOB);
};

// Get jobs by page number
export const getJobBulkUploadByPageNumber = (pageNo: number) => {
  const pageNumber = pageNo || 1;
  return api.get(`${url.BULK_UPLOAD_JOB}?page=${pageNumber}`);
};

// get job by id

//Bulk import job
export const createBulkImportJob = (data: any) => {
  return api.create(url.BULK_IMPORT_JOB, data);
};

// get roles
export const getRoles = (id: string | number | undefined = 0) => {
  return api.get(`${url.ROLE}/${+id > 0 ? id : ""}`);
};

//get roles by filtered object
export const getRolesByFilters = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.ROLE}?${filtersString}`);
};

//Create role
export const createRole = (payload: any) => {
  return api.create(`${url.ROLE}`, payload);
};

// update roles
export const updateRoles = (
  payload: any,
  id: string | number | undefined = 0
) => {
  return api.put(`${url.ROLE}/${id}`, payload);
};

// get users
export const getUsers = (id: string | number | undefined = 0) => {
  return api.get(`${url.USER}/${+id > 0 ? id : ""}`);
};

//get users by filters object
export const getUsersByFilters = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.USER}?${filtersString}`);
};

//Create user
export const createUser = (payload: any) => {
  return api.create(`${url.USER}`, payload);
};

//update users
export const updateUsers = (
  payload: any,
  id: string | number | undefined = 0
) => {
  return api.put(`${url.USER}/${id}`, payload);
};

export const getAudit = () => api.get(`${url.AUDIT}`);

export const getAuditByFilters = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.AUDIT}?${filtersString}`);
};

export const getProfiles = (id: string | number | undefined = 0) =>
  api.get(`${url.PROFILE}/${id ? id : ""}`);
//get profile by filters object
export const getProfileByFilters = (filters: any) => {
  let filtersString: string = "";
  Object.keys(filters).forEach((f: any) => {
    if (filters[f])
      if (filtersString) {
        filtersString += `&${f}=${filters[f]}`;
      } else {
        filtersString = `${f}=${filters[f]}`;
      }
  });
  return api.get(`${url.PROFILE}?${filtersString}`);
};

//Create profile
export const createProfile = (payload: any) => {
  return api.create(`${url.PROFILE}`, payload);
};

//update profile
export const updateProfile = (
  payload: any,
  id: string | number | undefined = 0
) => {
  return api.put(`${url.PROFILE}/${id}`, payload);
};

// delete asset by id
export const deleteProfileById = (id: string | undefined) => {
  return api.delete(`${url.PROFILE}/${id}`, { id });
};

//get ftp details
export const getFtpDetails = (path: string) =>
  api.get(`${url.FTP}?path=${path}`);
