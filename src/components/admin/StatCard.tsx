import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    tooltip?: string;
}

export function StatCard({ title, value, subtitle, icon, color, tooltip }: StatCardProps) {
    return (
        <Card className={`border-l-4 ${color}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 font-medium">{title}</p>
                            {tooltip && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs max-w-xs">{tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
