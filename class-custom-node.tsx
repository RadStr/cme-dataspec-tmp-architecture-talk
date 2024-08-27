import { Handle, Position, type XYPosition, type Node, useNodeId } from "reactflow";
import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { useModelGraphContext } from "../context/model-context";
import { useMemo } from "react";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { EntityProxy } from "../util/detail-utils";
import { useMenuOptions } from "./components/menu-options";
import { ClassNodeAttributeRow, ThreeDotsRow } from "./components/attribute-row";
import { ClassNodeHeader } from "./components/class-node-header";
import { useDialogsContext } from "../context/dialogs-context";
import { usePrefixForIri } from "../service/prefix-service";
import { useHighlightContext } from "../context/highlight-context";

export type ClassCustomNodeDataType = {
    cls: SemanticModelClass | SemanticModelClassUsage;
    color: string | undefined;
    attributes: SemanticModelRelationship[];
    attributeUsages: SemanticModelRelationshipUsage[];
};

export const ClassCustomNode = (props: { data: ClassCustomNodeDataType }) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { models, aggregatorView } = useModelGraphContext();
    const { deleteEntityFromModel } = useClassesContext();
    const { MenuOptions, isMenuOptionsOpen, openMenuOptions } = useMenuOptions();
    const { openDetailDialog, openModificationDialog, openProfileDialog } = useDialogsContext();

    const { cls, attributes, attributeUsages, color } = props.data;

    const clr = color ?? "#ffffff";

    const model = useMemo(() => sourceModelOfEntity(cls.id, [...models.values()]), [cls.id, models]);

    const { name, description, iri, profileOf } = EntityProxy(cls, preferredLanguage);

    const handleRemoveEntityFromActiveView = () => {
        aggregatorView.getActiveVisualModel()?.updateEntity(cls.id, { visible: false });
    };

    const isModelLocal = model instanceof InMemorySemanticModel;


    // TODO: Doesn't work properly - reactflow doesn't know the actual size right now - meaning the size together with handlers
    // TODO: (interesting that it knows the width but not the height)
    // const nodeId = useNodeId();
    // const { highlightLevels } = useHighlightContext();
    // const style: Record<string, string> = {};
    // if(Object.values(highlightLevels).length > 0 && nodeId !== null) {
    //     if(highlightLevels[nodeId] === 0) {
    //         style["backgroundColor"] = "rgba(238, 58, 115, 1)";
    //     }
    //     else if(highlightLevels[nodeId] === undefined) {
    //         style["opacity"] = "0.2";
    //     }
    //     else {
    //         style["backgroundColor"] = "rgba(238, 158, 215, 1)";
    //     }
    // }

    return (
        <>
            {/* <div style={style}> */}
            <div
                className="relative m-1 min-h-14 min-w-56 border border-black bg-white [&]:text-sm"
                onDoubleClick={(e) => {
                    openMenuOptions();
                    e.stopPropagation();
                }}
            >
                <ClassNodeHeader name={name} description={description} isProfileOf={profileOf} color={clr} />

                <p className="overflow-x-clip text-gray-500">{usePrefixForIri(iri)}</p>

                <div key={"attributes" + attributes.length.toString()} className="max-h-44 overflow-x-auto ">
                    <>
                        {attributes?.slice(0, 5).map((attr) => (
                            <ClassNodeAttributeRow key={attr.id + cls.id} attribute={attr} />
                        ))}
                        {attributes.length >= 5 && <ThreeDotsRow onClickHandler={() => openDetailDialog(cls)} />}
                        {attributeUsages?.slice(0, 5).map((attr) => (
                            <ClassNodeAttributeRow key={attr.id + cls.id} attribute={attr} />
                        ))}
                        {attributeUsages.length >= 5 && <ThreeDotsRow onClickHandler={() => openDetailDialog(cls)} />}
                    </>
                </div>
            </div>
            {isMenuOptionsOpen && (
                <MenuOptions
                    position="absolute right-2 top-2 z-10"
                    openDetailHandler={() => openDetailDialog(cls)}
                    createProfileHandler={() => openProfileDialog(cls)}
                    removeFromViewHandler={handleRemoveEntityFromActiveView}
                    modifyHandler={isModelLocal ? () => openModificationDialog(cls, model) : undefined}
                    deleteHandler={isModelLocal ? () => deleteEntityFromModel(model, cls.id) : undefined}
                />
            )}
            <Handle type="source" position={Position.Top} id="sa">
                s
            </Handle>
            <Handle type="source" position={Position.Bottom} id="sc">
                s
            </Handle>
            <Handle type="target" position={Position.Right} id="tb">
                t
            </Handle>
            <Handle type="target" position={Position.Left} id="td">
                t
            </Handle>
            <Handle type="source" position={Position.Right} id="s-self" />
            <Handle type="target" position={Position.Right} id="t-self" />
            {/* </div> */}
        </>
    );
};

/**
 *
 * @param id VisualEntityId
 * @param cls
 * @param position
 * @param color
 * @returns
 */
export const semanticModelClassToReactFlowNode = (
    id: string,
    cls: SemanticModelClass | SemanticModelClassUsage,
    position: XYPosition,
    color: string | undefined,
    attributes: SemanticModelRelationship[],

    attributeUsages: SemanticModelRelationshipUsage[]
) =>
    ({
        id: id,
        position: position ?? { x: 69, y: 420 },
        data: {
            cls,
            color,
            attributes,
            attributeUsages,
        } satisfies ClassCustomNodeDataType,
        type: "classCustomNode",
    } as Node);
