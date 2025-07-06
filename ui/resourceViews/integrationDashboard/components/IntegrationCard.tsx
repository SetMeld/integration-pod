import { FunctionComponent } from "react";
import { IntegrationInformation } from "../../../../common/IntegrationInformation";
import { Badge } from "~/components/ui/badge";
import { useNavigate } from "react-router";
import { TouchableOpacity, View } from "react-native";
import { Card } from "~/components/ui/card";

export const IntegrationCard: FunctionComponent<{
  integration: IntegrationInformation
}> = ({ integration }) => {
  const navigate = useNavigate();

  return (
    <TouchableOpacity onPress={() => navigate(`/.integration/integration/${integration.id}`)}>
      <Card className='w-full max-w-sm' >
        <View className="flex items-end justify-between mt-0">
          <View>
            <span
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              <Badge>
                {integration.status.type === "ok" ? "Ok" : "Error"}
              </Badge>
              {integration.status.type === "error" ? integration.status.message : ""}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {integration.name}
            </h4>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}
