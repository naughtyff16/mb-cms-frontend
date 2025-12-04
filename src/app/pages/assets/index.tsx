// Local Imports
import { Page } from "@/components/shared/Page";
import { useCallback, useEffect, useRef, useState } from "react";
import { assetByPageNumber, createDraftAssetByData, deleteAssetById, getAssetsByFilterIds, getMetaTemplateData, getMetaUiData, publishBulkAssets, unpublishBulkAssets } from "@/helpers/mb-api_helper";
import { useParams, useSearchParams } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import AssetTable from "./table";
import Alert from "@/components/alert";
import { ArrowDownUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Settings } from "lucide-react";
import MbLoader from "@/components/mbIcons/mbLoader";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { capitalize } from "@/utils/capitalize";
import PopUp from "@/components/ui/PopUp/PopUp";
import TriggerPopUp from "@/components/ui/PopUp/TriggerPopUp";
import AssetSearchFilters from "./searchFilter/SearchFilter";
import { AssetPagination } from "./components/Pagination";

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
    { title: "Asset Management", path: "#" },
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
            <AssetSearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={setCurrentPage}
              access={access}
              selectedAssets={selectedAssets}
              setPublishAndUnpublish={setPublishAndUnpublish}
              checkValidations={checkValidations}
              assetUI={assetUI}
              assetTemplate={assetTemplate}
              initialHeaders={initialHeaders}
              manageHeaders={manageHeaders}
              setOpenAddPopup={setOpenAddPopup}
            />
            <div className="">
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
              <AssetPagination
                pagination={pagination}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalAssets={totalAssets} />
            )}
          </div>
        </div>


        {/* PopUps */}

        <PopUp
          open={openAddPopup}
          onClose={() => setOpenAddPopup(false)}
        >
          <div className="bg-white flex flex-col rounded-md md:w-[480px]">
            <div className="flex py-2 px-4 border-b border-b-mb-blue/50 justify-between items-center">
              <h6>Add New</h6>
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
        </PopUp>

        <PopUp
          open={publishAndUnpublish !== ""}
          onClose={handleCloseChangeStatusPopups}
        >
          <div className="bg-white flex flex-col rounded-md md:w-[480px]">
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
        </PopUp>

        <PopUp
          open={openDeleteViewPopup}
          onClose={handleCloseDeletePopup}
        >
          <div className="bg-white flex flex-col rounded-md md:w-[480px]">
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
        </PopUp>

        {loading && <MbLoader />}
      </div>
    </Page>
  );
}
