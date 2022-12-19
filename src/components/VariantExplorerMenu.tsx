import Button from "@mui/material/Button";
import * as React from "react";

// @ts-ignore
function VariantExplorerMenu({activeVariantExplorationHandler}) {
    function VariantExplorerMenuButton(label: string, index: number) {
        return <Button key={`variant-explorer-menu${index}`} onClick={()=> activeVariantExplorationHandler(index)} variant="contained">
            {label}
        </Button>;
    }

    const labels = ["BIM visualization", "GWP Evaluation", "Design Rationale", "Objective Evaluation"]

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