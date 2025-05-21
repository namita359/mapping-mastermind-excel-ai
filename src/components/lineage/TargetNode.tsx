
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface TargetNodeProps {
  data: {
    label: string;
    columns?: string[];
  };
}

const TargetNode = memo(({ data }: TargetNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-200 min-w-[150px]">
      <div className="flex items-center">
        <div className="ml-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="font-bold text-green-500 cursor-help">
                {data.label}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">Target: {data.label}</h4>
                {data.columns && data.columns.length > 0 && (
                  <>
                    <p className="text-sm font-medium">Columns:</p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {data.columns.slice(0, 10).map((col, i) => (
                        <li key={i}>{col}</li>
                      ))}
                      {data.columns.length > 10 && (
                        <li className="text-muted-foreground">
                          +{data.columns.length - 10} more
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
});

TargetNode.displayName = 'TargetNode';

export default TargetNode;
