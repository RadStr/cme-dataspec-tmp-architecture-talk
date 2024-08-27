import { ReactNode, useState } from "react";
import { HighlightContext, useHighlightContext } from "./highlight-context";

export const HighlightContextProvider = (props: { children: ReactNode }) => {
    const [highlightLevels, setHighlightLevels]  = useState<Record<string, number>>({});

    return <HighlightContext.Provider value={{ highlightLevels, setHighlightLevels }}>
                {props.children}
            </HighlightContext.Provider>;
};