// Import Dependencies

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Radio,
    RadioGroup,
    Transition,
} from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, useEffect, useState, } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";


// Local Imports
import { Button, Card } from "@/components/ui";
import { getDashboardData } from "@/helpers/mb-api_helper";

// ----------------------------------------------------------------------

const chartBaseConfig: ApexOptions = {
    chart: {
        toolbar: { show: false }
    },
    colors: ["#4ade80", "#f43f5e", "#a855f7"],
    plotOptions: {
        radialBar: {
            hollow: {
                size: "35%",
            },
            dataLabels: {
                name: {
                    fontSize: "18px",
                },
                value: {
                    fontSize: "14px",
                },
                total: {
                    show: true,
                    label: "Total",
                    formatter: (w) => {
                        return w.config.series.reduce((a: number, b: number) => a + b, 0);
                    }
                }
            }
        }
    },
    stroke: {
        lineCap: "round",
    },
};


type TabType = "assets" | "media" | "cms" | "rules" | "ads" | "drafts";

export function AnalyticsReport() {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>("assets");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiData = await getDashboardData();
                console.log("Dashboard Data:", apiData);
                setData(apiData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchData();
    }, []);




    if (!data) return <div>Loading...</div>;

    // Convert API result → Apex radial chart values
    const computeSeries = () => {
        switch (activeTab) {
            case "assets":
                return data?.assetsStats?.map((i: any) => i.count) ?? [];

            case "media":
                return data?.mediaStats?.map((i: any) => i.count) ?? [];

            case "cms":
                return data?.cmsStats?.map((i: any) => i.count) ?? [];

            case "rules":
                return data.entRulesCounts ? [data.entRulesCounts] : [0];

            case "ads":
                return data.entAdsRulesCounts ? [data.entAdsRulesCounts] : [0];

            case "drafts":
                return data?.
                    draftAssetStats
                    ?.map((i: any) => i.count);

            default:
                return [0];
        }
    };

    const computeLabels = () => {
        switch (activeTab) {
            case "assets":
                return data?.assetsStats?.map((i: any) => i.type) ?? [];

            case "media":
                return data?.mediaStats?.map((i: any) => i.type) ?? [];

            case "cms":
                return data?.cmsStats?.map((i: any) => i.type) ?? [];

            case "rules":
                return ["Rules"];

            case "ads":
                return ["Ads"];

            case "drafts":
                return data?.draftAssetStats?.map((i: any) => i.type) ?? [];

            default:
                return [];
        }
    };


    const series = computeSeries();
    const labels = computeLabels();

    const finalSeries = series.length ? series : [0];
    const finalLabels = labels.length ? labels : ["No Data"];

    const chartConfig: ApexOptions = {
        ...chartBaseConfig,
        labels: finalLabels,
    };

    const getTabDetails = () => {
        switch (activeTab) {
            case "assets":
                return data?.assetsStats ?? [];

            case "media":
                return data?.mediaStats ?? [];

            case "cms":
                return data?.cmsStats ?? [];

            case "drafts":
                return data?.draftAssetStats ?? [];

            case "rules":
                return [{ type: "Rules", count: data?.entRulesCounts ?? 0 }];

            case "ads":
                return [{ type: "Ads", count: data?.entAdsRulesCounts ?? 0 }];

            default:
                return [];
        }
    };



    return (
        <Card className="col-span-12">
            <div className="mt-3 flex flex-col justify-between gap-2 px-4 sm:flex-row sm:items-center sm:px-5">
                <div className="flex flex-1 items-center justify-between space-x-2 sm:flex-initial">
                    <h2 className="text-sm-plus dark:text-dark-100 font-medium tracking-wide text-gray-800">
                        Analytics Report
                    </h2>
                    <ActionMenu />
                </div>

                <RadioGroup
                    name="tabs"
                    value={activeTab}
                    onChange={setActiveTab}
                    className="flex flex-wrap -space-x-px"
                >
                    {["assets", "media", "cms", "rules", "ads", "drafts"].map((tab) => (
                        <Radio
                            key={tab}
                            as={Button}
                            unstyled
                            value={tab}
                            className={({ checked }: any) =>
                                //   clsx(
                                //     "text-xs-plus h-8 border border-gray-300 px-3 text-gray-800",
                                //     checked ? "bg-gray-200" : "bg-white"
                                //   )

                                clsx(
                                    "text-xs-plus dark:border-dark-450 dark:text-dark-100 h-8 border border-gray-300 px-3 text-gray-800 first:ltr:rounded-l-lg last:ltr:rounded-r-lg first:rtl:rounded-r-lg last:rtl:rounded-l-lg",
                                    checked && "dark:bg-surface-2 bg-gray-200",
                                )
                            }
                        >
                            {tab.toUpperCase()}
                        </Radio>
                    ))}
                </RadioGroup>
            </div>
            <div className="flex flex-wrap gap-4 p-4">
                <Chart
                    height="250"
                    type="radialBar"
                    series={finalSeries}
                    options={chartConfig}
                />

                <div className="flex flex-col gap-2 lg:gap-4">
                    <h3 className="text-sm lg:text-lg font-semibold">Details</h3>

                    <div className="flex flex-wrap gap-5">
                        {getTabDetails().length === 0 && (
                            <p className="text-gray-500 text-xs">No data available</p>
                        )}

                        {getTabDetails().map((item: any) => (
                            <div
                                key={item.type}
                                className="border rounded-lg px-3 py-2 bg-gray-50 dark:bg-dark-600"
                            >
                                <p className="text-xs text-gray-600 dark:text-dark-200">
                                    {item.type}
                                </p>
                                <p className="text-lg font-bold">{item.count}</p>
                            </div>
                        ))}</div>
                </div>


            </div>
        </Card>
    );
}

function ActionMenu() {
    return (
        <Menu
            as="div"
            className="relative inline-block text-left ltr:-mr-1.5 rtl:-ml-1.5"
        >
            <MenuButton
                as={Button}
                variant="flat"
                isIcon
                className="size-8 rounded-full"
            >
                <EllipsisHorizontalIcon className="size-5" />
            </MenuButton>
            <Transition
                as={Fragment}
                enter="transition ease-out"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
            >
                <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 sm:ltr:left-0 rtl:left-0 sm:rtl:right-0 dark:shadow-none">
                    <MenuItem>
                        {({ focus }) => (
                            <button
                                className={clsx(
                                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                                    focus &&
                                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                                )}
                            >
                                <span>Action</span>
                            </button>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ focus }) => (
                            <button
                                className={clsx(
                                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                                    focus &&
                                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                                )}
                            >
                                <span>Another action</span>
                            </button>
                        )}
                    </MenuItem>
                    <MenuItem>
                        {({ focus }) => (
                            <button
                                className={clsx(
                                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                                    focus &&
                                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                                )}
                            >
                                <span>Other action</span>
                            </button>
                        )}
                    </MenuItem>

                    <hr className="border-gray-150 dark:border-dark-500 mx-3 my-1.5 h-px" />

                    <MenuItem>
                        {({ focus }) => (
                            <button
                                className={clsx(
                                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                                    focus &&
                                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                                )}
                            >
                                <span>Separated action</span>
                            </button>
                        )}
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    );
}
