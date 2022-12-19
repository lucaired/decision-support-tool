import Button from "@mui/material/Button";
import * as React from "react";

function VariantExplorerMenu() {
    return <div
        style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            gap: "5px",
            marginBottom: "15px"
        }}>
        <Button variant="contained">BIM visualization</Button>
        <Button variant="contained">Design Rationale</Button>
        <Button variant="contained">GWP Evaluation</Button>
        <Button variant="contained">Objective Evaluation</Button>
    </div>;
}
export default VariantExplorerMenu