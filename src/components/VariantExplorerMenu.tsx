import Button from "@mui/material/Button";
import * as React from "react";

// @ts-ignore
function VariantExplorerMenu({activeVariantExplorationHandler, activeVariantExplorationIndex}) {
    const labels = ["BIM visualization", "GWP Evaluation", "Design Rationale", "Subjective Evaluation", "Objective Evaluation"]

    function VariantExplorerMenuButton(label: string, index: number) {
        return <Button
            key={`variant-explorer-menu${index}`} onClick={()=> activeVariantExplorationHandler(index)}
            variant={activeVariantExplorationIndex === index ? "outlined" : "contained"}
        >
            {label}
        </Button>;
    }

    return <div
        style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            gap: "5px",
            marginBottom: "15px"
        }}>
        {labels.map((label, index) => VariantExplorerMenuButton(label,index))}
    </div>;
}
export default VariantExplorerMenu