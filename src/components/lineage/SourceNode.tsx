
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface SourceNodeProps {
  data: {
    label: string;
    columns?: string[];
    pod?: string;
    malcode?: string;
  };
}

const SourceNode = memo(({ data }: SourceNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-200 min-w-[150px]">
      <div className="flex items-center">
        <div className="ml-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="font-bold text-blue-500 cursor-help">
                {data.label}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">Source: {data.label}</h4>
                {data.pod && <p className="text-sm">Pod: {data.pod}</p>}
                {data.malcode && <p className="text-sm">Malcode: {data.malcode}</p>}
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
          {(data.pod || data.malcode) && (
            <div className="text-xs text-gray-500">
              {data.pod && `Pod: ${data.pod}`}
              {data.pod && data.malcode && " | "}
              {data.malcode && `Malcode: ${data.malcode}`}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

SourceNode.displayName = 'SourceNode';

export default SourceNode;
