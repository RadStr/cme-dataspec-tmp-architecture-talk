import React, { ReactNode, useContext } from "react";
import { getConnectedEdges, useReactFlow } from "reactflow";

export type HighlightContextType = {
    highlightLevels: Record<string, number>;
    setHighlightLevels: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

export const HighlightContext = React.createContext(null as unknown as HighlightContextType);


export const useHighlightContext = () => {
    const { highlightLevels, setHighlightLevels } = useContext(HighlightContext);
    const reactFlowInstance = useReactFlow();

    const changeHighlight = (startingNodeId: string) => {
        const newHighlightLevelsMap = { [startingNodeId]: 0 };
        const reactflowNode = reactFlowInstance.getNode(startingNodeId);

        if(reactflowNode === undefined) {
            return;
        }
        const connectedEdges = getConnectedEdges([reactflowNode], reactFlowInstance.getEdges());
        connectedEdges.forEach(edge => {
            const otherNode = reactFlowInstance.getNode(edge.source === startingNodeId ? edge.target : edge.source);

            if(otherNode === undefined || otherNode.id === startingNodeId) {
                return;
            }
            newHighlightLevelsMap[otherNode.id] = 1;
        });


        setHighlightLevels(newHighlightLevelsMap);
    };

    const resetHighlight = () => {
        setHighlightLevels({});
    };

    return { highlightLevels, resetHighlight, changeHighlight };
};
