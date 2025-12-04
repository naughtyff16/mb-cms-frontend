// Local Imports
import { Page } from "@/components/shared/Page";
import { useCallback, useEffect, useRef, useState } from "react";
import { assetByPageNumber, createDraftAssetByData, deleteAssetById, getAssetsByFilterIds, getMetaTemplateData, getMetaUiData, publishBulkAssets, unpublishBulkAssets } from "@/helpers/mb-api_helper";
import { useParams, useSearchParams } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import AssetTable from "./table";
import { Popup } from "reactjs-popup";
import Alert from "@/components/alert";
import { ArrowDownUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Settings, X } from "lucide-react";
import MbLoader from "@/components/mbIcons/mbLoader";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { capitalize } from "@/utils/capitalize";

// ----------------------------------------------------------------------

interface AnyObject {
  [key: string]: any; // Allows any key-value pairs in the user object
}


export default function AssetListing() {
  const { type } = useParams<{ type: string }>();

  const assetType = type ?? "";
  const [searchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthContext();
  const acl: string[] = user?.acl || [];
  const [allAssets, setAllAssets] = useState<any>([]);
  const [objectOfIdsNames, setObjectOfIdsNames] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("id") || "");
  const [sort, setSort] = useState("v_tt:desc");
  const [totalAssets, setTotalAssets] = useState(0);
  const [pagination, setPagination] = useState<AnyObject>({
    size: 20,
    count: 1,
    from: 1,
    to: 20,
  });
  const [error, setError] = useState("");
  const [assetUI, setAssetUI] = useState<AnyObject>({});
  const [assetTemplate, setAssetTemplate] = useState<AnyObject>({});
  const [initialHeaders, setInitialHeaders] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<any>([]);
  const [searchTermDebounced, setSearchTermDebounced] = useState("");
  const [openAddPopup, setOpenAddPopup] = useState(false);
  const [access, setAccess] = useState<any>({});
  const [selectedId, setSelectedId] = useState("");
  const [openDeleteViewPopup, setOpenDeleteViewPopup] = useState(false);
  const [publishAndUnpublish, setPublishAndUnpublish] = useState("");
  const [createError, setCreateError] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [success, setSuccess] = useState("");
  const [popupError, setPopupError] = useState("");


  const checkValidations = (data: any) => {
    // Find missing fields

    const missingFields = assetTemplate.required?.filter((field: any) => {
      const value = data[field];

      if (Array.isArray(value)) {
        // Return true if the array is empty
        return value.length === 0;
      } else if (typeof value === "string") {
        // Return true if the string is empty or whitespace
        return value.trim() === "";
      } else if (value !== null && typeof value === "object") {
        // Return true if the object has no keys
        return Object.keys(value).length === 0;
      }

      // Return true for null, undefined, or invalid types
      return value == null;
    });

    if (missingFields?.length > 0) {
      // Set error message if any field is missing
      setError(
        `In "${data?.title}" the following field is empty: ${missingFields.join(
          ", "
        )}. Please fill it in and then submit your data.`
      );
      return false;
    }

    // Clear error and proceed
    setError(""); // Clear any previous error
    return true;
  };


  const handleDeleteView = async () => {
    try {
      await deleteAssetById(selectedId, type);
      const updatedData = allAssets?.filter(
        (asset: any) => asset?.id !== selectedId
      );
      setAllAssets(updatedData);
      handleCloseDeletePopup();
    } catch (e: any) {
      console.error("error ===== 0000", e);
      setPopupError("Unauthorized: you don't have permission to delete");
    }
  };

  const handlePublishAllAssets = async () => {
    try {
      const filterString = selectedAssets
        ?.map((asset: any) => `${asset.id}`)
        .join(",");
      if (publishAndUnpublish === "Publish") {
        await publishBulkAssets(filterString);
      } else {
        await unpublishBulkAssets(filterString);
      }

      // setAllAssets(updatedData);
      setTimeout(() => {
        getAssets(); //get the updated assets data
      }, 1000);
      setPublishAndUnpublish("");
      setPublishAndUnpublish("");
      setSelectedAssets([]);
    } catch (e: any) {
      console.error("error ===== 0000", e);
      setPopupError(
        `Unauthorized: you don't have permission to ${publishAndUnpublish === "Publish" ? "publish." : "unpublish."
        }`
      );
    }
  };

  const handleCloseDeletePopup = () => {
    setSelectedId("");
    setOpenDeleteViewPopup(false);
    setPopupError("");
  };

  const handleCloseChangeStatusPopups = () => {
    setPublishAndUnpublish("");
    setSelectedId("");
    setPopupError("");
  };

  const getAssets = async () => {
    setLoading(true);
    try {
      let assetsRes: any = await assetByPageNumber(
        type,
        currentPage,
        searchTerm,
        sort
      );
      setTotalAssets(assetsRes.total);
      let pages = Math.ceil(assetsRes.total / pagination.size);
      let f = (currentPage - 1) * 20 + 1;
      let t = currentPage * 20;
      if (assetsRes.total < t) t = assetsRes.total;
      setPagination({ ...pagination, count: pages, from: f, to: t });
      setAllAssets(assetsRes.list);
      setLoading(false);
      setError("");
    } catch (e) {
      setError(
        `There was an error getting the listing of ${type}. Please try again.`
      );
      // setPagination({ size: 20, count: 1, from: 1, to: 20 });
      // setSort("")
      // setCurrentPage(1)
      setLoading(false);
    }
  };

  //Handle Header Changes
  const manageHeaders = (e: any) => {
    if (e.target.checked) {
      setInitialHeaders([...initialHeaders, e.target.name]);
      const headers = [...initialHeaders, e.target.name];
      localStorage.setItem(`${type}Headers`, JSON.stringify(headers));
    } else {
      setInitialHeaders(initialHeaders.filter((h) => h !== e.target.name));
      const headers = initialHeaders.filter((h) => h !== e.target.name);
      localStorage.setItem(`${type}Headers`, JSON.stringify(headers));
    }
  };

  const createAsset = useCallback(async () => {
    if (createTitle !== "") {
      setLoading(true);
      try {
        const createResult: any = await createDraftAssetByData(type, {
          title: createTitle,
          v_status: "draft",
        });
        setAllAssets([{ ...createResult }, ...allAssets]);
        setOpenAddPopup(false);
        setCreateTitle("");
        setSuccess(`Asset -${createResult.title} Created Successfully`);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setError("Unable to create asset. Please try again!");
      }
    } else {
      setCreateError("Please enter title");
    }
  }, [allAssets, createTitle, type]);


  useEffect(() => {
    /**
     * Fetches asset details for the given unique IDs and maps their titles to the corresponding IDs.
     * @param allUniqueIds - Array of unique asset IDs (show IDs or season IDs)
     */
    const getAssetsByIds = async (allUniqueIds: string[]) => {
      // Join all unique IDs into a comma-separated string for the filter
      const filterString = allUniqueIds.join(",");

      // Call the API to fetch asset details based on the provided IDs
      const assetsData: any = await getAssetsByFilterIds(
        `_id:ANY:${filterString}`
      );

      // Extract the list of assets from the API response
      const assetsList: any[] = assetsData.list ?? [];

      // Create an object mapping IDs to their titles (names)
      const result = allUniqueIds.reduce((acc: any, id) => {
        // Find the matching object for the current ID from the assets list
        const matchingObj = assetsList.find((data) => data.id === id);
        if (matchingObj) {
          acc[id] = matchingObj.title; // Use the ID as the key and the title as the value
        }
        return acc;
      }, {});

      // Update the state with the ID-to-title mapping object
      setObjectOfIdsNames(result);
    };

    // Execute the logic only if there are assets available
    if (allAssets?.length > 0) {
      let allUniqueIds: any[] = [];

      // Handle "seasons" and "episodes" types to fetch their related IDs
      if (type === "seasons" || type === "episodes") {
        // Extract all unique show IDs from the assets
        const allShowId = allAssets?.map((asset: any) => asset.showId);
        const uniqueAllShowId = [...new Set(allShowId)].filter(
          (id) => id !== undefined && id !== "" // Filter out undefined or empty IDs
        );

        // Add the unique show IDs to the list of unique IDs to fetch
        allUniqueIds = [...uniqueAllShowId];

        // If the type is "episodes", include season IDs as well
        if (type === "episodes") {
          // Extract all unique season IDs from the assets
          const allSeasonId = allAssets?.map((asset: any) => asset.seasonId);
          const uniqueAllSeasonId = [...new Set(allSeasonId)].filter(
            (id) => id !== undefined && id !== "" // Filter out undefined or empty IDs
          );

          // Combine both unique show IDs and season IDs
          allUniqueIds = [...uniqueAllShowId, ...uniqueAllSeasonId];
        }

        // Call the function to fetch asset details for the collected unique IDs
        getAssetsByIds(allUniqueIds);
      }
    }
  }, [allAssets]);


  //Load Template & Meta of UI
  useEffect(() => {
    const getData = async () => {
      let metaUIRes: any = await getMetaUiData(type);
      let metaTemplateRes: any = await getMetaTemplateData(type);
      const localHeaders: any = localStorage.getItem(`${type}Headers`);
      const headers: any = JSON.parse(localHeaders);
      setAssetUI(metaUIRes);

      setAssetTemplate(metaTemplateRes);
      if (headers?.length > 0 && headers) {
        setInitialHeaders([...new Set([...metaUIRes.headers, ...headers])]);
      } else {
        setInitialHeaders(metaUIRes.headers);
      }
    };
    setSearchTerm(searchParams.get("id") || "");
    setSelectedAssets([]);
    getData();
    setCurrentPage(1);
  }, [type]);


  useEffect(() => {
    if (assetUI?.id && assetTemplate.id) {
      getAssets();
    }
  }, [sort, currentPage, assetUI, assetTemplate, searchTerm]);

  ////Search Term Debounce
  useEffect(() => {
    let timeout = setTimeout(() => {
      setSearchTermDebounced(searchTerm);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (error !== "")
      setTimeout(() => {
        setError("");
      }, 4000);
  }, [error]);

  useEffect(() => {
    setTimeout(() => {
      if (openAddPopup && inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, [openAddPopup]);

  useEffect(() => {
    setAccess(() => ({
      edit:
        acl.includes("ALL") ||
        acl.includes("DRAFT_ASSET.CREATE") ||
        acl.includes("DRAFT_ASSET.UPDATE"),
      delete: acl.includes("ALL") || acl.includes("ASSET.DELETE"),
      publish: acl.includes("ALL") || acl.includes("ASSET.PUBLISH"),
    }));
  }, [acl]);


  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Asset Management", path: "/assets" },
    { title: `Manage ${capitalize(type ?? "")}` },
  ];


  return (
    <Page title={type ? `Manage ${capitalize(type)}` : "Assets"}>
      <div className="p-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-lg font-semibold text-black capitalize">{type ? `Manage ${capitalize(type)}` : "Assets"}</div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
        </div>

        <div className="card">
          <div className="card-body">
            <div className="search-filters card p-4 flex items-center justify-between gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                name="search"
                placeholder="Search or Filter anything..."
                className="h-8 w-1/2 px-4 border border-gray-300 rounded-md grow-0"
              />
              <div className="flex flex-row gap-4 justify-end items-center">
                {access?.publish &&
                  selectedAssets.length > 0 &&
                  selectedAssets && (
                    <>
                      {selectedAssets.find(
                        (obj: any) => obj.status === "PUBLISHED"
                      ) && (
                          <button
                            onClick={() => setPublishAndUnpublish("Unpublish")}
                            className="bg-mb-blue rounded-md text-white hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
                          >
                            Unpublish
                          </button>
                        )}
                      {selectedAssets.find(
                        (obj: any) =>
                          obj.status === "draft" || obj.status === "UNPUBLISHED"
                      ) && (
                          <button
                            onClick={() => {
                              for (const element of selectedAssets) {
                                if (!checkValidations(element.data)) {
                                  return; // Stop the loop and exit the function
                                }
                              }
                              setPublishAndUnpublish("Publish");
                            }}
                            className="bg-mb-blue rounded-md text-white hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
                          >
                            Publish
                          </button>
                        )}
                    </>
                  )}

                {Object.keys(assetUI).length > 0 &&
                  Object.keys(assetTemplate).length > 0 && (
                    <>
                      <Popup
                        arrow
                        on={"click"}
                        position={"bottom right"}
                        trigger={
                          <p title={`Sort`}>
                            {" "}
                            {/* need to add title instated of tooltip so we use <p> here */}
                            <ArrowDownUp
                              size={15}
                              className="text-mb-blue cursor-pointer"
                            ></ArrowDownUp>
                          </p>
                        }
                      >
                        <div className="w-[200px] flex flex-col gap-0 border border-gray-300 bg-white mt-2 rounded-md overflow-hidden">
                          <div className="bg-mb-blue text-white py-1 px-2 font-bold">
                            Choose Sort Order
                          </div>
                          {assetUI?.sortable?.map(
                            (sortField: any, i: number) => {
                              return (
                                <div key={i}>
                                  <div className="flex items-center gap-4  px-4 py-1">
                                    <input
                                      onChange={(e) =>
                                        e.target.checked
                                          ? setSort(`${sortField}:asc`)
                                          : setSort("")
                                      }
                                      checked={sort === `${sortField}:asc`}
                                      type="checkbox"
                                      id={`sortable-asc-${sortField}`}
                                    />
                                    <label
                                      htmlFor={`sortable-asc-${sortField}`}
                                    >
                                      {assetTemplate.properties[sortField].name}{" "}
                                      ASC
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-4  px-4 py-1">
                                    <input
                                      onChange={(e) =>
                                        e.target.checked
                                          ? setSort(`${sortField}:desc`)
                                          : setSort("")
                                      }
                                      checked={sort === `${sortField}:desc`}
                                      type="checkbox"
                                      id={`sortable-desc-${sortField}`}
                                    />
                                    <label
                                      htmlFor={`sortable-desc-${sortField}`}
                                    >
                                      {assetTemplate.properties[sortField].name}{" "}
                                      Desc
                                    </label>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </Popup>
                      <Popup
                        trigger={
                          <p title={`Set columns`}>
                            {" "}
                            {/* need to add title instated of tooltip so we use <p> here */}
                            <Settings
                              size={15}
                              className="text-mb-blue cursor-pointer"
                            />
                          </p>
                        }
                        arrow
                        on={"click"}
                        position={"bottom right"}
                      >
                        <div className="w-[200px] flex flex-col gap-0 border border-gray-300 bg-white mt-2 rounded-md overflow-hidden">
                          <div className="bg-mb-blue text-white py-1 px-2 font-bold">
                            Choose Columns
                          </div>
                          {assetUI?.headers?.map(
                            (header: string, i: number) => {
                              return (
                                <div
                                  key={`${i}-head`}
                                  className="flex gap-2 items-center px-4 py-1"
                                >
                                  <input
                                    id={header}
                                    type="checkbox"
                                    name={header}
                                    checked={
                                      initialHeaders.indexOf(header) > -1
                                    }
                                    disabled
                                  />
                                  <label
                                    className="cursor-pointer"
                                    htmlFor={header}
                                  >
                                    {assetTemplate.properties[header].name}
                                  </label>
                                </div>
                              );
                            }
                          )}
                          {assetUI?.optionalHeader?.map(
                            (header: string, i: number) => {
                              return (
                                <div
                                  key={`${i}-opt-head`}
                                  className="flex gap-2 items-center px-4 py-1"
                                >
                                  <input
                                    id={header}
                                    onChange={manageHeaders}
                                    checked={
                                      initialHeaders.indexOf(header) > -1
                                    }
                                    name={header}
                                    type="checkbox"
                                  />
                                  <label
                                    className="cursor-pointer"
                                    htmlFor={header}
                                  >
                                    {assetTemplate.properties[header].name}
                                  </label>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </Popup>
                      {access?.edit && (
                        <button
                          onClick={() => setOpenAddPopup(true)}
                          className="bg-mb-blue rounded-md text-white hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
                        >
                          Add New <Plus size={10} />{" "}
                        </button>
                      )}
                      <Popup
                        modal
                        open={openAddPopup}
                        onClose={() => setOpenAddPopup(false)}
                        overlayStyle={{
                          background: "rgba(0,0,0,0.7)",
                          zIndex: 9999999999999,
                        }}
                        lockScroll
                        closeOnDocumentClick
                      >
                        <div className="bg-white flex flex-col rounded-md md:w-[30rem]">
                          <div className="flex py-2 px-4 border-b border-b-mb-blue/50 justify-between items-center">
                            <h6>Add New</h6>
                            <button onClick={() => setOpenAddPopup(false)}>
                              <X size={15} />
                            </button>
                          </div>
                          <div className="flex flex-col gap-2 px-4 py-8">
                            {createError && (
                              <p className="text-xs text-red-500">
                                {createError}
                              </p>
                            )}
                            <label htmlFor="addTitle">Title</label>
                            <input
                              ref={inputRef}
                              value={createTitle}
                              onChange={(e) => setCreateTitle(e.target.value)}
                              type="text"
                              className="px-1 py-2 h-10 border border-mb-blue rounded-md"
                            />
                          </div>
                          <div className="flex py-2 px-4 border-t border-t-mb-blue/50 justify-end gap-4 items-center">
                            <button
                              className="bg-red-500 text-white rounded-md hover:bg-red-500/30 hover:text-red-500 px-4 py-2 flex items-center gap-1"
                              onClick={() => setOpenAddPopup(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="bg-mb-blue text-white rounded-md hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
                              onClick={createAsset}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </>
                  )}
              </div>
            </div>
            <div className="errors success">
              {success && (
                <Alert className="relative px-4 py-3 text-sm text-green-500 border border-transparent rounded-md bg-green-50 dark:bg-green-400/20">
                  <Alert.Close className="absolute top-0 bottom-0 right-0 p-3 transition text-custom-200 hover:text-green-500 dark:text-custom-400/50 dark:hover:text-custom-500" />
                  <Alert.Bold>Success! </Alert.Bold>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert className="relative px-4 py-3 text-sm text-orange-500 border border-transparent rounded-md bg-orange-50 dark:bg-orange-400/20">
                  <Alert.Bold>Error! </Alert.Bold>
                  {error}
                </Alert>
              )}
            </div>
            {!loading && (
              <AssetTable
                allAssets={allAssets}
                initialHeaders={initialHeaders}
                objectOfIdsNames={objectOfIdsNames}
                access={access}
                selectedAssets={selectedAssets}
                setSelectedAssets={setSelectedAssets}
                assetTemplate={assetTemplate}
                assetUI={assetUI}
                type={assetType}
                searchParams={searchParams}
                setSelectedId={setSelectedId}
                setOpenDeleteViewPopup={setOpenDeleteViewPopup}
              />

            )}
            {pagination.count > 0 && (
              <div className="pagination-wrap">
                <div className="flex flex-col gap-2">
                  <p className="">
                    Showing From {pagination.from} to {pagination.to} of{" "}
                    {totalAssets}
                  </p>
                  <div className="flex gap-2">
                    <p className="">Go to Page</p>
                    <select
                      className=""
                      onChange={(e: any) => setCurrentPage(e.target.value)}
                    >
                      {[...Array(pagination.count).keys()]?.map((int) => (
                        <option
                          key={`page-${int}`}
                          selected={currentPage === int + 1}
                          value={int + 1}
                        >
                          {int + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ul className="listjs-pagination">
                  {currentPage > 1 && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="page"
                      >
                        <ChevronsLeft className="size-4 rtl:rotate-180" />
                      </button>
                    </li>
                  )}
                  {currentPage > 1 && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="page"
                      >
                        <ChevronLeft className="size-4 rtl:rotate-180" />
                      </button>
                    </li>
                  )}
                  {[...Array(pagination.count).keys()]?.map((int) => {
                    return (
                      int + 1 >= currentPage - 1 &&
                      int + 1 <= currentPage + 1 && (
                        <li className={currentPage === int + 1 ? "active" : ""}>
                          <button
                            onClick={() => setCurrentPage(int + 1)}
                            className={`${currentPage === int + 1 ? "active" : ""
                              } page`}
                          >
                            {int + 1}
                          </button>
                        </li>
                      )
                    );
                  })}

                  {currentPage < pagination.count && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="page"
                      >
                        <ChevronRight className="size-4 rtl:rotate-180" />
                      </button>
                    </li>
                  )}
                  {currentPage < pagination.count && (
                    <li>
                      <button
                        onClick={() => setCurrentPage(pagination.count)}
                        className="page"
                      >
                        <ChevronsRight className="size-4 rtl:rotate-180" />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* delete Po up */}
        <Popup
          open={openDeleteViewPopup}
          onClose={handleCloseDeletePopup}
          modal
          lockScroll
          closeOnDocumentClick
          overlayStyle={{ background: "rgba(0,0,0,0.6)", zIndex: 999999 }}
        >
          <div className="bg-white flex flex-col rounded-md md:w-[30rem]">
            <button
              onClick={handleCloseDeletePopup}
              className="absolute right-4 top-4"
            >
              <X size={30} />
            </button>
            <div className="text-xl text-mb-blue border-b border-b-mb-blue font-bold p-4">
              Delete Selected Item
            </div>
            <div className="text-sm text-gray-900 p-4">
              Are you sure you want to delete the selected item. This action
              cannot be undone.
            </div>
            <div className="flex justify-end gap-4 p-4">
              <button
                className="bg-red-500 text-white rounded-md hover:bg-red-500/30 hover:text-red-500 px-4 py-2 flex items-center gap-1 "
                onClick={handleDeleteView}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-gray-900 rounded-md hover:bg-gray-300/30 hover:text-gray-900 px-4 py-2 flex items-center gap-1"
                onClick={handleCloseDeletePopup}
              >
                Cancel
              </button>
            </div>
            <div className="flex justify-end p-4">
              {popupError && <p className="text-red-500"> {popupError}</p>}
            </div>
          </div>
        </Popup>

        {/* publish and un-publish  Po up */}
        <Popup
          open={publishAndUnpublish !== ""}
          onClose={handleCloseChangeStatusPopups}
          modal
          lockScroll
          closeOnDocumentClick
          overlayStyle={{ background: "rgba(0,0,0,0.6)", zIndex: 999999 }}
        >
          <div className="bg-white flex flex-col rounded-md md:w-[30rem]">
            <button
              onClick={handleCloseChangeStatusPopups}
              className="absolute right-4 top-4"
            >
              <X size={30} />
            </button>
            <div className="text-xl text-mb-blue border-b border-b-mb-blue font-bold p-4">
              {publishAndUnpublish} the assets
            </div>
            <div className="text-sm text-gray-900 p-4">
              Are you sure you want to {publishAndUnpublish} the selected items.
            </div>
            <div className="flex justify-end gap-4 p-4">
              <button
                className="bg-red-500 text-white rounded-md hover:bg-red-500/30 hover:text-red-500 px-4 py-2 flex items-center gap-1 "
                onClick={handlePublishAllAssets}
              >
                {publishAndUnpublish}
              </button>
              <button
                className="bg-gray-300 text-gray-900 rounded-md hover:bg-gray-300/30 hover:text-gray-900 px-4 py-2 flex items-center gap-1"
                onClick={handleCloseChangeStatusPopups}
              >
                Cancel
              </button>
            </div>
            <div className="flex justify-end p-4">
              {popupError && <p className="text-red-500"> {popupError}</p>}
            </div>
          </div>
        </Popup>

        {loading && <MbLoader />}
      </div>
    </Page>
  );
}
