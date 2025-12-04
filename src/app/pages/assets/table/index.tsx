import MbTitle from "../../components/MbTitle/MbTitle";
import { Link } from "react-router";
import { formatDate } from "@/customFunctions/capitalFirstLetter";
import { Edit, Eye, Trash } from "lucide-react";

interface AssetTableProps {
  allAssets: any[];
  initialHeaders: string[];
  objectOfIdsNames: Record<string, string>;
  access: {
    edit: boolean;
    delete: boolean;
    publish: boolean;
  };
  selectedAssets: any[];
  setSelectedAssets: React.Dispatch<React.SetStateAction<any[]>>;
  assetTemplate: Record<string, any>;
  assetUI: Record<string, any>;
  type: string;
  searchParams: URLSearchParams;
  setSelectedId: React.Dispatch<React.SetStateAction<string>>;
  setOpenDeleteViewPopup: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function AssetTable(props: AssetTableProps) {
  const {
    allAssets,
    initialHeaders,
    objectOfIdsNames,
    access,
    selectedAssets,
    setSelectedAssets,
    assetTemplate,
    assetUI,
    type,
    searchParams,
    setSelectedId,
    setOpenDeleteViewPopup,
  } = props;




  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      <table className="w-full">
        <thead className="ltr:text-left rtl:text-right">
          <tr>
            {access?.publish && (
              <th className="px-3.5 py-2.5 font-semibold border-b border-slate-200 dark:border-zink-500">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const complete = allAssets.map((asset: any) => ({
                        id: asset.id,
                        status: asset.v_status,
                        type: asset.v_type,
                        name: asset.title,
                        data: asset,
                      }));
                      setSelectedAssets((preVal: any) => [
                        ...preVal,
                        ...complete,
                      ]);
                    } else {
                      setSelectedAssets([]);
                    }
                  }}
                />
              </th>
            )}

            {initialHeaders?.map((header: any) => (
              <th
                key={header}
                className="px-3.5 min-w-[200px] py-2.5 font-semibold border-b border-slate-200 dark:border-zink-500"
              >
                {assetTemplate.properties[header]?.name}
              </th>
            ))}

            <th className="px-3.5 sticky right-0 min-w-[100px] py-2.5 font-semibold border-b border-slate-200 dark:border-zink-500 text-right bg-white">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {allAssets?.map((asset: any) => (
            <tr key={asset.id} className="even:bg-slate-50 hover:bg-slate-50">
              {access?.publish && (
                <td className="px-3.5 py-2.5 border-y">
                  <input
                    type="checkbox"
                    checked={selectedAssets.some((x: any) => x.id === asset.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssets([
                          ...selectedAssets,
                          {
                            id: asset.id,
                            status: asset.v_status,
                            type: asset.v_type,
                            name: asset.title,
                            data: asset,
                          },
                        ]);
                      } else {
                        setSelectedAssets(
                          selectedAssets.filter((x: any) => x.id !== asset.id)
                        );
                      }
                    }}
                  />
                </td>
              )}

              {initialHeaders?.map((header: any, j: number) => {
                return (
                  <td
                    key={asset.id + j}
                    className="px-3.5 py-2.5 border-y border-slate-200 dark:border-zink-500"
                  >
                    {(j === 0 || header === "id") &&
                      header !== "title" ? (
                      !access?.edit ? (
                        <p> {asset[header]}</p>
                      ) : (
                        <Link
                          className="transition-all duration-150 ease-linear text-mb-blue hover:text-mb-blue/60"
                          to={
                            asset.v_status.toUpperCase() === "DRAFT"
                              ? `/assets/${type}/draft/${asset.id}`
                              : `/assets/${type}/published/${asset.id}`
                          }
                        >
                          {asset[header]}
                        </Link>
                      )
                    ) : header === "v_tt" ? (
                      formatDate(asset[header]).toString()
                    ) : header === "v_status" ? (
                      <span
                        className={`${asset[header] === "draft"
                            ? "bg-gray-200"
                            : "bg-mb-green"
                          } p-1`}
                      >
                        {asset[header].toUpperCase()}
                      </span>
                    ) : header === "title" ? (
                      <MbTitle
                        type={type ? type : ""}
                        title={asset[header]}
                        asset={asset}
                        editAccess={access?.edit}
                        image={
                          asset.images && asset?.images[0]?.path
                            ? asset?.images[0]?.path.includes(
                              "https"
                            )
                              ? `${asset?.images[0]?.path}`
                              : `${import.meta.env.VITE_IMAGE_CDN}${asset?.images[0]?.path}`
                            : ""
                        }
                        id={asset["id"]}
                      />
                    ) : header === "catogory" ||
                      header === "genres" ? (
                      asset[header]?.join(", ")
                    ) : header === "showId" ||
                      header === "seasonId" ? (
                      objectOfIdsNames[asset[header]] ?? "--"
                    ) : header === "v_has_draft" ? (
                      asset[header] ? (
                        "Yes"
                      ) : (
                        "No"
                      )
                    ) : (
                      asset[header] ?? "--"
                    )}
                  </td>
                );
              })}

              {/* Actions */}
              <td className="px-3.5 py-2.5 sticky right-0 bg-white border">
                <div className="flex justify-end gap-2 items-center">
                  {asset.v_status.toUpperCase() === "PUBLISHED" && (
                    <Link
                      to={`/assets/${type}/published/${asset.id}`}
                      title={`View ${asset.title}`}
                    >
                      <Eye size={15} className="text-mb-blue" />
                    </Link>
                  )}

                  {access?.edit && (
                    <Link
                      to={`/assets/${type}/draft/${asset.id}`}
                      title={`Edit ${asset.title}`}
                    >
                      <Edit size={15} className="text-mb-blue" />
                    </Link>
                  )}

                  {access?.delete && (
                    <button
                      onClick={() => {
                        setSelectedId(asset.id);
                        setOpenDeleteViewPopup(true);
                      }}
                      title={`Delete ${asset.title}`}
                    >
                      <Trash size={15} className="text-red-500" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
