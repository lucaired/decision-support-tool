import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { DecisionTree } from '../Tree/NodeHandler';
import SvgIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

interface ButtonAppBarProps {
    activeVariant?: DecisionTree;
    activeProject?: object;
    toggleLeftDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    showDesignEpisodeMatchingModalHandler: (open: boolean) => void;
    // @ts-ignore
    saveCurrentProject: () => void;
}

export default function ButtonAppBar({activeVariant, activeProject, toggleLeftDrawer, showDesignEpisodeMatchingModalHandler, saveCurrentProject}: ButtonAppBarProps) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleLeftDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          {activeProject && <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* @ts-ignore */}
          {`Project: ${activeProject.name}`}
          </Typography>}
          {activeVariant && <Typography variant="h6" component="div">
            {`Variant: ${activeVariant.name}`}
          </Typography>}
          {activeProject && 
          <Button 
            variant="contained"
            style={{marginLeft: '15px', backgroundColor: 'white'}}
          >
              <SvgIcon
                  color='primary'
                  onClick={() => saveCurrentProject()}
                  component={SaveIcon}
              />
          </Button>}
          {activeVariant && <Button 
            variant="contained"
            style={{marginLeft: '15px', backgroundColor: 'white'}}
          >
              <SvgIcon
                  color='primary'
                  onClick={() => showDesignEpisodeMatchingModalHandler(true)}
                  component={ManageSearchIcon}
              />
          </Button>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}