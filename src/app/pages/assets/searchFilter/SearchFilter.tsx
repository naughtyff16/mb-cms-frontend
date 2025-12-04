import TriggerPopUp from "@/components/ui/PopUp/TriggerPopUp";
import { Plus, ArrowDownUp, Settings } from "lucide-react";

export default function AssetSearchFilters({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  access,
  selectedAssets,
  setPublishAndUnpublish,
  checkValidations,
  assetUI,
  assetTemplate,
  initialHeaders,
  manageHeaders,
  setOpenAddPopup,
}: any) {
  return (
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
        {access?.publish && selectedAssets?.length > 0 && (
          <>
            {selectedAssets.find((obj: any) => obj.status === "PUBLISHED") && (
              <button
                onClick={() => setPublishAndUnpublish("Unpublish")}
                className="bg-mb-blue rounded-md text-white hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
              >
                Unpublish
              </button>
            )}

            {selectedAssets.find(
              (obj: any) => obj.status === "draft" || obj.status === "UNPUBLISHED"
            ) && (
              <button
                onClick={() => {
                  for (const element of selectedAssets) {
                    if (!checkValidations(element.data)) return;
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

        {/* SORT POPUP */}
        {assetUI?.sortable && (
          <TriggerPopUp
            trigger={
              <p title="Sort">
                <ArrowDownUp size={15} className="text-mb-blue cursor-pointer" />
              </p>
            }
            position="bottom-left"
          >
            <div className="w-[200px] flex flex-col gap-0 border border-gray-300 bg-white mt-2 rounded-md overflow-hidden">
              <div className="bg-mb-blue text-white py-1 px-2 font-bold">Choose Sort Order</div>

              {assetUI.sortable.map((sortField: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-4 px-4 py-1">
                    <input type="checkbox" />
                    <label>{assetTemplate.properties[sortField].name} ASC</label>
                  </div>
                  <div className="flex items-center gap-4 px-4 py-1">
                    <input type="checkbox" />
                    <label>{assetTemplate.properties[sortField].name} DESC</label>
                  </div>
                </div>
              ))}
            </div>
          </TriggerPopUp>
        )}

        {/* COLUMN POPUP */}
        {assetUI?.headers && (
          <TriggerPopUp
            trigger={
              <p title="Set columns">
                <Settings size={15} className="text-mb-blue cursor-pointer" />
              </p>
            }
            position="bottom-left"
          >
            <div className="w-[200px] flex flex-col gap-0 border border-gray-300 bg-white mt-2 rounded-md overflow-hidden">
              <div className="bg-mb-blue text-white py-1 px-2 font-bold">Choose Columns</div>

              {assetUI.headers.map((header: string, i: number) => (
                <div key={i} className="flex gap-2 items-center px-4 py-1">
                  <input disabled checked={initialHeaders.includes(header)} type="checkbox" />
                  <label>{assetTemplate.properties[header].name}</label>
                </div>
              ))}

              {assetUI.optionalHeader?.map((header: string, i: number) => (
                <div key={i} className="flex gap-2 items-center px-4 py-1">
                  <input onChange={manageHeaders} checked={initialHeaders.includes(header)} name={header} type="checkbox" />
                  <label>{assetTemplate.properties[header].name}</label>
                </div>
              ))}
            </div>
          </TriggerPopUp>
        )}

        {access?.edit && (
          <button
            onClick={() => setOpenAddPopup(true)}
            className="bg-mb-blue rounded-md text-white hover:bg-mb-blue/30 hover:text-mb-blue px-4 py-2 flex items-center gap-1"
          >
            Add New <Plus size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
