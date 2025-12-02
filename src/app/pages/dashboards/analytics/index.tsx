// Local Imports
import { Page } from "@/components/shared/Page";
import { AnalyticsReport } from "./Statistics/Analytics";

// ----------------------------------------------------------------------

export default function Analytics() {
  return (
    <Page title="Analytics Dashboard">
      <div className="transition-content overflow-hidden px-(--margin-x) pb-8">
        <div className="mt-4 grid grid-cols-12 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
         <AnalyticsReport/>
        </div>
      </div>
    </Page>
  );
}
