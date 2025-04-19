import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useGetIntegration } from "../../api/useGetIntegration";
import { IntegrationInformation, UpdateableIntegrationInformation } from "../../../../common/IntegrationInformation";
import PageMeta from "../../components/common/PageMeta";
import { IntegrationForm } from "./IntegrationForm";
import { IntegrationStaus } from "./IntegrationStatus";
import { useParams } from "react-router";
import { useUpdateIntegration } from "../../api/useUpdateIntegration";
import toast from "react-hot-toast";

export const IntegrationPage: FunctionComponent = () => {
  const { id } = useParams()
  
  const getIntegration = useGetIntegration();
  const updateIntegraion = useUpdateIntegration();

  const [integrationInfo, setIntegrationInfo] = useState<IntegrationInformation | undefined>();

  useEffect(() => {
    getIntegration(id!).then((integration) => {
      setIntegrationInfo(integration);
    });
  }, [id]);

  const onInfoUpdate = useCallback(async (newInfo: UpdateableIntegrationInformation) => {
    const confirmedInfo = await updateIntegraion(id!, newInfo);
    setIntegrationInfo(confirmedInfo);
    toast("Successfully updated.");
  }, [id]);

  return (
    <div>
      <PageMeta
        title={integrationInfo?.name ?? "Integration"}
        description="Information on Integrations."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <IntegrationForm integration={integrationInfo} onSubmit={onInfoUpdate} />
        </div>
        <div className="space-y-6">
          <IntegrationStaus integration={integrationInfo} />
        </div>
      </div>
    </div>
  )
}
