import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './App.css';
import DecisionTreeHandler from './components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "./components/ForgeViewer/viewer";
import Button from "@mui/material/Button";

function App() {
  return (
    <div className="App">
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
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: '15px'
                            }}>
                                <Button variant="contained">BIM visualization</Button>
                                <Button variant="contained">Design Rationale</Button>
                                <Button variant="contained">Building Performance Evaluation</Button>
                                <Button variant="contained">Objective Evaluation</Button>
                        </div>

                        <ForgeViewer
                            local={true}
                            path={'http://localhost:3000/0.svf'}
                            //urn={urn}
                            //testing={true}
                            //token={token}
                        />
                    </CardContent>
                </React.Fragment>
            </Card>
        </Box>
    </div>
  );
}

export default App;
