import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Banknote, Flame } from "lucide-react";
import { CreditsManagement } from "./CreditsManagement";
import { WithdrawalsManagement } from "./WithdrawalsManagement";
import { PointsBurnReport } from "./PointsBurnReport";

export const WinnerPointsManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("credits");

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="credits" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Créditos</span>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Banknote className="w-4 h-4" />
            <span className="hidden sm:inline">Retiros</span>
          </TabsTrigger>
          <TabsTrigger value="burns" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Quema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="mt-4">
          <CreditsManagement />
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <WithdrawalsManagement />
        </TabsContent>

        <TabsContent value="burns" className="mt-4">
          <PointsBurnReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
