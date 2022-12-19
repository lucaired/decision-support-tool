import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './App.css';
import DecisionTreeHandler from './components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "./components/ForgeViewer/viewer";
import VariantExplorerMenu from "./components/VariantExplorerMenu";
import Evaluation from "./components/GWP/Evaluation";

function App() {
  return (
    <div className="App" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    }}>
        <Box>
            <Card variant="outlined">
                <React.Fragment>
                    <CardContent
                        style={{
                            height: '430px'
                        }}
                    >
                        <DecisionTreeHandler/>
                    </CardContent>
                </React.Fragment>
            </Card>
        </Box>
        <Box>
            <Card variant="outlined">
                <React.Fragment>
                    <CardContent
                        style={{
                            height: '440px'
                        }}
                    >
                        <VariantExplorerMenu/>
                        <Evaluation neo4JReference={"AC-20-Smiley-West-10-Bldg.ifc"}/>
                        {/* TODO: load stuff depending on the click here
                            - implement state for the menu and clicked button there
                            -
                        <ForgeViewer
                            local={true}
                            path={'http://localhost:3000/0.svf'}
                            //urn={urn}
                            //testing={true}
                            //token={token}
                        />
                        */}
                    </CardContent>
                </React.Fragment>
            </Card>
        </Box>
    </div>
  );
}

export default App;
