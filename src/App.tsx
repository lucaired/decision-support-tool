import * as React from 'react';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import './App.css';
import DecisionTreeHandler from './components/Tree/DecisionTreeHandler';
import {ForgeViewer} from "./components/ForgeViewer/viewer";

function App() {
  return (
    <div className="App">
        <Box>
            <Card variant="outlined">
                <React.Fragment>
                    <CardContent>
                        <DecisionTreeHandler/>
                    </CardContent>
                </React.Fragment>
            </Card>
        </Box>
        <Box>
            <Card variant="outlined">
            <React.Fragment>
                <CardContent>
                    <ForgeViewer
                        local={true}
                        path={'http://localhost:3000/0.svf'}
                        //urn={urn}
                        //testing={true}
                        //token={token}
                        style={{
                            maxWidth: '600px',
                            maxHeight: '500px'
                        }}
                    />
                </CardContent>
            </React.Fragment>
        </Card>
        </Box>
    </div>
  );
}

export default App;
