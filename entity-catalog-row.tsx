import { useState } from "react";
import type { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityProxy } from "../../util/detail-utils";
import { useConfigurationContext } from "../../context/configuration-context";
import { IriLink } from "../iri-link";
import {
    CreateProfileButton,
    DrawOnCanvasButton,
    ExpandButton,
    OpenDetailButton,
    RemoveButton,
} from "../buttons";
import { onDragStart } from "../../reactflow/utils";
import { useCanvasVisibility } from "../../util/canvas-utils";
import { useDialogsContext } from "../../context/dialogs-context";
import { MoveViewportToEntityButton } from "../buttons/center-viewport-on-entity";

import "./entity-catalog-row.css";
import { useHighlightContext } from "../../context/highlight-context";

const TreeLikeOffset = (props: { offset?: number }) => {
    const { offset } = props;
    if (!offset || offset <= 0) {
        return;
    }
    return <span style={{ marginLeft: (offset - 1) * 12 }}>└-</span>;
};

export const EntityRow = (props: {
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;
    expandable: null | {
        toggleHandler: () => void;
        expanded: () => boolean;
    };
    drawable: null | {
        addToViewHandler: () => void;
        removeFromViewHandler: () => void;
    };
    removable: null | {
        remove: () => void;
    };
    targetable: null | {
        centerViewportOnEntityHandler: () => void;
        isTargetable: boolean;
    };

    sourceModel?: EntityModel;
    offset?: number;
}) => {
    const { openDetailDialog, openModificationDialog, openProfileDialog } = useDialogsContext();
    const { language: preferredLanguage } = useConfigurationContext();

    const { entity, offset, drawable, expandable, removable, sourceModel } = props;
    const { name, iri } = EntityProxy(entity, preferredLanguage);

    const [isExpanded, setIsExpanded] = useState(expandable?.expanded());
    const { isOnCanvas } = useCanvasVisibility(entity.id);
    const isDraggable = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);

    const sourceModelIsLocal = sourceModel instanceof InMemorySemanticModel;




    const { highlightLevels, changeHighlight, resetHighlight } = useHighlightContext();

    let classNamesSuffix = "";
    let classNames = "flex flex-row justify-between whitespace-nowrap hover:shadow";
    if(Object.values(highlightLevels).length === 0) {
        classNamesSuffix = "";
    }
    else {
        if(highlightLevels[entity.id] === 0) {
            classNamesSuffix = " target-highlight";
        }
        else if(highlightLevels[entity.id] === 1) {
            classNames = "flex flex-row justify-between whitespace-nowrap hover:shadow";
        }
        else {
            classNamesSuffix = " target-opposite-highlight";
        }
    }

    return (
        <div
            className={classNames + classNamesSuffix}
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e as unknown as DragEvent, entity.id, "classNode")}
            onMouseEnter={(event) => changeHighlight(entity.id)}
            onMouseLeave={(event) => resetHighlight()}
        >
            <span className="overflow-x-clip" title={iri ?? ""}>
                <IriLink iri={iri} />
                <TreeLikeOffset offset={offset} />
                {name}
            </span>
            <div className="ml-2 flex flex-row px-1 ">
                {expandable && (
                    <ExpandButton
                        onClickHandler={() => {
                            expandable?.toggleHandler();
                            setIsExpanded(expandable?.expanded());
                        }}
                        isExpanded={isExpanded}
                    />
                )}
                {removable && <RemoveButton onClickHandler={removable.remove} />}
                {sourceModelIsLocal && (
                    <button className="hover:bg-teal-400" title="Modify" onClick={() => openModificationDialog(entity, sourceModel)}>
                        ✏
                    </button>
                )}
                <OpenDetailButton onClick={() => openDetailDialog(entity)} />
                {drawable && (
                    <DrawOnCanvasButton
                        visible={isOnCanvas}
                        addToCanvas={drawable?.addToViewHandler}
                        removeFromCanvas={drawable?.removeFromViewHandler}
                    />
                )}
                <CreateProfileButton onClickHandler={() => openProfileDialog(entity)} />
                {props.targetable?.isTargetable && <MoveViewportToEntityButton disabled={!isOnCanvas} onClick={props.targetable?.centerViewportOnEntityHandler} />}
            </div>
        </div>
    );
};
