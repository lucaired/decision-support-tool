import React from "react";
import NeoGraph from "./NeoGraph";
import Button from "@mui/material/Button";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import Modal from "@mui/material/Modal";
import {Box} from "@mui/material";

// You have to be connected to TUM VPN to make this work
let NEO4J_URI = process.env.REACT_APP_DE_NEO4J_URL || "10.195.6.112";
NEO4J_URI = `"neo4j://${NEO4J_URI}:7687";`
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "123";

const DesignEpisode = () => {
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    const style = {
        position: 'absolute' as 'absolute',
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper'
    };

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Button
                    style={{justifyContent: 'end'}}
                    onClick={() => handleOpen()}
                    startIcon={<OpenInFullIcon/>}
                />
                <NeoGraph
                    width={'900px'}
                    height={'550px'}
                    containerId={"id1"}
                    neo4jUri={NEO4J_URI}
                    neo4jUser={NEO4J_USER}
                    neo4jPassword={NEO4J_PASSWORD}
                    backgroundColor={"#ffffff"}
                />
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <Button
                            style={{justifyContent: 'end'}}
                            onClick={() => handleClose()}
                            startIcon={<CloseFullscreenIcon/>}
                        />
                    </div>
                    <NeoGraph
                        containerId={"id2"}
                        width={'100%'}
                        height={'100%'}
                        neo4jUri={NEO4J_URI}
                        neo4jUser={NEO4J_USER}
                        neo4jPassword={NEO4J_PASSWORD}
                        backgroundColor={"#ffffff"}
                    />
                </Box>
            </Modal>
        </div>
    );
};

export default DesignEpisode;